import uvicorn
from fastapi import FastAPI,HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient

import os
from dotenv import load_dotenv

from pwdlib import PasswordHash
from bson import ObjectId

import time
import random
import re

from modules import *


class userdata(BaseModel):
    name:str
    phone:str
    email:str
    password:str


class logindata(BaseModel):
    email:str
    password:str


class mail(BaseModel):
    email:str


app = FastAPI()


load_dotenv()
m_url = os.getenv("m_url")
client = MongoClient(m_url)
db = client["parknest"]
users = db["users"] 
profile = db["profile"]
passwordhash = PasswordHash.recommended()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def root():
    return {"message": "Backend is running"}

@app.post("/login")
async def login(data: logindata):
    curr_user = users.find_one({"email": data.email})
    if(not curr_user):
        raise HTTPException(status_code=404, detail="User not found")

    elif(passwordhash.verify(data.password, curr_user["password"])):
        token = token_generator(str(curr_user["_id"]))
        return {"name": curr_user["name"], "token": token}
    else:
        raise HTTPException(status_code=401, detail="Invalid password")


@app.get("/send_otp")
def send_otp(data: mail):
    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if re.match(email_regex, data.email.strip()):
        otp = str(random.randint(100000, 999999))
        send_email(data.email, "OTP for ParkNest", f"Your OTP is: {otp}")
        return {"detail": "ok"}
    else:
        raise HTTPException(status_code=400, detail="Invalid email format")




if __name__ == "__main__":
    uvicorn.run("main:app",host="127.0.0.1",port = 8000,reload=True)