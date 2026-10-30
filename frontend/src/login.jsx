
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import loginImage from "./assets/user.png";
import mail from "./assets/mail.png";
import lock from "./assets/padlock.png";
import show from "./assets/show.png";
import hide from "./assets/hide.png";
import parknestlogo from "./assets/parknest.png";

function Login_card() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showpass, setShowpass] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || "Login failed");
                return;
            }

            if (data.token) {
                localStorage.setItem("token", data.token);
                navigate("/dashboard", { state: { name: data.name } });
            } else {
                setError("Login failed. Please try again.");
            }
        } catch {
            setError("Unable to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="grid min-h-[100svh] w-full bg-white dark:bg-slate-950 lg:h-[100svh] lg:min-h-0 lg:grid-cols-2 lg:overflow-hidden">
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

            <section className="flex min-h-[100svh] items-center justify-center px-6 py-20 sm:px-10 lg:min-h-0 lg:px-12 lg:py-10">
                <div className="w-full max-w-md">
                    <img
                        src={parknestlogo}
                        alt="ParkNest"
                        className="mx-auto mb-8 w-36 object-contain lg:hidden"
                    />

                    <div className="mb-8">
                        <img
                            src={loginImage}
                            alt="User"
                            className="mb-5 h-14 w-14 object-contain"
                        />

                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Welcome back
                        </h2>

                        <p className="mt-3 text-slate-500 dark:text-slate-400">
                            Log in to continue to your ParkNest account.
                        </p>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                    }}>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">
                            Email address
                        </label>

                        <div className="mb-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:bg-slate-800 dark:focus-within:ring-blue-900/40">
                            <img src={mail} alt="" className="h-5 w-5 shrink-0 object-contain" />
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                                required
                            />
                        </div>

                        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">
                            Password
                        </label>

                        <div className="mb-4 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:bg-slate-800 dark:focus-within:ring-blue-900/40">
                            <img src={lock} alt="" className="h-5 w-5 shrink-0 object-contain" />

                            <input
                                id="password"
                                type={showpass ? "text" : "password"}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                                required
                            />

                            <button
                                type="button"
                                onClick={() => setShowpass(!showpass)}
                                aria-label={showpass ? "Hide password" : "Show password"}
                                className="shrink-0"
                            >
                                <img
                                    src={showpass ? hide : show}
                                    alt=""
                                    className="h-5 w-5 object-contain"
                                />
                            </button>
                        </div>

                        {error && (
                            <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 w-full rounded-xl bg-blue-600 py-4 font-semibold text-white shadow-lg shadow-blue-200/60 transition duration-200 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="mt-10 pb-2 text-center text-sm text-slate-500 dark:text-slate-400">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Login_card;
