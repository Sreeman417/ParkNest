import { useState } from "react";
import "./App.css";
import telephone from "./assets/telephone.png";
import mail from "./assets/mail.png";
import user from "./assets/user_for_entry.png";
import signup from "./assets/user.png";
import lock from "./assets/padlock.png";
import show from "./assets/show.png";
import hide from "./assets/hide.png";

function Signup_card() {
    const [showpass, setShowpass] = useState(false);
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const handleSignup = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/signup", {
                method: "POST",
                headers: {
                    "content-type": "application/json" 
                },
                body: JSON.stringify({
                    name: name,
                    phone: phone,
                    email: email,
                    password: password
                })
            });
            const data = await response.json();
            if(data.detail == "ok"){
                setError("")
                return;
            }
            else{
                setError(data.detail);
            }
            return;
        } catch (err) {
            console.error("Network error:", err);
        }
    };

    return (
        <>
            <h1 id="smart_parking_txt">Park Nest</h1>

            <div className="signup_card">

                <img src={signup} alt="Signup" id="signup_img" />

                <h1 id="signup_txt">Sign Up</h1>
                <p id="create_txt">Create Account</p>

                <div className="signup_box">
                    <input
                        type="text"
                        placeholder="Full Name"
                        id="name_input"
                        value = {name}
                        onChange = {(e) => setName(e.target.value)}
                    />
                    <img src={user} alt="User Icon" />
                </div>

                <div className="signup_box">
                    <input
                        type="text"
                        placeholder="Phone Number"
                        id="phone_input"
                        value = {phone}
                        onChange = {(e) => setPhone(e.target.value)}
                    />
                    <img src={telephone} alt="Telephone Icon" />
                </div>

                <div className="signup_box">
                    <input
                        type="email"
                        placeholder="Email"
                        id="email_input"
                        value = {email}
                        onChange = {(e) => setEmail(e.target.value)}
                    />
                    <img src={mail} alt="Mail Icon" />
                </div>

                <div className="password_box">
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        id="password_entry"
                        type={showpass ? "text" : "password"}
                        placeholder="Password"
                    />

                    <img src={lock} id="lock_img" alt="Lock Icon" />

                    <button
                        type="button"
                        className="eye_btn"
                        onClick={() => setShowpass(!showpass)}
                    >
                        <img
                            src={showpass ? show : hide}
                            alt="eye"
                            className="eye_img"
                        />
                    </button>
                </div>

                <button id="login_btn" onClick={() => handleSignup()}>
                    Sign Up
                </button>

            </div>
            {error ? <h1 id = "error_txt">{error}</h1>:null}
        </>
    );
}

export default Signup_card;