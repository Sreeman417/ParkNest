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
    const [step, setStep] = useState(1);
    const [showpass, setShowpass] = useState(false);
    const [showconfirm, setShowconfirm] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async()=>{
        setLoading(true);
        try {
            const response = await fetch("http://127.0.0.1:8000/send_otp")
            const data = await response.json();
            if(data.detail === "ok") {
                setStep(2);
            }
            else{
                setError("OTP not correct");
            }
        }
        catch(err) {
            console.error("Error sending OTP:", err);
        }
        finally {
            setLoading(false);
        }
    }
    

    return (
        <>
            <h1 id="smart_parking_txt">Park Nest</h1>

            {step === 1 && (
                <div className="signup_card">
                    <img src={signup} alt="Signup" id="signup_img" />
                    <h1 id="signup_txt">Sign Up</h1>
                    <p id="create_txt">Verify your email to get started</p>

                    <div className="signup_box">
                        <img src={mail} alt="Email" />
                        <input
                            type="email"
                            placeholder="Email"
                            id="email_input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <button id="login_btn" onClick={handleSendOTP} disabled={loading}>
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="otp_card">
                    <h1 id="otp_txt">Verify Email</h1>
                    <p>Enter the OTP sent to {email}</p>

                    <input
                        type="text"
                        placeholder="6-digit OTP"
                        id="otp_input"
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        inputMode="numeric"
                        maxLength={6}
                    />

                    <button id="verify_btn" onClick={handleVerifyOTP} disabled={loading}>
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>

                    <button
                        id="verify_btn"
                        onClick={() => {
                            setOtp("");
                            setError("");
                        }}
                        disabled={loading}
                    >
                        Change Email
                    </button>
                </div>
            )}

            {step === 3 && (
                <div className="signup_card">
                    <img src={signup} alt="Account" id="signup_img" />
                    <h1 id="signup_txt">Set Password</h1>
                    <p id="create_txt">{email}</p>

                    <div className="password_box">
                        <input
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            id="password_entry"
                            type={showpass ? "text" : "password"}
                            placeholder="Password"
                        />
                        <img src={lock} id="lock_img" alt="Lock" />
                        <button
                            type="button"
                            className="eye_btn"
                            onClick={() => setShowpass(!showpass)}
                        >
                            <img src={showpass ? show : hide} alt="Toggle password" className="eye_img" />
                        </button>
                    </div>

                    <div className="password_box">
                        <input
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            id="password_entry"
                            type={showconfirm ? "text" : "password"}
                            placeholder="Confirm Password"
                        />
                        <img src={lock} id="lock_img" alt="Lock" />
                        <button
                            type="button"
                            className="eye_btn"
                            onClick={() => setShowconfirm(!showconfirm)}
                        >
                            <img src={showconfirm ? show : hide} alt="Toggle password" className="eye_img" />
                        </button>
                    </div>

                    <button id="login_btn" onClick={handlePassword}>
                        Continue
                    </button>
                </div>
            )}

            {step === 4 && (
                <div className="signup_card">
                    <img src={signup} alt="Profile" id="signup_img" />
                    <h1 id="signup_txt">Your Profile</h1>
                    <p id="create_txt">{email}</p>

                    <div className="signup_box">
                        <input
                            type="text"
                            placeholder="Full Name"
                            id="name_input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                        <img src={user} alt="User" />
                    </div>

                    <div className="signup_box">
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            id="phone_input"
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        />
                        <img src={telephone} alt="Telephone" />
                    </div>

                    <button id="login_btn" onClick={handleCompleteSignup} disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </div>
            )}

            {error && <h1 id="error_txt" role="alert">{error}</h1>}
        </>
    );
}

export default Signup_card;
