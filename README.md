## Course Creation Website – *Learnbridge*

**Learnbridge** is an autonomous, AI-powered web application built to provide *free and meaningful education to all*. Designed with social good in mind, it allows users to generate high-quality, structured courses with minimal effort. Powered by a Flask backend and a Next.js frontend, Learnbridge bridges the gap between learners and accessible education through intelligent automation.

---


### Table of Contents

1. [Purpose](#purpose)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Running the Application](#running-the-application)

---

### 🌍 Purpose

Learnbridge was created with the mission of democratizing education. By automating the course creation process using advanced AI agenttic workflows, Learnbridge makes it easier for anyone—from educators to independent learners—to generate comprehensive learning experiences without cost or technical knowledge.

## 🚀 Features

* **AI-Powered Course Generation**
  Create entire course structures based on a topic and syllabus, automatically generating modules and detailed lessons.

* **Sequential Multi-Step Agent Pipeline**
  A custom orchestration agent decomposes tasks and coordinates lesson creation through a structured, modular flow.

* **Reliable, Scalable Lesson Creation**
  Each lesson is processed asynchronously using Celery background tasks—improving speed and avoiding memory/time limits during generation.

* **Contextual Chatbot Assistant**
  Learners can interact with a personal assistant that uses short-term memory and current lesson content to provide relevant, real-time support.

* **Agentic Web Tooling with Citations**
  Integrated web search and retrieval agents enhance lessons with verified sources, including cited information and relevant YouTube videos via a custom scoring system.

* **Multiple Lesson Types**
  Supports diverse lesson content such as readings, quizzes, assignments, and enriched video resources.

* **Structured Markdown Output**
  All generated content is cleanly formatted in Markdown, making it easy to render, export, or modify.

* **User Authentication**
  Firebase Authentication ensures secure, personalized access for learners and creators.

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
   source .venv/bin/activate
   cd ..
   python -m back_end.app
   ```

3. **Start Celery worker** (in project root):

   ```bash
   cd back_end
   source .venv/bin/activate
   cd ..
   celery -A back_end.tasks.worker worker --loglevel=info
   ```

4. **Start the frontend** (in `front_end/my-app`):

   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to access the app.
