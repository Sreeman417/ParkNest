
from email.message import EmailMessage
import os
from datetime import datetime, timedelta, timezone

import aiosmtplib
from dotenv import load_dotenv
from jose import jwt, JWTError
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer

load_dotenv()

email = os.getenv("gmail_user")
password = os.getenv("gmail_pass")
jwt_secret = os.getenv("JWT_SECRET")

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
        "exp": now + timedelta(minutes=30)
    }

    return jwt.encode(payload, jwt_secret, algorithm="HS256")


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
