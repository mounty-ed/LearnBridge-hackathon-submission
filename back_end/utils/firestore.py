# back_end/utils/firestore.py

from back_end.extensions.firebase import db

def _delete_course(uid: str, course_id: str):
    """
    Delete /users/{uid}/courses/{course_id} and all nested modules & lessons.
    """
    course_ref = (
        db.collection('users')
          .document(uid)
          .collection('courses')
          .document(course_id)
    )

    # delete all modules & lessons
    for mod_ref in course_ref.collection('modules').list_documents():
        for lesson_ref in mod_ref.collection('lessons').list_documents():
            lesson_ref.delete()
        mod_ref.delete()

    # delete the course document itself
    course_ref.delete()
