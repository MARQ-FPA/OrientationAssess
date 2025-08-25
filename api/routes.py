
from flask import Blueprint, request, jsonify, g, current_app
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import urllib
import pandas as pd
from datetime import datetime
import importlib
import random

api_blueprint = Blueprint('api', __name__)

from config import DEV, ALLOWED_TENANTS

def get_error(e):
    if DEV:
        return str(e)
    else:
        return "An error occurred"

# Function to get a database connection
def get_db(database, scope="read"):

    if DEV:
         svr='MARQDAPROD001'
         return create_engine('mssql+pyodbc:///?odbc_connect='+urllib.parse.quote(F'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={svr};DATABASE={database};Trusted_Connection=yes'), 
            fast_executemany=True, connect_args={'connect_timeout': 10}, echo=False)
    else:
        username = None
        password = None
        server = os.getenv("PROD_SQL_IP", None)

        if scope == "read":
            username = os.getenv("PROD_SQL_Read_User", None)
            password = os.getenv("PROD_SQL_Read_Password", None)
        elif scope == "write":
            username = os.getenv("PROD_SQL_Write_User", None)
            password = os.getenv("PROD_SQL_Write_Password", None)
        
        if username is None or password is None or server is None or database is None:
            raise Exception("Database credentials not found.")
        
        quoted = urllib.parse.quote(
            f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}"
        )
        return create_engine(
            f"mssql+pyodbc:///?odbc_connect={quoted}",
            fast_executemany=True,
            connect_args={"connect_timeout": 10},
            echo=False,
        )


# This function authenticates the user


def get_questions_list():
    questions_module = importlib.import_module('questions')
    # Reload to ensure it's up-to-date
    importlib.reload(questions_module)
    return questions_module

@api_blueprint.route('/questions', methods=['GET'])
def questions():
    questions=get_questions_list().orientation_assessment
    # from questions, drop the key in each answer named 'score'
    for question in questions:
        for answer in question["answers"]:
            answer.pop('score', None)
    for question in questions:
        random.shuffle(question["answers"])
    return jsonify(questions)

@api_blueprint.route('/submit', methods=['POST'])
def submit():
    data = request.get_json()
    questions = get_questions_list().orientation_assessment
    submission=data['questions']
    user = data.get('user', 'Unknown User')

    for sub in submission:
        score=0
        for question in questions:
            if sub['Question'] == question['question']:
                for answer in question['answers']:
                    if '~;~' in sub['Answer']:
                        answers=sub['Answer'].split('~;~')
                        for ans in answers:
                            if ans == answer['answer']:
                                score+=answer['score']
                    else:
                    
                        if sub['Answer'] == answer['answer']:
                            score+=answer['score']
        sub['score']=score
     
    df=pd.DataFrame(submission)
    df['Date']=datetime.now()
    df['User']=user
    df.to_sql(con=get_db("WEB_TOOLS", "write"),name='Orientation_Assessment',if_exists='append',schema='dbo',index=False,chunksize=None)
    return jsonify({'message': 'Submitted successfully'})