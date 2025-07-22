from back_end.celery_app import celery
from back_end.extensions.firebase import db
from back_end.utils.firestore import _delete_course 
from flask import current_app
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
import backoff
from openai import RateLimitError, OpenAIError
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Dict
from datetime import datetime, timezone
from google.cloud.firestore import Increment
from googleapiclient.discovery import build
import backoff
from googleapiclient.errors import HttpError
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain.agents import initialize_agent, AgentExecutor, tool


@backoff.on_exception(backoff.expo, (RateLimitError, OpenAIError), factor=20, max_tries=2)
def call_assignment_agent(agent, prompt):
    resp = agent.invoke({
        "messages": [
            {"role": "system", "content": "You are a detailed lesson writer."},
            {"role": "user", "content": prompt}
        ]
    })
    return resp

@celery.task(bind=True, name="generate_reading_content")
def generate_assignment_content(self, uid: str, course_id: str, module_id: str, lesson_id: str, lesson_title: str, topic: str, mod_title: str, lesson_description: str):
    llm = current_app.config['LESSON_READING_MODEL']
    prompt = f"""
    You are an expert instructor on {topic} and specifically {mod_title}.
    Write an in-depth, well-structured informative assignment for **{lesson_title}** based on this description:
    {lesson_description}

    **CLEARLY DEFINE THE TASK** the user has to perform for the user to gain necessary practice.
    Include markdown language for headings, subheadings, lists, and code if relevant.
    Include examples if relevant.
    Math equations are to be wrapped with '$$' for blocks and '$' for inline. Lines with '$$' are to have no other characters on the same line.
    Only return the task for the user. No comments.
    """
    agent = create_react_agent(model=llm, tools=[])

    lesson_ref = db.collection("users").document(uid) \
                   .collection("courses").document(course_id) \
                   .collection("modules").document(module_id) \
                   .collection("lessons").document(lesson_id)
    course_ref = db.collection("users").document(uid) \
                   .collection("courses").document(course_id)

    try:
        resp = agent.invoke({
            "messages": [
                {"role": "system", "content": "You are a detailed lesson writer."},
                {"role": "user", "content": prompt}
            ]
        })
        content = resp["messages"][-1].content

        content_doc = lesson_ref.collection("content").document("body")
        content_doc.set({
            "content": content
        }, merge=True)


        # update status and counters
        course_ref.set({"generatedLessons": Increment(1)}, merge=True)
        return {"status": "ok", "lesson_id": lesson_id}
    except Exception as e:
        db.collection('users').document(uid) \
          .collection('generation_errors').document(course_id) \
          .set({'error': str(e), 'failedAt': datetime.now(timezone.utc).isoformat()})
        _delete_course(uid, course_id)
        raise


@backoff.on_exception(backoff.expo, HttpError, max_tries=3, factor=2)
def search_youtube_videos(
    query: str,
    api_key: str,
    max_results: int = 10,
    video_duration: str = "medium",
) -> List[Dict]:
    youtube = build("youtube", "v3", developerKey=api_key)
    all_items = []
    seen_ids = set()

    # 1) build params dict
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "videoEmbeddable": "true",
        "maxResults": max_results,
        "order": "viewCount",
        "videoDuration": video_duration,
    }

    # 2) execute the search with those params
    resp = youtube.search().list(**params).execute()
    for item in resp.get("items", []):
        vid = item["id"]["videoId"]
        if vid not in seen_ids:
            seen_ids.add(vid)
            all_items.append(item)

    return all_items

@backoff.on_exception(backoff.expo, HttpError, max_tries=3, factor=2)
def fetch_video_stats(api_key: str, video_ids: List[str]) -> Dict[str, Dict]:
    """
    Returns a mapping videoId -> { viewCount: int, likeCount: int, ... }
    """
    youtube = build("youtube", "v3", developerKey=api_key)
    resp = youtube.videos().list(
        part="statistics",
        id=",".join(video_ids),
        maxResults=len(video_ids)
    ).execute()
    stats = {}
    for item in resp.get("items", []):
        stats[item["id"]] = {
            "viewCount": int(item["statistics"].get("viewCount", 0)),
            "likeCount": int(item["statistics"].get("likeCount", 0)),
        }
    return stats

