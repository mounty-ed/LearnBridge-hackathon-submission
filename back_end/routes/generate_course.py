from flask import Blueprint, request, jsonify, current_app
from back_end.extensions.firebase import db
from datetime import datetime, timezone
import time
from back_end.tasks.worker import generate_reading_content, generate_test_content, generate_video_content, generate_assignment_content
from langchain_openai import ChatOpenAI
from langchain.output_parsers.pydantic import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Literal
from back_end.utils.firestore import _delete_course
from firebase_admin import auth as firebase_auth, firestore

generate_course_bp = Blueprint('course', __name__)

class LessonOutline(BaseModel):
    title: str
    type: Literal["reading", "test", "video", "unit test", "assignment"] = Field(..., description="The type of lesson (must be 'reading', 'test', 'unit test', 'video', or 'assignment')")
    description: str = Field(..., description="A short but thorough description of the lesson that matches with the type of the lesson. no more than 2 sentences.")

class ModuleOutline(BaseModel):
    title: str
    lessons: List[LessonOutline]

class CourseOutline(BaseModel):
    modules: List[ModuleOutline]

@generate_course_bp.route('/api/generate/course', methods=['POST'])
def course():
    # Verify Firebase ID token
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({"error": "Missing or malformed Authorization header"}), 401

    id_token = auth_header.split('Bearer ')[1]
    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        uid = decoded_token['uid']
    except Exception as e:
        current_app.logger.error(f"Token verify failed: {e}")
        return jsonify({"error": "Invalid auth token", "details": str(e)}), 401

    data = request.get_json()
    title       = data['title']
    topic       = data['topic']
    num_mod     = data['modules']
    min_lessons = current_app.config['MIN_LESSONS']
    max_lessons = current_app.config['MAX_LESSONS']

    types       = data['types']
    print(types)

    allowed = ["reading", "unit test", "test"]
    if types.get("tests"):
        allowed.append("test")
    if types.get("videos"):
        allowed.append("video")
    if types.get("assignments"):
        allowed.append("assignment")
    print(allowed)

    if num_mod > 8:
            return jsonify({"error": "Too many modules"}), 404

    # generate outline
    BASE_MODEL = current_app.config['MODEL']
    OPENROUTER_API_KEY = current_app.config['OPENROUTER_API_KEY']
    outline_parser = PydanticOutputParser(pydantic_object=CourseOutline)
    llm = ChatOpenAI(
        model=BASE_MODEL,
        api_key=OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
        max_completion_tokens=2000,
    ).with_structured_output(CourseOutline, method="json_schema")

    outline_prompt = f"""
    Generate a cohesive and slow, progressive course outline on **{topic}** with {num_mod} modules.
    Each module should list {min_lessons}-{max_lessons} lesson titles.
    Only create meaningful lesson titles that accurately describe the desirable content (do not add 'Unit Test:' at the beginning of a unit test, only return the test topic).
    Ensure there is at least one unit test at the end of each module.
    When generating a video lesson outline, don't choose a topic that is too niche.
    Only choose assignment type when relevant to the topic. Titles and descriptions should accurately describe the assignment.
    You are not required to include all lesson types in one module, but lesson type variety is encouraged. Choose the lesson type based on the cohesiveness and flow of learning of the course (unit test is required).
    Do NOT generate any lesson whose type is not in {allowed}.
    Return JSON matching:
    {outline_parser.get_format_instructions()}
    """
    resp = llm.invoke([
        {"role":"system","content":"You are a course outline generator."},
        {"role":"user","content":outline_prompt}
    ])
    outline: CourseOutline = CourseOutline.model_validate(resp)

    for mod in outline.modules:
        mod.lessons = [lesson for lesson in mod.lessons if lesson.type in allowed]

    print('outline: ', outline)

    # persist outline & enqueue lesson tasks
    timestamp   = str(int(time.time()))
    course_ref  = db.collection('users').document(uid).collection('courses').document(timestamp)
    modules_ref = course_ref.collection('modules')

    # compute total lessons (including one Unit Test per module)
    total_lessons = sum(len(mod.lessons) for mod in outline.modules)

    # save metadata and initialize progress tracking
    course_ref.set({
        "id": timestamp,
        "title": title,
        "topic": topic,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "uid": uid,
        "totalLessons": total_lessons,
        "generatedLessons": 0,
        "completedLessons": 0,
        "deleted": False,
        "error": None
    })

    for mi, mod in enumerate(outline.modules, start=1):
        mod_id = str(mi)
        modules_ref.document(mod_id).set({"title": mod.title})
        lessons_ref = modules_ref.document(mod_id).collection('lessons')

        for li, lesson in enumerate(mod.lessons, start=1):
            lesson_id = str(li)
            lessons_ref.document(lesson_id).set({
                "title": lesson.title,
                "type": lesson.type,
                "completed": False,
                "description": lesson.description,
            })
            if lesson.type == "reading":
                generate_reading_content.apply_async(kwargs={
                    "uid": uid,
                    "course_id": timestamp,
                    "module_id": mod_id,
                    "lesson_id": lesson_id,
                    "lesson_title": lesson.title,
                    "topic": topic,
                    "mod_title": mod.title,
                    "lesson_description": lesson.description
                })
            elif lesson.type == "test" or lesson.type == "unit test":
                lesson_titles = [lesson.title for lesson in mod.lessons]
                generate_test_content.apply_async(kwargs={
                    "uid": uid,
                    "course_id": timestamp,
                    "module_id": mod_id,
                    "lesson_id": lesson_id,
                    "topic": topic,
                    "lesson_titles": lesson_titles if lesson.type == "unit test" else None,
                    "mod_title": mod.title,
                    "lesson_description": lesson.description
                })
            elif lesson.type == "video":
                generate_video_content.apply_async(kwargs={
                    "uid": uid,
                    "course_id": timestamp,
                    "module_id": mod_id,
                    "lesson_id": lesson_id,
                    "lesson_title": lesson.title,
                    "topic": topic,
                    "mod_title": mod.title,
                    "lesson_description": lesson.description
                })
            elif lesson.type == "assignment":
                generate_assignment_content.apply_async(kwargs={
                    "uid": uid,
                    "course_id": timestamp,
                    "module_id": mod_id,
                    "lesson_id": lesson_id,
                    "lesson_title": lesson.title,
                    "topic": topic,
                    "mod_title": mod.title,
                    "lesson_description": lesson.description
                })

    return jsonify({"id": timestamp}), 202
