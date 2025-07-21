from flask import Blueprint, request, jsonify, current_app
from back_end.extensions.firebase import db
from google.cloud.firestore_v1 import DocumentSnapshot
from firebase_admin import auth as firebase_auth

retrieve_lesson_bp = Blueprint("retrieve_lesson_bp", __name__)

@retrieve_lesson_bp.route(
    "/api/retrieve/courses/<course_id>/modules/<module_id>/lessons/<lesson_id>",
    methods=["GET"],
)
def get_lesson_content(course_id, module_id, lesson_id):
    try:
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
        
        # 1) Lesson document ref
        lesson_ref = (
            db.collection("users").document(uid)
              .collection("courses").document(course_id)
              .collection("modules").document(module_id)
              .collection("lessons").document(lesson_id)
        )
        lesson_snap: DocumentSnapshot = lesson_ref.get()
        if not lesson_snap.exists:
            return jsonify({"error": "Lesson not found"}), 404

        lesson_data = lesson_snap.to_dict()

        content_ref = lesson_ref.collection("content").document("body")
        content_snap: DocumentSnapshot = content_ref.get()

        if content_snap.exists:
            content_dict = content_snap.to_dict()
            lesson_data["content"] = content_dict.get("content")
            if "citations" in content_dict:
                lesson_data["citations"] = content_dict.get("citations")
        else:
            lesson_data["content"] = None

        return jsonify(lesson_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
