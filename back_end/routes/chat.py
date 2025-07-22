from flask import Blueprint, request, Response, stream_with_context, current_app, jsonify
import firebase_admin
from firebase_admin import auth as firebase_auth, firestore
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
import time
from back_end.extensions.firebase import db

chat_bp = Blueprint('chat_bp', __name__)

# Initialize Firestore client once

@chat_bp.route("/api/chat", methods=['POST'])
def chat():
    # 1) Verify Firebase ID token
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
    
    # 2) Extract message history and reference
    payload = request.get_json(silent=True) or {}
    raw_msgs = payload.get('messages', [])
    reference = payload.get('reference', {})
    if not isinstance(raw_msgs, list):
        return jsonify({"error": "'messages' must be a list"}), 400

    # 3) Fetch context from Firestore
    context_parts = []
    course_id = reference.get('courseId')
    module_id = reference.get('moduleId')
    lesson_id = reference.get('lessonId')
    print(reference)

    try:
        course_ref = db.collection('users').document(uid) \
                        .collection('courses').document(course_id)
        course_doc = course_ref.get()
        context_parts.append(f"Course Topic: {course_doc.get('topic')}")
        
        module_ref = course_ref.collection('modules').document(module_id)
        module_doc = module_ref.get()
        context_parts.append(f"Module Title: {module_doc.get('title')}")

        lesson_ref = module_ref.collection('lessons').document(lesson_id)
        lesson_doc = lesson_ref.get()
        context_parts.append(
            f"""Lesson Title: {lesson_doc.get('title')}\n
                Type: {lesson_doc.get('type')}\n
                Description: {'None'}\n
                """
        )

        content_ref = lesson_ref.collection('content').document('body')
        content_doc = content_ref.get()
        context_parts.append(f'Content:\n{content_doc.get('content') if lesson_doc.get('type') != "video" else 'video content'}')
    except Exception as e:
        # Log or handle Firestore errors
        current_app.logger.error(f"Error fetching reference data: {e}")

    # Combine into single prompt context (truncate or chunk if needed)
    full_context = "\n\n---\n\n".join(context_parts)
    # Prepend as a system message
    template = """
    You are an expert instructor on the given lesson.
    Interact with the user to uphold a fluid, informative conversation.
    Include markdown language for headings, subheadings, lists, and code if relevant.
    Wrap math equations with '$$' for blocks and '$' for inline. Lines with '$$' are to have no other characters on the same line.
    Here is the lesson context. Use it to support the user:
    {context}
    """

    prompt = template.format(context=full_context)
    chain_msgs = [SystemMessage(content=prompt)]

    # Convert user/AI history
    for m in raw_msgs:
        if m.get('from') == 'user':
            chain_msgs.append(HumanMessage(content=m.get('text', '')))
        else:
            chain_msgs.append(AIMessage(content=m.get('text', '')))

    # 4) Stream LLM response
    llm = current_app.config['CHAT_MODEL']
    def generate():
        for chunk in llm.stream(chain_msgs, user=uid):
            yield chunk.content.encode('utf-8')
            time.sleep(0.01)

    return Response(stream_with_context(generate()), mimetype='text/plain')
