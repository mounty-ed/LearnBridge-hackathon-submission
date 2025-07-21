from flask import Blueprint, request, jsonify, current_app
from firebase_admin import auth as firebase_auth, firestore
from back_end.extensions.firebase import db

courses_bp = Blueprint('courses_bp', __name__)

def verify_token():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None, (jsonify(error='Missing Authorization header'), 401)
    id_token = auth_header.split()[1]
    try:
        decoded = firebase_auth.verify_id_token(id_token)
        return decoded['uid'], None
    except Exception as e:
        current_app.logger.warning(f'Token verification failed: {e!r}')
        return None, (jsonify(error='Invalid auth token'), 401)


@courses_bp.route('/api/courses/<course_id>/delete', methods=['POST'])
def delete_course(course_id):
    uid, err = verify_token()
    if err:
        return err

    course_ref = (
        db.collection('users').document(uid)
          .collection('courses').document(course_id)
    )

    try:
        # 3) Soft-delete the course
        course_ref.update({ 'deleted': True })
    except Exception as e:
        current_app.logger.error(f'Failed to delete course: {e!r}')
        return jsonify(error='Could not delete course'), 500

    return jsonify(message='Course marked as deleted'), 200


@courses_bp.route('/api/courses/<course_id>/restore', methods=['POST'])
def restore_course(course_id):
    uid, err = verify_token()
    if err:
        return err

    course_ref = db.collection('users').document(uid).collection('courses').document(course_id)
    try:
        course_ref.update({'deleted': False})
    except Exception as e:
        current_app.logger.error(f'Failed to restore course: {e!r}')
        return jsonify(error='Could not restore course'), 500

    return jsonify(message='Course restored successfully'), 200


@courses_bp.route('/api/courses/<course_id>/update-title', methods=['POST'])
def update_course_title(course_id):
    # 1) Verify Firebase ID token
    uid, err = verify_token()
    if err:
        return err

    # 2) Read new title from request body
    payload = request.get_json(silent=True) or {}
    new_title = payload.get('title')
    if not isinstance(new_title, str) or not new_title.strip():
        return jsonify(error='Invalid or missing title'), 400

    # 3) Reference the Firestore document
    course_ref = (
        db.collection('users').document(uid)
          .collection('courses').document(course_id)
    )

    # 4) Perform the update
    try:
        course_ref.update({'title': new_title})
    except Exception as e:
        current_app.logger.error(f'Failed to update title: {e!r}')
        return jsonify(error='Could not update title'), 500

    return jsonify(message='Title updated successfully'), 200