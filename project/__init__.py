# project/__init__.py

from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from project.config import BaseConfig
import datetime, json, sys, collections, requests, smtplib

# config

app = Flask(__name__)
app.config.from_object(BaseConfig)

bcrypt = Bcrypt(app)
db = SQLAlchemy(app)

from project.models import User, List
from crontab import CronTab
from multiprocessing import Pool

def cronjob():
    cron = CronTab()
    job = cron.new(command = 'curl http://127.0.0.1:5000/api/reminder', comment = "Reminding all users of jobs to be completed today.")
    job.setall('0 0 * * *')
    job.run()

pool = Pool(processes = 1)
pool.apply_async(cronjob,[]) 

def send_mail(recipient, message):
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login("reminderfortodo@gmail.com", "todo@practo")
    server.sendmail("reminderfortodo@gmail.com", recipient, message)
    server.quit()

# routes

@app.route('/')
def index():
    return app.send_static_file('index.html')

# Remind all user of current day's task
@app.route('/api/reminder', methods = ['GET'])
def remind():
    all_users = User.query.all()
    today_date = unicode(datetime.date.today())
    for user in all_users:
        task_list = user.tasks.all()
        count = 1
        message = "Here are the list of things to do by today:\n"
        for task in task_list:
            deadline = unicode(task.deadline)[0:10]
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
    	status = 'success'
    except:
    	status = 'user already exists'

    db.session.close()
    return jsonify({'result' : status})


@app.route('/api/login', methods=['POST'])
def login():
    json_data = request.json
    user = User.query.filter_by(email = json_data['email']).first()

    if user and bcrypt.check_password_hash(user.password, json_data['password']):
    	session['logged_in'] = True
    	status = 'success'
    else:
    	status = 'authentication error'

    return jsonify({'result' : status})


@app.route('/api/logout', methods=['GET'])
def logout():
    json_data = request.json
    session.pop('logged_in', None)
    return jsonify({'result' : 'success'})

@app.route('/api/status', methods = ['GET'])
def status():
    if session.get('logged_in'):
        if session['logged_in'] == True:
            return jsonify({'status' : True})
    else:
        return jsonify({'status' : False})

@app.route('/api/list/<user_id>', methods = ['GET','POST'])
def api_todo_list(user_id):
    if request.method == 'GET':
        all_tasks_for_user =  User.query.filter_by(id = user_id).first().tasks.all() 
        list_of_tasks = []

        for task in all_tasks_for_user:
            d = collections.OrderedDict()
            d['task'] = task.task
            d['deadline'] = unicode(task.deadline)
            list_of_tasks.append(d)

        return jsonify({'task_list' : json.dumps(list_of_tasks)})
    else:
        json_data = request.json
        date = int(json_data['deadline_date'])
        month = int(json_data['deadline_month'])
        year = int(json_data['deadline_year'])
        deadline = datetime.date(year,month,date)
        owner = User.query.filter_by(id = user_id).first()

        task = List(task = json_data['task'], deadline = deadline, owner = owner)

        try:
            db.session.add(task)
            db.session.commit()
            status = 'success'
        except:
            status = 'unable to record task'

        db.session.close()
        return jsonify({'status' : status})

@app.route('/api/list/delete/<task_id>', methods = ['DELETE'])
def api_delete_task(task_id):
    try:
        to_delete = List.query.filter_by(id = task_id).first()
        
        if to_delete is not None:
            db.session.delete(to_delete)
            db.session.commit()
        status = 'success'
    except Exception as ex:
        status = 'error in deleting ' + task_id + ", Exception: " + ex

    return jsonify({'status' : status})

@app.route('/api/list/update/<task_id>',methods = ['PUT'])
def api_update_task(task_id):
    json_data = request.json
    try:
        to_update = List.query.filter_by(id = task_id).first()

        if to_update is not None:
            to_update.task = json_data['task']
            date = int(json_data['deadline_date'])
            month = int(json_data['deadline_month'])
            year = int(json_data['deadline_year'])
            deadline = datetime.date(year,month,date)
            to_update.deadline = deadline
            db.session.commit()
            status = 'success'
        else:
            status = 'no element with task_id = ' + task_id
    except Exception as ex:
        status = "Exception: " + ex 

    return jsonify({'status' : status})