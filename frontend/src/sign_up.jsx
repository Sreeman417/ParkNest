import { useState } from "react";
import "./App.css";
import telephone from "./assets/telephone.png";
import mail from "./assets/mail.png";
import user from "./assets/user_for_entry.png";
import signup from "./assets/user.png";
import lock from "./assets/padlock.png";
import show from "./assets/show.png";
import hide from "./assets/hide.png";
import { useNavigate } from "react-router-dom";

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
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async () => {
        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Please enter your email");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/send_otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: email.trim() })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || "Unable to send OTP");
                return;
            }

            setStep(2);
            setError("");
        } catch {
            setError("Unable to connect to the server");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError("");
        setMessage("");

        if (otp.length !== 6) {
            setError("Enter the 6-digit OTP");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/verify_otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: email.trim(), otp })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || "OTP verification failed");
                return;
            }

            setError("");
            setStep(3);
        } catch {
            setError("Unable to connect to the server");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/resend_otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: email.trim() })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || "Unable to resend OTP");
                return;
            }

            setOtp("");
            setMessage("A new OTP has been sent to your email.");
        } catch {
            setError("Unable to connect to the server");
        } finally {
            setLoading(false);
        }
    };

    const handleChangeEmail = () => {
        setOtp("");
        setError("");
        setMessage("");
        setStep(1);
    };

    const handlePassword = async () => {
        setError("");
        setMessage("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/handle_password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: email.trim(), password })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || "Failed to set password");
                return;
            }

            setStep(4);
            setError("");
        } catch {
            setError("Unable to connect to the server");
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteSignup = async () => {
        setError("");
        setMessage("");

        if (!name.trim() || !phone.trim()) {
            setError("Please enter your name and phone number");
            return;
        }

        if (phone.length !== 10) {
            setError("Enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/handle_signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.trim(),
                    name: name.trim(),
                    phone: phone.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || "Signup failed");
                return;
            }

            setError("");
            navigate("/login");
        } catch {
            setError("Unable to connect to the server");
        } finally {
            setLoading(false);
        }
    };

    const renderProgress = () => {
        const labels = ["Email", "Verify", "Password", "Profile"];
        const progress = ((step - 1) / 3) * 100;

        return (
            <div className="signup_progress">
                <div className="progress_track">
                    <div
                        className="progress_fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {labels.map((label, index) => {
                    const number = index + 1;
                    const active = number <= step;

                    return (
                        <div className="progress_step" key={label}>
                            <div className={`progress_circle ${active ? "active" : ""}`}>
                                {number < step ? "✓" : number}
                            </div>
                            <span className={active ? "active_label" : ""}>
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <h1 id="smart_parking_txt">Park Nest</h1>

            {step === 1 && (
                <div className="signup_card">
                    {renderProgress()}

                    <img src={signup} alt="Signup" id="signup_img" />
                    <h1 id="signup_txt">Create Account</h1>
                    <p id="create_txt">Verify your email to get started</p>

                    <div className="signup_box">
                        <img src={mail} alt="Email" />
                        <input
                            type="email"
                            placeholder="Email address"
                            id="email_input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        id="login_btn"
                        onClick={handleSendOTP}
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="signup_card otp_card">
                    {renderProgress()}

                    <h1 id="otp_txt">Verify Email</h1>

                    <div className="otp_description">
                        <p>Enter the OTP sent to <strong>{email}</strong></p>
                        <button
                            type="button"
                            className="resend_text_btn"
                            onClick={handleResendOTP}
                            disabled={loading}
                        >
                            Resend OTP
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        id="otp_input"
                        value={otp}
                        onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                    />

                    <button
                        id="verify_btn"
                        onClick={handleVerifyOTP}
                        disabled={loading || otp.length !== 6}
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>

                    <button
                        type="button"
                        className="change_email_text_btn"
                        onClick={handleChangeEmail}
                        disabled={loading}
                    >
                        Change email address
                    </button>
                </div>
            )}

            {step === 3 && (
                <div className="signup_card">
                    {renderProgress()}

                    <img src={signup} alt="Account" id="signup_img" />
                    <h1 id="signup_txt">Set Password</h1>
                    <p id="create_txt">{email}</p>

                    <div className="password_box">
                        <img src={lock} className="lock_img" alt="Lock" />
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="password_entry"
                            type={showpass ? "text" : "password"}
                            placeholder="Password"
                        />
                        <button
                            type="button"
                            className="eye_btn"
                            onClick={() => setShowpass(!showpass)}
                            aria-label={showpass ? "Hide password" : "Show password"}
                        >
                            <img
                                src={showpass ? hide : show}
                                alt=""
                                className="eye_img"
                            />
                        </button>
                    </div>

                    <div className="password_box">
                        <img src={lock} className="lock_img" alt="Lock" />
                        <input
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            id="confirm_password_entry"
                            type={showconfirm ? "text" : "password"}
                            placeholder="Confirm password"
                        />
                        <button
                            type="button"
                            className="eye_btn"
                            onClick={() => setShowconfirm(!showconfirm)}
                            aria-label={showconfirm ? "Hide password" : "Show password"}
                        >
                            <img
                                src={showconfirm ? hide : show}
                                alt=""
                                className="eye_img"
                            />
                        </button>
                    </div>

                    <button
                        id="login_btn"
                        onClick={handlePassword}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Continue"}
                    </button>
                </div>
            )}

            {step === 4 && (
                <div className="signup_card">
                    {renderProgress()}

                    <img src={signup} alt="Profile" id="signup_img" />
                    <h1 id="signup_txt">Your Profile</h1>
                    <p id="create_txt">{email}</p>

                    <div className="signup_box">
                        <img src={user} alt="User" />
                        <input
                            type="text"
                            placeholder="Full name"
                            id="name_input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="signup_box">
                        <img src={telephone} alt="Telephone" />
                        <input
                            type="tel"
                            placeholder="Phone number"
                            id="phone_input"
                            value={phone}
                            onChange={(e) =>
                                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                            }
                            inputMode="numeric"
                            maxLength={10}
                        />
                    </div>

                    <button
                        id="login_btn"
                        onClick={handleCompleteSignup}
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </div>
            )}

            {error && <p className="signup_error" role="alert">{error}</p>}
            {message && <p className="signup_success" role="status">{message}</p>}
        </>
    );
}

export default Signup_card;