def score_video(snippet: Dict, stat: Dict) -> float:
    """
    Simple score combining recency and popularity:
      - More recent → higher score
      - More views → higher score
    """
    # recency factor: days since published, capped at 30 days
    published_at = datetime.fromisoformat(snippet["publishedAt"].replace("Z", "+00:00"))
    age_days = (datetime.now(timezone.utc) - published_at).days
    recency_score = max(0, 365*5 - age_days)  # 0–5 years, then clamps at 0

    view_score = stat["viewCount"] / 1000.0  # 1 point per 1,000 views
    return recency_score * 1 + view_score * 1.2

@celery.task(bind=True, name="generate_video_content")
def generate_video_content(
    self,
    uid: str,
    course_id: str,
    module_id: str,
    lesson_id: str,
    lesson_title: str,
    topic: str,
    mod_title: str,
    lesson_description: str
):
    YOUTUBE_API_KEY = current_app.config['YOUTUBE_API_KEY']

    lesson_ref = (
        db.collection("users").document(uid)
          .collection("courses").document(course_id)
          .collection("modules").document(module_id)
          .collection("lessons").document(lesson_id)
    )
    course_ref = (
        db.collection("users").document(uid)
          .collection("courses").document(course_id)
    )

    try:
        query = f"{mod_title} - {lesson_title}"
        videos = search_youtube_videos(
            query=query,
            api_key=YOUTUBE_API_KEY,
            max_results=10,
            video_duration="medium"
        )
        if not videos:
            raise ValueError(f"No videos found for '{query}'")

        # 2) Fetch stats in bulk
        ids = [v["id"]["videoId"] for v in videos]
        stats_map = fetch_video_stats(YOUTUBE_API_KEY, ids)

        # 3) Score & pick the best
        best = max(
            videos,
            key=lambda v: score_video(v["snippet"], stats_map.get(v["id"]["videoId"], {"viewCount":0}))
        )

        vid_id = best["id"]["videoId"]
        snip  = best["snippet"]

        # 4) Build payload
        video_content = {
            "videoId":    vid_id,
            "title":      snip["title"],
            "description": snip["description"],
            "thumbnail":  snip["thumbnails"]["high"]["url"],
            "url":        f"https://www.youtube.com/watch?v={vid_id}",
        }

        # 5) Persist to Firestore
        lesson_ref.collection("content").document("body").set(
            {"content": video_content}, merge=True
        )
        # 6) Increment generated counter
        course_ref.set({"generatedLessons": Increment(1)}, merge=True)

    except Exception as e:
        # Log failure and clean up
        db.collection("users").document(uid) \
          .collection("generation_errors").document(course_id) \
          .set({
            "error":    str(e),
            "failedAt": datetime.now(timezone.utc).isoformat()
          })
        # Optionally delete course if critical
        _delete_course(uid, course_id)
        raise



class QuestionItem(BaseModel):
    question: str = Field(description="The question text")
    choices: List[str] = Field(description="The list of answer choices")
    answer: str = Field(description="The correct answer out of the choices")
    explanation: str = Field(description="The explanation for the correct answer")

class ResponseList(BaseModel):
    questions: List[QuestionItem]

@backoff.on_exception(backoff.expo, (RateLimitError, OpenAIError), factor=20, max_tries=2)
def call_test_agent(agent, prompt):
    output = agent.invoke(
        {"messages":[
            {"role": "system", "content": "You are a helpful multiple choice generator"},
            {"role":"user","content": prompt}
        ]},
        config={"recursion_limit": 50}
    )
    result: ResponseList = output["structured_response"]
    content = [q.model_dump() for q in result.questions]
    return content

