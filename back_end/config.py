import os
from dotenv import load_dotenv
load_dotenv()

from langchain_openai import ChatOpenAI

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
    MODEL = os.getenv("BASE_MODEL")
    TEST_MODEL = ChatOpenAI(
        model=os.getenv("BASE_MODEL"),
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url="https://openrouter.ai/api/v1",
    )
    LESSON_READING_MODEL = ChatOpenAI(
        model=os.getenv("LESSON_READING_MODEL"),
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url="https://openrouter.ai/api/v1",
    )
    CHAT_MODEL = ChatOpenAI(
        model=os.getenv("CHAT_MODEL"),
        streaming=True,
        stream_usage=True,
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url="https://openrouter.ai/api/v1",
    )
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
    NUM_QUESTIONS = 5
    MIN_WORDS = 600
    MIN_LESSONS = 3
    MAX_LESSONS = 8




