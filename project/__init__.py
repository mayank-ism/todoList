# project/__init__.py

from flask import Flask, request, jsonify, session, redirect
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from project.config import BaseConfig
import datetime, json, collections, requests, smtplib

# config

app = Flask(__name__)
app.config.from_object(BaseConfig)

bcrypt = Bcrypt(app)
db = SQLAlchemy(app)

from project.models import User, List

def send_mail(recipient, message):
  server = smtplib.SMTP('smtp.gmail.com', 587)
  server.starttls()
  email = ""
  password = ""
  server.login(email, password)
  server.sendmail("reminderfortodo@gmail.com", recipient, message)
  server.quit()

# routes

@app.route('/')
def index():
  return app.send_static_file('index.html')

@app.route('/todolist')
def render_todo():
  if session.get('logged_in'):
    return app.send_static_file('partials/todolist.html')
  else:
    return redirect('/#/login')

# Remind all user of current day's task
@app.route('/api/reminder', methods = ['GET'])
def remind():
  all_users = User.query.all()
  today_date = unicode(datetime.date.today()).split('-')
  today_date.reverse()
  today_date = '-'.join(today_date)

  for user in all_users:
    task_list = user.tasks.all()
    count = 1
    message = "Here are the list of things to do by today:\n"
    for task in task_list:
      deadline = unicode(task.deadline)
      if deadline == today_date:
         message = message + "{0}) {1}".format(count,task.task)
         count = count + 1

    if count != 1:
      send_mail(user.email, message)

  return jsonify({'status' : 'success'})

@app.route('/api/register', methods=['POST'])
def register():
  json_data = request.json
  user = User(email = json_data['email'], password = json_data['password'])
  try:
    db.session.add(user)
    db.session.commit()
    success = True
    message = 'success'
  except:
    success = False
    message = 'user already exists'

  db.session.close()
  return jsonify({'result' : success, 'message' : message})


@app.route('/api/login', methods=['POST'])
def login():
  json_data = request.json
  user = User.query.filter_by(email = json_data['email']).first()

  if user and bcrypt.check_password_hash(user.password, json_data['password']):
    session['logged_in'] = True
    session['user_id'] = user.id
    success = True
    message = 'success'
  else:
    success = False
    message = 'authentication error'

  return jsonify({'result' : success, 'message' : message})


@app.route('/api/logout', methods=['GET'])
def logout():
  session.pop('logged_in', None)
  session.pop('user_id', None)
  return jsonify({'result' : True})

@app.route('/api/status', methods = ['GET'])
def status():
  if session.get('logged_in'):
    if session['logged_in'] == True:
      return jsonify({'status' : True})
  else:
    return jsonify({'status' : False})

@app.route('/api/list', methods = ['GET','POST'])
def api_todo_list():
  if session.get('user_id'):
    user_id = session['user_id']
    if request.method == 'GET':
      all_tasks_for_user =  User.query.filter_by(id = user_id).first().tasks.all()
      list_of_tasks = []

      for task in all_tasks_for_user:
        d = collections.OrderedDict()
        d['task'] = task.task
        d['deadline'] = task.deadline
        d['id'] = task.id
        d['completed'] = task.completed
        list_of_tasks.append(d)

      return jsonify({'task_list' : list_of_tasks})
    else:
      json_data = request.json
      deadline = json_data['deadline'] # deadline should be in format dd-mm-yyyy
      owner = User.query.filter_by(id = user_id).first()

      task = List(task = json_data['task'], deadline = deadline, owner = owner)

      try:
        db.session.add(task)
        db.session.commit()
        message = 'success'
        success = True
        task_id = task.id
      except:
        message = 'unable to record task'
        success = False
        task_id = -1

      db.session.close()
      return jsonify({'status' : success, 'message' : message, 'task_id' : task_id})
  else:
    return jsonify({'status' : False, 'message' : "user must be logged in"})

@app.route('/api/list/delete/<task_id>', methods = ['DELETE'])
def api_delete_task(task_id):
  try:
    to_delete = List.query.filter_by(id = task_id).first()

    if to_delete is not None:
      db.session.delete(to_delete)
      db.session.commit()
      message = 'success'
    else:
      message = 'no element with task_id: ' + task_id
    success = True
  except Exception as ex:
    message = 'error in deleting ' + task_id + ", Exception: " + ex
    success = False

  return jsonify({'status' : success, 'message' : message})

@app.route('/api/list/update/<task_id>',methods = ['PATCH'])
def api_update_task(task_id):
  json_data = request.json
  try:
    to_update = List.query.filter_by(id = task_id).first()

    if to_update is not None:
      if 'task' in json_data:
        to_update.task = json_data['task']

      if 'deadline' in json_data:
        to_update.deadline = json_data['deadline']

      if 'completed' in json_data:
        to_update.completed = json_data['completed']

      db.session.commit()
      message = 'success'
      success = True
    else:
      message = 'no element with task_id = ' + task_id
      success = False
  except Exception as ex:
    message = "Exception: " + ex
    success = False

  return jsonify({'status' : success, 'message' : message})
