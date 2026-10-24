import os
from pymongo import MongoClient
from dotenv import load_dotenv
from pprint import pprint
load_dotenv()

client = MongoClient(os.getenv("m_url"))
db = client["parknest"]
users = db["users"]

"""users.insert_one({
    "email": "test@",
    "password": "Test1234!"
})

print("Inserted sample user")"""
for user in users.find():
    pprint(user)