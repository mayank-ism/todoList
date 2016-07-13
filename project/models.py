# project/models.py

import datetime
from project import db, bcrypt


class User(db.Model):

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    registered_on = db.Column(db.DateTime, nullable=False)
    admin = db.Column(db.Boolean, nullable=False, default=False)
    tasks = db.relationship('List', backref = 'owner', lazy = 'dynamic')
    # my_task.owner.email gives the email id which is associated with my_task (type: List)
    def __init__(self, email, password, admin=False):
        self.email = email
        self.password = bcrypt.generate_password_hash(password)
        self.registered_on = datetime.datetime.now()
        self.admin = admin

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return self.id

    def __repr__(self):
        return '<User {0}>'.format(self.email)

class List(db.Model):

    __tablename__ = "todo"

    id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    task = db.Column(db.String(140), nullable = False)
    deadline = db.Column(db.String(10), nullable = False)
    completed = db.Column(db.Boolean, nullable = False, default = False)
    owner_id = db.Column(db.Integer,db.ForeignKey('users.id'), nullable = False)
