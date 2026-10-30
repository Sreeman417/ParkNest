import uvicorn
from fastapi import FastAPI, HTTPException,Depends
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
lands_db = db["lands"]
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


class user_data(BaseModel):
    name: str
    address: str = ""
    vehicle: str = "Car"
    vehicel_no: str = ""
    emergency_con: str = ""
    about_u: str = ""


@app.get("/main_profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    email = current_user.get("email", "")
    saved = profile.find_one({"email": email}) or {}

    return {
        "name": saved.get("name", current_user.get("name", "")),
        "email": email,
        "phone": current_user.get("phone", saved.get("phone", "")),
        "address": saved.get("address", ""),
        "vehicle": saved.get("vehicle", "Car"),
        "vehicel_no": saved.get("vehicel_no", ""),
        "emergency_con": saved.get("emergency_con", ""),
        "about_u": saved.get("about_u", "")
    }


@app.post("/main_profile")
def save_profile(
    data: user_data,
    current_user: dict = Depends(get_current_user)
):
    email = current_user["email"]
    phone = current_user.get("phone", "")

    profile.update_one(
        {"email": email},
        {
            "$set": {
                "name": data.name,
                "email": email,
                "phone": phone,
                "address": data.address,
                "vehicle": data.vehicle,
                "vehicel_no": data.vehicel_no,
                "emergency_con": data.emergency_con,
                "about_u": data.about_u
            }
        },
        upsert=True
    )

    users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"name": data.name}}
    )

    return {
        "detail": "ok",
        "message": "Profile saved successfully"
    }

class land(BaseModel):
    title: str
    address: str
    area: str
    price: str
    slots: str
    description: str
    utilities: list[str]
    latitude: str = ""
    longitude: str = ""

@app.post("/add_land")
async def add_land(data: land, current_user: dict = Depends(get_current_user)):
    email = current_user["email"]

    if not data.title.strip() or len(data.title.strip()) < 3:
        raise HTTPException(status_code=400, detail="Title must contain at least 3 characters")
    else:
        title = data.title.strip()

    if not data.address.strip() or len(data.address.strip()) < 5:
        raise HTTPException(status_code=400, detail="Enter a valid address")
    else:
        address = data.address.strip()

    if not data.area.strip():
        raise HTTPException(status_code=400, detail="Land area is required")
    else:
        try:
            area_value = float(data.area)
            if area_value <= 0:
                raise ValueError
            area = data.area.strip()
        except ValueError:
            raise HTTPException(status_code=400, detail="Land area must be a positive number")

    if not data.price.strip():
        raise HTTPException(status_code=400, detail="Price is required")
    else:
        try:
            price_value = float(data.price)
            if price_value <= 0:
                raise ValueError
            price = data.price.strip()
        except ValueError:
            raise HTTPException(status_code=400, detail="Price must be a positive number")

    if not data.slots.strip() or not data.slots.isdigit() or int(data.slots) <= 0:
        raise HTTPException(status_code=400, detail="Enter a valid number of parking spaces")
    else:
        slots = data.slots.strip()

    if not data.description.strip() or len(data.description.strip()) < 10:
        raise HTTPException(status_code=400, detail="Description must contain at least 10 characters")
    else:
        description = data.description.strip()

    if not data.utilities or not all(item.strip() for item in data.utilities):
        raise HTTPException(status_code=400, detail="Select valid utilities")
    else:
        utilities = data.utilities

    if data.latitude.strip() and data.longitude.strip():
        try:
            latitude_value = float(data.latitude)
            longitude_value = float(data.longitude)

            if not (-90 <= latitude_value <= 90 and -180 <= longitude_value <= 180):
                raise ValueError

            latitude = data.latitude
            longitude = data.longitude

        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid location coordinates")
    else:
        latitude, longitude = await get_coordinates(address)

    new_land = {
        "email": email,
        "title": title,
        "address": address,
        "area": area,
        "price": price,
        "slots": slots,
        "description": description,
        "utilities": utilities,
        "latitude": latitude,
        "longitude": longitude
    }

    result = lands_db.insert_one(new_land)

    return {
        "detail": "Property added successfully",
        "land_id": str(result.inserted_id)
    }


@app.get("/my_lands")
def my_lands(curr_user : dict = Depends(get_current_user)):
    email = curr_user["email"]
    my_lands = list(lands_db.find({"email":email}))
    for i in my_lands:
        i["_id"] = str(i["_id"])
    return {"lands" : my_lands}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )