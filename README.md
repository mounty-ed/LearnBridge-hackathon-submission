## Course Creation Website

An autonomous web application that generates courses, modules, and lessons based on user prompts, documents, or links. Leveraging a Flask backend with AI-driven content creation and a Next.js frontend, this project aims to streamline the course creation process.

---

### Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)

---

## Features

* **AI-Powered Content Generation:** Create courses, modules, and lessons using customizable AI models.
* **Multiple Lesson Types:** Support for readings, assignments, tests, and Youtube videos.
* **Structured Output:** Generates content in Markdown, organized by modules and lessons.
* **User Authentication:** Firebase Authentication for secure user access.

## Tech Stack

* **Backend:** Python, Flask, LangGraph agents, LangChain, OpenRouter LLM
* **Frontend:** Next.js, Material UI, React
* **Database:** Firebase Firestore
* **Search:** Tavily’s web search API
* **Authentication:** Firebase Auth

## Prerequisites

* Node.js (>=14.x)
* Python 3.8+
* Redis server (>=6.0) installed and running locally or accessible remotely
* Docker (optional, for running Redis via container)
* Firebase project with Firestore enabled
* Openrouter API key
* Tavily Search API key
* Youtube Data API key

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mounty-ed/course-creation-app.git
   cd course-creation-app
   ```

2. **Backend setup**

   ```bash
   cd back_end
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Frontend setup**

   ```bash
   cd front_end/my-app
   npm install
   ```

## Configuration

1. **Environment variables** (create a `.env` in `back_end`):

   ```env
   OPENROUTER_API_KEY=your_openrouter_key
   TAVILY_API_KEY=your_tavily_key
   BASE_MODEL=openai/gpt-4o-mini # For module and test generation (must support structured output)
   CHAT_MODEL=deepseek/deepseek-chat-v3-0324:free # For chat assistant
   LESSON_READING_MODEL=mistralai/ministral-8b # For lesson content generation
   YOUTUBE_API_KEY=your_youtube_key
   ```

2. **Firebase**

   * Ensure Firestore is enabled in your Firebase project.
   * Download service account JSON and set to `back_end`.

## Running the Application

1. **Start Redis** (if not already running):

   * **Locally:**

     ```bash
     redis-server
     ```
   * **Docker:**

     ```bash
     docker run -p 6379:6379 redis
     ```

2. **Start the backend** (in project root):

   ```bash
   cd back_end
   source venv/bin/activate
   cd ..
   python -m back_end.app
   ```

3. **Start Celery worker** (in project root):

   ```bash
   cd back_end
   source venv/bin/activate
   cd ..
   celery -A back_end.tasks.worker worker --loglevel=info
   ```

4. **Start the frontend** (in `front_end/my-app`):

   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to access the app.
