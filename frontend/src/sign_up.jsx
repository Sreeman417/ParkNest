
import { useState } from "react";
import telephone from "./assets/telephone.png";
import mail from "./assets/mail.png";
import user from "./assets/user_for_entry.png";
import signup from "./assets/user.png";
import lock from "./assets/padlock.png";
import show from "./assets/show.png";
import hide from "./assets/hide.png";
import parknestlogo from "./assets/parknest.png";
import { useNavigate } from "react-router-dom";

function Signup_card() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [showpass, setShowpass] = useState(false);
    const [showconfirm, setShowconfirm] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const inputBox = "flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800";
    const inputStyle = "w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500";
    const labelStyle = "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300";
    const primaryButton = "w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";
    const secondaryButton = "rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800";

    const clearMessages = () => {
        setError("");
        setMessage("");
    };

    const handleEmail = async () => {
        clearMessages();
        setLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/send_otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Could not send OTP");
            }

            setMessage(data.message || "OTP sent successfully");
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOTP = async () => {
        clearMessages();
        setLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/verify_otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "OTP verification failed");
            }

            setMessage(data.message || "Email verified successfully");
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        clearMessages();
        setLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/resend_otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Could not resend OTP");
            }

            setMessage(data.message || "A new OTP has been sent");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePassword = async () => {
        clearMessages();
        setLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/handle_password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, confirmPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Could not save password");
            }

            setMessage(data.message || "Password saved successfully");
            setStep(4);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        clearMessages();
        setLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/handle_signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, phone })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Signup failed");
            }

            setMessage(data.message || "Account created successfully");
            navigate("/login");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, label: "Email" },
        { number: 2, label: "Verify" },
        { number: 3, label: "Password" },
        { number: 4, label: "Profile" }
    ];

    const renderProgress = () => (
        <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
                {steps.map((item) => (
                    <div
                        key={item.number}
                        className="flex flex-1 flex-col items-center gap-2"
                    >
                        <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${
                                step >= item.number
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                            }`}
                        >
                            {step > item.number ? "✓" : item.number}
                        </div>

                        <span
                            className={`text-xs font-semibold ${
                                step >= item.number
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-slate-400"
                            }`}
                        >
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${((step - 1) / 3) * 100}%` }}
                />
            </div>
        </div>
    );

    const renderInput = (
        label,
        icon,
        value,
        setter,
        placeholder,
        type = "text"
    ) => (
        <div className="mb-5">
            <label className={labelStyle}>{label}</label>

            <div className={inputBox}>
                <img
                    src={icon}
                    alt=""
                    className="h-5 w-5 object-contain opacity-60"
                />

                <input
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className={inputStyle}
                />
            </div>
        </div>
    );

    const renderPassword = (
        label,
        value,
        setter,
        visible,
        setVisible,
        placeholder
    ) => (
        <div className="mb-5">
            <label className={labelStyle}>{label}</label>

            <div className={inputBox}>
                <img
                    src={lock}
                    alt=""
                    className="h-5 w-5 object-contain opacity-60"
                />

                <input
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className={inputStyle}
                />

                <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="shrink-0"
                >
                    <img
                        src={visible ? hide : show}
                        alt="Toggle password visibility"
                        className="h-5 w-5 object-contain opacity-60"
                    />
                </button>
            </div>
        </div>
    );

    const pageContent = () => {
        if (step === 1) {
            return (
                <>
                    <div className="mb-7">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                            Step 01 — Get started
                        </span>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Create your account
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Enter your email address to begin your ParkNest journey.
                        </p>
                    </div>

                    {renderInput("Email address", mail, email, setEmail, "you@example.com", "email")}

                    <button
                        onClick={handleEmail}
                        disabled={loading}
                        className={primaryButton}
                    >
                        {loading ? "Sending..." : "Continue"}
                        {!loading && <span className="ml-2">→</span>}
                    </button>
                </>
            );
        }

        if (step === 2) {
            return (
                <>
                    <div className="mb-7">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                            Step 02 — Verification
                        </span>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Check your email
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            We've sent a verification code to{" "}
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {email}
                            </span>.
                        </p>
                    </div>

                    <div className="mb-5">
                        <label className={labelStyle}>Verification code</label>

                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            placeholder="Enter 6-digit OTP"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-center text-xl font-bold tracking-[0.5em] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                    </div>

                    <button
                        onClick={handleOTP}
                        disabled={loading}
                        className={primaryButton}
                    >
                        {loading ? "Verifying..." : "Verify email"}
                    </button>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                        <button
                            onClick={() => {
                                setStep(1);
                                clearMessages();
                            }}
                            className={secondaryButton}
                        >
                            Change email
                        </button>

                        <button
                            onClick={handleResend}
                            disabled={loading}
                            className={secondaryButton}
                        >
                            Resend code
                        </button>
                    </div>
                </>
            );
        }

        if (step === 3) {
            return (
                <>
                    <div className="mb-7">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                            Step 03 — Security
                        </span>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Secure your account
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Choose a strong password to protect your account.
                        </p>
                    </div>

                    {renderPassword("Password", password, setPassword, showpass, setShowpass, "Create a password")}
                    {renderPassword("Confirm password", confirmPassword, setConfirmPassword, showconfirm, setShowconfirm, "Re-enter your password")}

                    <button
                        onClick={handlePassword}
                        disabled={loading}
                        className={primaryButton}
                    >
                        {loading ? "Saving..." : "Continue"}
                        {!loading && <span className="ml-2">→</span>}
                    </button>
                </>
            );
        }

        return (
            <>
                <div className="mb-7">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                        Step 04 — Almost there
                    </span>

                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Complete your profile
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Add your details to finish setting up ParkNest.
                    </p>
                </div>

                {renderInput("Full name", user, name, setName, "Your full name")}
                {renderInput("Phone number", telephone, phone, setPhone, "Your phone number", "tel")}

                <button
                    onClick={handleSignup}
                    disabled={loading}
                    className={primaryButton}
                >
                    {loading ? "Creating account..." : "Create account"}
                    {!loading && <span className="ml-2">✓</span>}
                </button>
            </>
        );
    };

    return (
        <main className="grid min-h-screen bg-slate-50 dark:bg-slate-950 lg:h-screen lg:grid-cols-2 lg:overflow-hidden">
            <section className="relative hidden min-h-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 p-10 text-white lg:flex xl:p-14">
                <div className="absolute -right-32 top-20 h-96 w-96 rounded-full border border-white/10" />
                <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full border border-white/10" />

                <img
                    src={parknestlogo}
                    alt="ParkNest"
                    className="relative z-10 w-44 object-contain brightness-0 invert"
                />

                <div className="relative z-10 max-w-lg">
                    <div className="mb-7 flex h-32 w-32 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur xl:h-40 xl:w-40">
                        <span className="text-7xl font-black xl:text-8xl">P</span>
                    </div>

                    <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                        Parking made
                        <span className="block text-blue-300">simple.</span>
                    </h1>

                    <p className="mt-5 max-w-md text-base leading-7 text-blue-100 xl:text-lg xl:leading-8">
                        Find convenient parking spaces and manage your properties
                        with ParkNest.
                    </p>
                </div>

                <p className="relative z-10 text-sm text-blue-200">
                    Your space. Your convenience.
                </p>
            </section>

            <section className="flex min-h-screen items-center justify-center px-5 py-12 dark:bg-slate-950 sm:px-8 lg:min-h-0 lg:overflow-y-auto lg:px-12">
                <div className="w-full max-w-md">
                    <div className="mb-8 flex items-center justify-between lg:hidden">
                        <div className="flex items-center gap-3">
                            <img
                                src={parknestlogo}
                                alt="ParkNest"
                                className="h-10 w-10 rounded-lg object-contain"
                            />

                            <span className="text-xl font-bold text-slate-900 dark:text-white">
                                ParkNest
                            </span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Already have an account?{" "}
                            <button
                                onClick={() => navigate("/login")}
                                className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                                Log in
                            </button>
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-9">
                        {renderProgress()}
                        {pageContent()}
                    </div>

                    {error && (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {message}
                        </div>
                    )}

                    <p className="mt-8 text-center text-xs text-slate-400">
                        By creating an account, you agree to use ParkNest responsibly.
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Signup_card;
