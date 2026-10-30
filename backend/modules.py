import httpx
from email.message import EmailMessage
import os
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient
import aiosmtplib
from dotenv import load_dotenv
from jose import jwt, JWTError
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId


load_dotenv()

email = os.getenv("gmail_user")
password = os.getenv("gmail_pass")
jwt_secret = os.getenv("JWT_SECRET")


m_url = os.getenv("m_url")
client = MongoClient(m_url)
db = client["parknest"]
users = db["users"]
if not jwt_secret:
    raise RuntimeError("JWT_SECRET is missing from .env")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


async def send_email(to_email, subject, body):
    message = EmailMessage()
    message["From"] = email
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    await aiosmtplib.send(
        message,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=email,
        password=password
    )


def password_checker(pasw):
    return (
        len(pasw) >= 8
        and any(c.isupper() for c in pasw)
        and any(not c.isalnum() for c in pasw)
    )


def token_generator(user_id: str):
    now = datetime.now(timezone.utc)

    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + timedelta(hours = 5)
    }

    return jwt.encode(payload, jwt_secret, algorithm="HS256")

async def get_coordinates(address):
    url = "https://nominatim.openstreetmap.org/search"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            params={
                "q": address,
                "format": "jsonv2",
                "limit": 1
            },
            headers={
                "User-Agent": "ParkNest/1.0"
            },
            timeout=15
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="Address lookup service unavailable"
        )

    results = response.json()

    if not results:
        raise HTTPException(
            status_code=400,
            detail="Address not found. Enter a more specific address."
        )

    return str(results[0]["lat"]), str(results[0]["lon"])


def token_verifier(token: str = Depends(oauth2_scheme)):
    credentials_error = HTTPException(
        status_code=401,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise credentials_error

        return user_id

    except JWTError:
        raise credentials_error

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"]
        )
        user_id = payload.get("sub")

        if not user_id or not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Please login again")

    current_user = users.find_one({"_id": ObjectId(user_id)})

    if not current_user:
        raise HTTPException(status_code=401, detail="User not found")

    return current_user