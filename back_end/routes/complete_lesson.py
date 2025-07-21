from flask import Blueprint, request, jsonify, current_app
from firebase_admin import auth as firebase_auth, firestore
from back_end.extensions.firebase import db

complete_bp = Blueprint('complete_bp', __name__)

@complete_bp.route(
    '/api/courses/<course_id>/modules/<module_id>/lessons/<lesson_id>/complete',
    methods=['POST']
)
def complete_lesson(course_id, module_id, lesson_id):
    # 1) Verify and decode the Firebase ID token
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({ 'message': 'Missing Authorization header' }), 401

    id_token = auth_header.split('Bearer ')[1]
    try:
        decoded = firebase_auth.verify_id_token(id_token)
        uid = decoded['uid']
    except Exception as e:
        current_app.logger.error(f'Invalid token: {e!r}')
        return jsonify({ 'message': 'Invalid auth token' }), 401

    # 2) References to the lesson and course docs
    lesson_ref = (
        db.collection('users').document(uid)
          .collection('courses').document(course_id)
          .collection('modules').document(module_id)
          .collection('lessons').document(lesson_id)
    )
    course_ref = db.collection('users').document(uid).collection('courses').document(course_id)

    try:
        # 3) Mark the lesson complete
        lesson_ref.update({ 'completed': True })

        # 4) Increment the counter of completedLessons
        course_ref.update({ 'completedLessons': firestore.Increment(1) })

    except Exception as e:
        current_app.logger.error(f'Firestore update failed: {e!r}')
        return jsonify({ 'message': 'Could not update lesson status' }), 500

    return jsonify({ 'message': 'Lesson marked complete' }), 200
