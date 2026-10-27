import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
import re
import secrets

from modules import *


class userdata(BaseModel):
    name: str
    phone: str
    email: str
    password: str


class logindata(BaseModel):
    email: str
    password: str


class mail(BaseModel):
    email: str


class otpdata(BaseModel):
    email: str
    otp: str


class password_data(BaseModel):
    email: str
    password: str

class signup_data(BaseModel):
    email: str
    name: str
    phone: str 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

load_dotenv()
m_url = os.getenv("m_url")
client = MongoClient(m_url)
db = client["parknest"]
users = db["users"]
profile = db["profile"]
otp_db = db["otp"]
passwordhash = PasswordHash.recommended()


@app.get("/")
async def root():
    return {"message": "Backend is running"}


@app.post("/login")
async def login(data: logindata):
    email = data.email.strip().lower()
    curr_user = users.find_one({"email": email})

    if not curr_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not passwordhash.verify(data.password, curr_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid password")

    token = token_generator(str(curr_user["_id"]))
    return {"name": curr_user.get("name", ""), "token": token}


@app.post("/send_otp")
async def send_otp(data: mail):
    email = data.email.strip().lower()
    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'

    if not re.match(email_regex, email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    if users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Account already exists")

    otp = str(secrets.randbelow(900000) + 100000)
    now = datetime.now(timezone.utc)

    await send_email(
        email,
        "OTP for ParkNest",
        f"Your OTP is: {otp}"
    )

    otp_db.delete_many({"email": email})
    otp_db.insert_one({
        "email": email,
        "otp": otp,
        "verified": False,
        "expiry": now + timedelta(minutes=5)
    })

    return {"detail": "ok"}


@app.post("/verify_otp")
def verify_otp(data: otpdata):
    email = data.email.strip().lower()
    curr_user = otp_db.find_one({
        "email": email,
        "verified": False
    })

    if not curr_user:
        raise HTTPException(
            status_code=400,
            detail="Please resend OTP"
        )

    now = datetime.now(timezone.utc)
    expiry = curr_user["expiry"].replace(tzinfo=timezone.utc)
    if expiry <= now:
        otp_db.delete_many({"email": email})
        raise HTTPException(
            status_code=400,
            detail="OTP expired. Please resend"
        )

    if not secrets.compare_digest(data.otp, curr_user["otp"]):
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    otp_db.update_one(
        {"email": email},
        {
            "$set": {
                "verified": True,
                "expiry": now + timedelta(minutes=15)
            },
            "$unset": {"otp": ""}
        }
    )

    return {"detail": "ok"}


@app.post("/handle_password")
def handle_password(data: password_data):
    email = data.email.strip().lower()
    now = datetime.now(timezone.utc)

    verification = otp_db.find_one({
        "email": email,
        "verified": True,
        "expiry": {"$gt": now}
    })

    if not verification:
        raise HTTPException(
            status_code=403,
            detail="Verify your email first"
        )

    if users.find_one({"email": email}):
        raise HTTPException(
            status_code=409,
            detail="Account already exists"
        )

    if not password_checker(data.password):
        raise HTTPException(
            status_code=400,
            detail="Enter valid password (special character, uppercase, number, more than 8 characters)"
        )

    users.insert_one({
        "email": email,
        "password": passwordhash.hash(data.password)
    })

    otp_db.delete_many({"email": email})

    return {"detail": "ok"}

@app.post("/resend_otp")
async def resend_otp(data: mail):
    email = data.email.strip().lower()

    if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    if users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Account already exists")

    otp = str(secrets.randbelow(900000) + 100000)
    now = datetime.now(timezone.utc)

    await send_email(
        email,
        "OTP for ParkNest",
        f"Your OTP is: {otp}"
    )

    otp_db.update_one(
        {"email": email},
        {
            "$set": {
                "otp": otp,
                "verified": False,
                "expiry": now + timedelta(minutes=5)
            }
        },
        upsert=True
    )

    return {"detail": "ok"}

@app.post("/handle_signup")
def handle_signup(data: signup_data):
    email = data.email.strip().lower()
    name = data.name.strip()
    phone = data.phone.strip()

    if not name or not phone:
        raise HTTPException(
            status_code=400,
            detail="Name and phone are required"
        )

    curr_user = users.find_one({"email": email})

    if not curr_user:
        raise HTTPException(
            status_code=404,
            detail="User not found. Set your password first"
        )

    if profile.find_one({"email": email}):
        raise HTTPException(
            status_code=409,
            detail="Account profile already exists"
        )

    users.update_one(
        {"email": email},
        {
            "$set": {
                "name": name,
                "phone": phone
            }
        }
    )

    profile.insert_one({
        "email": email,
        "name": name,
        "phone": phone
    })

    return {"detail": "ok"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )