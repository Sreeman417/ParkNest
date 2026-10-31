import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from bson import ObjectId
from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import os
from typing import Literal
import secrets
import re
from modules import *
from pymongo.read_concern import ReadConcern
from pymongo.write_concern import WriteConcern


load_dotenv()

m_url = os.getenv("m_url")

if not m_url:
    raise RuntimeError("MongoDB URL is missing")

client = MongoClient(m_url)
db = client["parknest"]

users = db["users"]
profile = db["profile"]
otp_db = db["otp"]
lands_db = db["lands"]
bookings = db["bookings"]

passwordhash = PasswordHash.recommended()

otp_db.create_index("expiry", expireAfterSeconds=0)
profile.create_index("email", unique=True)

bookings.create_index([
    ("land_id", 1),
    ("start_time", 1),
    ("end_time", 1),
    ("booking_status", 1)
])

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

class BookingRequest(BaseModel):
    land_id: str
    start_time: datetime
    hours: int = Field(gt=0, le=24)
    slot_count: int = Field(gt=0, le=20)


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


class user_data(BaseModel):
    name: str
    address: str = ""
    vehicle: str = "Car"
    vehicel_no: str = ""
    emergency_con: str = ""
    about_u: str = ""


class BookingResponse(BaseModel):
    booking_id: str
    action: str


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

    return {
        "name": curr_user.get("name", ""),
        "token": token
    }


@app.post("/send_otp")
async def send_otp(data: mail):
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
        raise HTTPException(status_code=400, detail="Please resend OTP")

    now = datetime.now(timezone.utc)
    expiry = curr_user["expiry"].replace(tzinfo=timezone.utc)

    if expiry <= now:
        otp_db.delete_many({"email": email})
        raise HTTPException(
            status_code=400,
            detail="OTP expired. Please resend"
        )

    if not secrets.compare_digest(data.otp, curr_user["otp"]):
        raise HTTPException(status_code=400, detail="Invalid OTP")

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
        raise HTTPException(status_code=409, detail="Account already exists")

    if not password_checker(data.password):
        raise HTTPException(
            status_code=400,
            detail="Enter valid password"
        )

    otp_db.update_one(
        {"email": email},
        {"$set": {"password": passwordhash.hash(data.password)}}
    )

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

    verification = otp_db.find_one({
        "email": email,
        "verified": True,
        "expiry": {"$gt": datetime.now(timezone.utc)},
        "password": {"$exists": True}
    })

    if not verification:
        raise HTTPException(
            status_code=403,
            detail="Complete email verification and password setup first"
        )

    if users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Account already exists")

    users.insert_one({
        "email": email,
        "password": verification["password"],
        "name": name,
        "phone": phone
    })

    profile.insert_one({
        "email": email,
        "name": name,
        "phone": phone
    })

    otp_db.delete_many({"email": email})

    return {"detail": "ok"}


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

    name = data.name.strip()
    address = data.address.strip()
    vehicle = data.vehicle.strip()
    vehicel_no = data.vehicel_no.strip().upper()
    emergency_con = data.emergency_con.strip()
    about_u = data.about_u.strip()

    if not name:
        raise HTTPException(status_code=400, detail="Name cannot be empty")

    if len(name) > 100:
        raise HTTPException(status_code=400, detail="Name is too long")

    if len(address) > 300:
        raise HTTPException(status_code=400, detail="Address is too long")

    if vehicle not in ["Car", "Bike", "Scooter"]:
        raise HTTPException(status_code=400, detail="Invalid vehicle type")

    if vehicel_no and not re.fullmatch(
        r"[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{1,4}",
        vehicel_no
    ):
        raise HTTPException(status_code=400, detail="Invalid vehicle number")

    if emergency_con and not re.fullmatch(r"[6-9]\d{9}", emergency_con):
        raise HTTPException(status_code=400, detail="Invalid emergency contact")

    if len(about_u) > 500:
        raise HTTPException(status_code=400, detail="About you is too long")

    try:
        profile.update_one(
            {"email": email},
            {
                "$set": {
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "address": address,
                    "vehicle": vehicle,
                    "vehicel_no": vehicel_no,
                    "emergency_con": emergency_con,
                    "about_u": about_u
                }
            },
            upsert=True
        )

        result = users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {"name": name}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "detail": "ok",
            "message": "Profile saved successfully"
        }

    except PyMongoError:
        raise HTTPException(
            status_code=500,
            detail="Database error while saving profile"
        )
    
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
    booking_mode: Literal["manual", "automatic"] = "manual"

@app.post("/add_land")
async def add_land(
    data: land,
    current_user: dict = Depends(get_current_user)
):
    email = current_user["email"]

    title = data.title.strip()
    address = data.address.strip()

    if len(title) < 3:
        raise HTTPException(
            status_code=400,
            detail="Title must contain at least 3 characters"
        )

    if len(address) < 5:
        raise HTTPException(status_code=400, detail="Enter a valid address")

    try:
        area_value = float(data.area)

        if area_value <= 0:
            raise ValueError

    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail="Land area must be a positive number"
        )

    try:
        price_value = float(data.price)

        if price_value <= 0:
            raise ValueError

    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail="Price must be a positive number"
        )

    if not data.slots.strip() or not data.slots.isdigit():
        raise HTTPException(
            status_code=400,
            detail="Enter a valid number of parking spaces"
        )

    slots_value = int(data.slots)

    if slots_value <= 0:
        raise HTTPException(
            status_code=400,
            detail="Enter a valid number of parking spaces"
        )

    description = data.description.strip()

    if len(description) < 10:
        raise HTTPException(
            status_code=400,
            detail="Description must contain at least 10 characters"
        )

    if not data.utilities or not all(item.strip() for item in data.utilities):
        raise HTTPException(
            status_code=400,
            detail="Select valid utilities"
        )

    if data.latitude.strip() and data.longitude.strip():
        try:
            latitude_value = float(data.latitude)
            longitude_value = float(data.longitude)

            if not (
                -90 <= latitude_value <= 90
                and -180 <= longitude_value <= 180
            ):
                raise ValueError

            latitude = str(latitude_value)
            longitude = str(longitude_value)

        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid location coordinates"
            )
    else:
        latitude, longitude = await get_coordinates(address)

    new_land = {
        "email": email,
        "title": title,
        "address": address,
        "area": str(area_value),
        "price": price_value,
        "slots": slots_value,
        "description": description,
        "utilities": data.utilities,
        "latitude": latitude,
        "longitude": longitude,
        "booking_mode": data.booking_mode
    }

    result = lands_db.insert_one(new_land)

    return {
        "detail": "Property added successfully",
        "land_id": str(result.inserted_id)
    }


@app.get("/my_lands")
def my_lands(current_user: dict = Depends(get_current_user)):
    email = current_user["email"]

    my_lands = list(lands_db.find({"email": email}))

    for item in my_lands:
        item["_id"] = str(item["_id"])

    return {"lands": my_lands}


@app.get("/space_fetcher")
def spacefetcher(curr_user: dict = Depends(get_current_user)):
    email = curr_user["email"].strip().lower()

    lands = list(
        lands_db.find(
            {"email": {"$ne": email}},
            {"_id": 1, "email": 0}
        )
    )

    for land in lands:
        land["_id"] = str(land["_id"])

    return {"lands": lands, "detail": "ok"}




@app.get("/booking/owner/pending")
def get_owner_pending_bookings(
    current_user: dict = Depends(get_current_user)
):
    owner_bookings = list(
        bookings.find({
            "owner_id": current_user["email"],
            "booking_status": "pending"
        }).sort("created_at", -1)
    )

    for booking in owner_bookings:
        booking["_id"] = str(booking["_id"])
        booking["land_id"] = str(booking["land_id"])
        booking["customer_id"] = str(booking["customer_id"])

    return {
        "bookings": owner_bookings,
        "detail": "ok"
    }


@app.post("/booking/{booking_id}/respond")
async def respond_to_booking(
    booking_id: str,
    data: BookingResponse,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid booking ID"
        )

    if data.action not in ["accept", "reject"]:
        raise HTTPException(
            status_code=400,
            detail="Action must be accept or reject"
        )

    new_status = "accepted" if data.action == "accept" else "rejected"

    result = bookings.update_one(
        {
            "_id": ObjectId(booking_id),
            "owner_id": current_user["email"],
            "booking_status": "pending"
        },
        {
            "$set": {
                "booking_status": new_status,
                "owner_response_at": datetime.now(timezone.utc)
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Pending booking not found"
        )

    booking = bookings.find_one({
        "_id": ObjectId(booking_id)
    })

    customer_email = booking["customer_email"]

    try:
        await send_email(
            customer_email,
            "ParkNest Booking Update",
            f"""
Your booking request has been {new_status}.

Parking space: {booking["land_title"]}
Start time: {booking["start_time"].isoformat()}
End time: {booking["end_time"].isoformat()}

Booking ID: {booking_id}
"""
        )
    except Exception:
        pass

    return {
        "detail": f"Booking {new_status}",
        "booking_status": new_status
    }

@app.post("/booking_request")
async def create_booking(
    data: BookingRequest,
    curr_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(data.land_id):
        raise HTTPException(status_code=400, detail="Invalid land ID")

    if data.start_time.tzinfo is None:
        raise HTTPException(
            status_code=400,
            detail="Start time must include a timezone"
        )

    start_time = data.start_time.astimezone(timezone.utc)

    if start_time <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Booking time must be in the future"
        )

    end_time = start_time + timedelta(hours=data.hours)
    land_id = ObjectId(data.land_id)
    customer_email = curr_user["email"]
    booking_id = ObjectId()

    active_statuses = [
        "pending",
        "accepted",
        "payment_pending",
        "confirmed"
    ]

    def reserve_slots(session):
        land = lands_db.find_one(
            {"_id": land_id},
            session=session
        )

        if not land:
            raise HTTPException(
                status_code=404,
                detail="Parking space not found"
            )

        if land["email"].strip().lower() == customer_email.strip().lower():
            raise HTTPException(
                status_code=403,
                detail="You cannot book your own parking space"
            )

        try:
            total_slots = int(land["slots"])
            price_per_slot = float(land["price"])
        except (ValueError, TypeError, KeyError):
            raise HTTPException(
                status_code=400,
                detail="Invalid parking space capacity or price"
            )

        if data.slot_count > total_slots:
            raise HTTPException(
                status_code=400,
                detail="Requested slots exceed total capacity"
            )

        booking_mode = land.get("booking_mode", "manual")

        if booking_mode not in ["manual", "automatic"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid booking mode for this property"
            )

        overlapping = list(
            bookings.find(
                {
                    "land_id": land_id,
                    "status": {"$in": active_statuses},
                    "start_time": {"$lt": end_time},
                    "end_time": {"$gt": start_time}
                },
                {"slot_count": 1},
                session=session
            )
        )

        reserved_slots = sum(
            int(item.get("slot_count", 1))
            for item in overlapping
        )

        available_slots = total_slots - reserved_slots

        if data.slot_count > available_slots:
            raise HTTPException(
                status_code=409,
                detail=f"Only {available_slots} slots are available"
            )

        lands_db.update_one(
            {"_id": land_id},
            {"$inc": {"booking_version": 1}},
            session=session
        )

        total_price = price_per_slot * data.slot_count * data.hours

        booking_status = (
            "accepted" if booking_mode == "automatic" else "pending"
        )

        booking = {
            "_id": booking_id,
            "land_id": land_id,
            "land_title": land["title"],
            "owner_email": land["email"],
            "customer_email": customer_email,
            "customer_phone": curr_user.get("phone", ""),
            "start_time": start_time,
            "end_time": end_time,
            "hours": data.hours,
            "slot_count": data.slot_count,
            "price_per_slot": price_per_slot,
            "total_price": total_price,
            "booking_mode": booking_mode,
            "status": booking_status,
            "created_at": datetime.now(timezone.utc)
        }

        bookings.insert_one(booking, session=session)

        return booking

    try:
        with client.start_session() as session:
            booking = session.with_transaction(reserve_slots)

    except HTTPException:
        raise

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    notification_sent = True

    try:
        if booking["status"] == "pending":
            await send_email(
                booking["owner_email"],
                "New ParkNest booking request",
                (
                    f"You have received a booking request for "
                    f"{booking['land_title']}.\n"
                    f"Customer: {customer_email}\n"
                    f"Slots requested: {booking['slot_count']}\n"
                    f"Start time: {booking['start_time']}\n"
                    f"End time: {booking['end_time']}\n"
                    f"Total amount: ₹{booking['total_price']}\n"
                    f"Please log in to ParkNest to accept or reject it."
                )
            )
        else:
            await send_email(
                customer_email,
                "ParkNest booking accepted",
                (
                    f"Your booking for {booking['land_title']} "
                    f"has been automatically accepted.\n"
                    f"Slots: {booking['slot_count']}\n"
                    f"Total amount: ₹{booking['total_price']}\n"
                    f"Please proceed to payment."
                )
            )

    except Exception:
        notification_sent = False

    return {
        "detail": (
            "Booking request created"
            if booking["status"] == "pending"
            else "Booking automatically accepted"
        ),
        "booking_id": str(booking_id),
        "status": booking["status"],
        "total_price": booking["total_price"],
        "notification_sent": notification_sent
    }

@app.get("/my_bookings")
def get_my_bookings(
    current_user: dict = Depends(get_current_user)
):
    customer_email = current_user["email"]

    now = datetime.now(timezone.utc)
    expiry_time = now - timedelta(minutes=10)

    pending_bookings = bookings.find({
        "customer_email": customer_email,
        "status": "pending"
    })

    for booking in pending_bookings:
        created_at = booking["created_at"]

        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        if created_at <= expiry_time:
            bookings.update_one(
                {
                    "_id": booking["_id"],
                    "status": "pending"
                },
                {
                    "$set": {
                        "status": "expired",
                        "expired_at": now
                    }
                }
            )

    customer_bookings = list(
        bookings.find(
            {"customer_email": customer_email},
            {
                "_id": 1,
                "land_id": 1,
                "land_title": 1,
                "start_time": 1,
                "end_time": 1,
                "hours": 1,
                "slot_count": 1,
                "total_price": 1,
                "status": 1,
                "created_at": 1
            }
        ).sort("created_at", -1)
    )

    for booking in customer_bookings:
        booking["_id"] = str(booking["_id"])
        booking["land_id"] = str(booking.get("land_id", ""))

    active_count = sum(
        1 for booking in customer_bookings
        if booking["status"] in ["pending", "accepted", "confirmed"]
    )

    return {
        "detail": "ok",
        "bookings": customer_bookings,
        "active_count": active_count
    }

@app.get("/owner_pending_bookings")
def owner_pending_bookings(curr_user: dict = Depends(get_current_user)):
    owner_email = curr_user["email"]
    now = datetime.now(timezone.utc)
    expiry_time = now - timedelta(minutes=10)

    bookings.update_many(
        {
            "owner_email": owner_email,
            "status": "pending",
            "created_at": {"$lte": expiry_time}
        },
        {
            "$set": {
                "status": "expired",
                "expired_at": now
            }
        }
    )

    pending = list(
        bookings.find(
            {
                "owner_email": owner_email,
                "status": "pending",
                "created_at": {"$gt": expiry_time}
            },
            {
                "_id": 1,
                "land_id": 1,
                "land_title": 1,
                "customer_email": 1,
                "customer_phone": 1,
                "start_time": 1,
                "end_time": 1,
                "hours": 1,
                "slot_count": 1,
                "total_price": 1,
                "created_at": 1
            }
        ).sort("created_at", -1)
    )

    for item in pending:
        item["_id"] = str(item["_id"])
        item["land_id"] = str(item.get("land_id", ""))

        if not item.get("customer_phone"):
            customer = users.find_one(
                {"email": item["customer_email"]},
                {"_id": 0, "phone": 1}
            )

            item["customer_phone"] = customer.get("phone", "") if customer else ""

    return {
        "detail": "ok",
        "bookings": pending
    }

class BookingResponse(BaseModel):
    booking_id: str
    action: str

@app.post("/booking_response")
async def respond_to_booking(
    data: BookingResponse,
    curr_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(data.booking_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid booking ID"
        )

    if data.action not in ["accept", "reject"]:
        raise HTTPException(
            status_code=400,
            detail="Action must be accept or reject"
        )

    now = datetime.now(timezone.utc)
    expiry_time = now - timedelta(minutes=10)

    booking_id = ObjectId(data.booking_id)
    owner_email = curr_user["email"]

    booking = bookings.find_one({
        "_id": booking_id,
        "owner_email": owner_email
    })

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking request not found"
        )

    if booking["status"] != "pending":
        raise HTTPException(
            status_code=409,
            detail="Booking request is no longer pending"
        )

    created_at = booking["created_at"]

    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    if created_at <= expiry_time:
        bookings.update_one(
            {
                "_id": booking_id,
                "owner_email": owner_email,
                "status": "pending"
            },
            {
                "$set": {
                    "status": "expired",
                    "expired_at": now
                }
            }
        )

        raise HTTPException(
            status_code=410,
            detail="Booking request has expired"
        )

    new_status = (
        "accepted" if data.action == "accept" else "rejected"
    )

    result = bookings.update_one(
        {
            "_id": booking_id,
            "owner_email": owner_email,
            "status": "pending"
        },
        {
            "$set": {
                "status": new_status,
                "owner_response_at": now
            }
        }
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=409,
            detail="Booking request has already been processed"
        )

    notification_sent = True

    try:
        await send_email(
            booking["customer_email"],
            f"ParkNest booking {new_status}",
            (
                f"Your booking request for {booking['land_title']} "
                f"has been {new_status}.\n"
                f"Slots requested: {booking['slot_count']}\n"
                f"Total amount: ₹{booking['total_price']}"
            )
        )
    except Exception:
        notification_sent = False

    return {
        "detail": f"Booking {new_status}",
        "status": new_status,
        "notification_sent": notification_sent
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
