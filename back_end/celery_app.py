from celery import Celery
from flask import Flask
import os
from back_end.config import Config

# pick up your Flask config (including REDIS_URL)
def make_celery_app():
    flask_app = Flask(__name__, instance_relative_config=True)
    flask_app.config.from_object(Config)

    celery = Celery(
        flask_app.import_name,
        broker=flask_app.config['REDIS_URL'],
        backend=flask_app.config['REDIS_URL']
    )
    celery.conf.update(flask_app.config)
    TaskBase = celery.Task

    class ContextTask(TaskBase):
        def __call__(self, *args, **kwargs):
            with flask_app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)

    celery.Task = ContextTask
    return celery

celery = make_celery_app()
