
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";
import loginImage from "./assets/user.png";
import mail from "./assets/mail.png";
import lock from "./assets/padlock.png";
import show from "./assets/show.png";
import hide from "./assets/hide.png";

function Login_card() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showpass, setShowpass] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password:password
                })
            });
            const data = await response.json();
            if (data.token) {
                localStorage.setItem("token", data.token);
                navigate("/dashboard");
            }
            else {
                setError(data.detail || "Login failed");
            }
        }
        catch (err) {
            console.error("Error during login:", err);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth_page">
            <h1 className="brand_title">Park Nest</h1>

            <section className="auth_content">
                <div className="auth_card">
                    <img
                        src={loginImage}
                        alt="User"
                        className="auth_avatar"
                    />

                    <h2 className="auth_title">Login</h2>
                    <p className="auth_subtitle">
                        Welcome back! Please log in to your account.
                    </p>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                    }}>
                        <div className="auth_input_box">
                            <img src={mail} alt="" />
                            <input
                                type="email"
                                placeholder="Email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="auth_input_box">
                            <img src={lock} alt="" />
                            <input
                                type={showpass ? "text" : "password"}
                                placeholder="Password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="auth_eye_button"
                                onClick={() => setShowpass(!showpass)}
                                aria-label={showpass ? "Hide password" : "Show password"}
                            >
                                <img src={showpass ? hide : show} alt="" />
                            </button>
                        </div>

                        {error && (
                            <p className="auth_error" role="alert">
                                {error}
                            </p>
                        )}

                        <button
                            className="auth_submit"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="auth_footer">
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Login_card;
