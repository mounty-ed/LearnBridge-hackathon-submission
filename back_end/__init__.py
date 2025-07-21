import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config.from_object('back_end.config.Config')

    # Ensure the upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Enable CORS
    CORS(app, origins=["http://localhost:3000"])

    # Register blueprints
    from back_end.routes.retrieve_lesson_content import retrieve_lesson_bp
    from back_end.routes.generate_course import generate_course_bp
    from back_end.routes.chat import chat_bp
    from back_end.routes.complete_lesson import complete_bp
    from back_end.routes.courses import courses_bp

    app.register_blueprint(courses_bp)
    app.register_blueprint(complete_bp)
    app.register_blueprint(generate_course_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(retrieve_lesson_bp)

    return app
