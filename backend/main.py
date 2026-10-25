import uvicorn
from fastapi import FastAPI,HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os
import time
from dotenv import load_dotenv
import random
import aiosmtplib
from email.message import EmailMessage
class userdata(BaseModel):
    name:str
    phone:str
    email:str
    password:str
class logindata(BaseModel):
    email:str
    password:str
class otp(BaseModel):
    otp:str
app = FastAPI()
load_dotenv()
email = os.getenv("gmail_user")
password = os.getenv("gmail_pass")
m_url = os.getenv("m_url")
client = MongoClient(m_url)
db = client["parknest"]
users = db["users"]
profile = db["profile"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
otp_store = {}
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
        password=password,
    )
def password_checker(pasw):
    upper = 0
    special = 0
    c = 0
    for i in pasw:
        if(i.isupper()):
            upper = 1
        elif(i.isalnum()==False):
            special = 1
        c+=1
    
    return (upper and special and (c>=8))

@app.post("/login")
def login(data:logindata):
    curr_user = users.find_one({"email":data.email})
    if ("@" not in data.email):
        raise HTTPException(status_code=400,detail="Please enter a proper mail id")
    elif(curr_user == None):
        raise HTTPException(status_code=400,detail = "User not found Please create an account")
    elif(password_checker(curr_user["password"]) == False):
        raise HTTPException(status_code=400,detail = "Password must contain atleast a cap,special,\nand more than 8 character")    
    if(curr_user["password"] == data.password):
        return {"detail":"ok","name":curr_user["name"]}
    else:
        raise HTTPException(status_code=400,detail = "Incorrect password")
@app.post("/signup")
async def signup(data:userdata):
    curr_user = users.find_one({"email":data.email})
    if(data.name == "" or data.phone == "" or data.email == "" or data.password == ""):
        raise HTTPException(status_code=400,detail = "Please fill all the fields")
    elif(data.phone.isdigit() == False or len(data.phone) != 10):
        raise HTTPException(status_code=400,detail = "Please enter a valid phone number")
    elif("@" not in data.email):
        raise HTTPException(status_code=400,detail="Please enter a proper mail id")
    elif(password_checker(data.password) == False):
        raise HTTPException(status_code=400,detail = "Password must contain atleast a cap,special,\nand more than 8 character")
    else:
        if(users.find_one({"email":data.email}) == None and users.find_one({"phone":data.phone}) == None):
            random_otp = random.randrange(100000,1000000)
            
            await send_email(data.email, "OTP for ParkNest", f"Your OTP is: {random_otp}")
            otp_store[data.email] = [random_otp, time.time()+300] 

            raise HTTPException(status_code=200,detail = "OTP sent")
        
            """users.insert_one({"name":data.name,"phone":data.phone,"email":data.email,"password":data.password})
            return {"detail":"ok","name":curr_user["name"]}"""
        elif(users.find_one({"phone":data.phone}) != None or users.find_one({"email":data.email}) != None):
            raise HTTPException(status_code=400,detail = "Phone number or Email already exists")

@app.post("/verify_otp")
def verify_otp(data:otp):
    if email not in otp_store:
        raise HTTPException(status_code=400,detail = "No OTP sent to this email")
    stored_otp, expiry_time = otp_store[email]
    if time.time() > expiry_time:
        del otp_store[email]
        raise HTTPException(status_code=400,detail = "OTP expired")
    if str(stored_otp) == data.otp:
        users.insert_one({"name":name,"phone":phone,"email":email,"password":password})
        del otp_store[email]
        return {"detail":"ok","name":name}
    else:
        raise HTTPException(status_code=400,detail = "Incorrect OTP")

if __name__ == "__main__":
    uvicorn.run("main:app",host="127.0.0.1",port = 8000,reload=True)