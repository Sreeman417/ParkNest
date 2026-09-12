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

    return (
        <>
            <h1 id="smart_parking_txt">Smart Parking</h1>

            <div className="signup_card">

                <img src={signup} alt="Signup" id="signup_img" />

                <h1 id="signup_txt">Sign Up</h1>
                <p id="create_txt">Create Account</p>

                <div className="signup_box">
                    <input
                        type="text"
                        placeholder="Full Name"
                        id="name_input"
                    />
                    <img src={user} alt="User Icon" />
                </div>

                <div className="signup_box">
                    <input
                        type="text"
                        placeholder="Phone Number"
                        id="phone_input"
                    />
                    <img src={telephone} alt="Telephone Icon" />
                </div>

                <div className="signup_box">
                    <input
                        type="email"
                        placeholder="Email"
                        id="email_input"
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

                <button id="login_btn">
                    Sign Up
                </button>

            </div>
        </>
    );
}

export default Signup_card;