@celery.task(bind=True, name="generate_test_content")
def generate_test_content(self, uid: str, course_id: str, module_id: str, lesson_id: str, topic: str, lesson_titles: list[str], mod_title: str, lesson_description: str):
    NUM_QUESTIONS   = current_app.config['NUM_QUESTIONS']
    parser          = PydanticOutputParser(pydantic_object=ResponseList)

    prompt = f"""
    You are an expert instructor on {topic}
    Generate exactly {NUM_QUESTIONS} multiple-choice questions with 6 answer choices each on {mod_title} and based on this description:
    {lesson_description}

    
    {"Make sure to cover all the topics in this list {lesson_titles}" if lesson_titles else None}
    
    **Strictly** output JSON matching the given schema.

    {parser.get_format_instructions()}

    Ensure that:
    - Choices are mutually exclusive.
    - Each question is unique. NO DUPLICATES.
    - Explanations are brief (max 2 sentences).
    """

    llm = current_app.config['TEST_MODEL']
    agent = create_react_agent(model=llm, tools=[], response_format=ResponseList)

    lesson_ref = db.collection("users").document(uid) \
                   .collection("courses").document(course_id) \
                   .collection("modules").document(module_id) \
                   .collection("lessons").document(lesson_id)
    course_ref = db.collection("users").document(uid) \
                   .collection("courses").document(course_id)

    try:
        content = call_test_agent(agent, prompt)

        content_doc = lesson_ref.collection("content").document("body")
        content_doc.set({
            "content": content
        }, merge=True)

        course_ref.set({"generatedLessons": Increment(1)}, merge=True)
    except Exception as e:
        db.collection('users').document(uid) \
          .collection('generation_errors').document(course_id) \
          .set({'error': str(e), 'failedAt': datetime.now(timezone.utc).isoformat()})
        _delete_course(uid, course_id)
        raise



@celery.task(bind=True, name="generate_reading_content")
def generate_reading_content(self, uid: str, course_id: str, module_id: str, lesson_id: str, lesson_title: str, topic: str, mod_title: str, lesson_description: str):
    MINIMUM_WORDS      = current_app.config['MIN_WORDS']

    llm = current_app.config['LESSON_READING_MODEL']

    prompt = f"""
    You are an expert instructor on {topic} and specifically {mod_title}.
    Write an in-depth, well-structured informative textbook passage for **{lesson_title}** of at least {MINIMUM_WORDS} words based on this description:
    {lesson_description}

    Call the tool to retrieve relevant context on the web.
    DO NOT include any assignments or tasks in the content. Only information.
    Include markdown language for headings, subheadings, lists, and code if relevant.
    Include examples, word definitions, and long detailed explanations if relevant.
    Wrap math equations with '$$' for blocks and '$' for inline. Lines with '$$' are to have no other characters on the same line
    Only return the textbook passage content. No comments.
    """

    citations = []
    search_tool = TavilySearchResults(
        api_key=current_app.config['TAVILY_API_KEY'], 
        max_results=10, 
        search_depth='advanced'
    )

    @tool
    def retrieve_context(query: str) -> str:
        """Use this to retrieve relevant context on the web for test generation."""
        search_results = search_tool.invoke(query)
        citation = [
            {"title": res["title"], "url": res["url"]}
            for res in search_results
            if "title" in res and "url" in res
        ]
        citations.extend(citation)
        return "\n\n".join(
            f"{res.get('title', '')}\n{res.get('content', '')}"
            for res in search_results
            if "content" in res
        )

    agent = create_react_agent(model=llm, tools=[retrieve_context])

    lesson_ref = db.collection("users").document(uid) \
                   .collection("courses").document(course_id) \
                   .collection("modules").document(module_id) \
                   .collection("lessons").document(lesson_id)
    course_ref = db.collection("users").document(uid) \
                   .collection("courses").document(course_id)

    try:
        resp = agent.invoke({
            "messages": [
                {"role": "system", "content": "You are a detailed lesson writer."},
                {"role": "user", "content": prompt}
            ]
        })
        content = resp["messages"][-1].content

        content_doc = lesson_ref.collection("content").document("body")
        content_doc.set({
            "content": content,
            "citations": citations,
        }, merge=True)


        # update status and counters
        course_ref.set({"generatedLessons": Increment(1)}, merge=True)
        return {"status": "ok", "lesson_id": lesson_id}
    except Exception as e:
        db.collection('users').document(uid) \
          .collection('generation_errors').document(course_id) \
          .set({'error': str(e), 'failedAt': datetime.now(timezone.utc).isoformat()})
        _delete_course(uid, course_id)
        raise
