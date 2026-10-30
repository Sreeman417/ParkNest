
import { useState, useEffect, useRef } from "react";
import list from "./assets/list.png";
import home from "./assets/home.png";
import magnifying_glass from "./assets/magnifying-glass.png";
import add from "./assets/add.png";
import book from "./assets/book-reader.png";
import land from "./assets/land-plot.png";
import userdash from "./assets/user_dash.png";
import turnoff from "./assets/turn-off.png";
import parknest from "./assets/parknest.png";
import Carddisp from "./activepage.jsx";
import { useLocation } from "react-router-dom";

function Dashboard() {
    const [sidebar, setSidebar] = useState(false);
    const [activepage, setactivepage] = useState("dashboard");
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const sidebarRef = useRef(null);

    function toggleSidebar() {
        setSidebar(prev => !prev);
    }

    useEffect(() => {
        function handleOutsideClick(event) {
            if (
                sidebar &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target) &&
                !event.target.closest("[data-menu-button]")
            ) {
                setSidebar(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [sidebar]);

    const navigationItems = [
        { id: "dashboard", label: "Dashboard", icon: home },
        { id: "find_parking", label: "Find Parking", icon: magnifying_glass },
        { id: "add_land", label: "Add Land", icon: add },
        { id: "mybookings", label: "My Bookings", icon: book },
        { id: "mylands", label: "My Lands", icon: land },
        { id: "profile", label: "Profile", icon: userdash }
    ];

    const handleNavigation = (page) => {
        setactivepage(page);
        setSidebar(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <button
                data-menu-button
                type="button"
                onClick={toggleSidebar}
                aria-label={sidebar ? "Close sidebar" : "Open sidebar"}
                aria-expanded={sidebar}
                style={{
                    transform: sidebar ? "translateX(230px)" : "translateX(0)",
                    transition: "transform 500ms ease-in-out"
                }}
                className="fixed left-5 top-5 z-[60] flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-md hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
                <img
                    src={list}
                    alt=""
                    id="list_img"
                    className="h-6 w-6 object-contain"
                />
            </button>

            <div
                onClick={() => setSidebar(false)}
                className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 ${
                    sidebar
                        ? "visible opacity-100"
                        : "invisible pointer-events-none opacity-0"
                }`}
            />

            <aside
                ref={sidebarRef}
                style={{
                    transform: sidebar ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 500ms ease-in-out"
                }}
                className="sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-blue-100 bg-blue-50 px-5 py-7 text-slate-800 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
                <div className="mb-10 flex items-center gap-3 px-2">
                    <img
                        src={parknest}
                        alt="ParkNest"
                        className="h-11 w-11 object-contain"
                    />

                    <div>
                        <h1 className="text-xl font-bold tracking-tight">
                            ParkNest
                        </h1>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Parking made simple
                        </p>
                    </div>
                </div>

                <p className="mb-4 px-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Main menu
                </p>

                <nav className="flex flex-1 flex-col gap-2">
                    {navigationItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleNavigation(item.id)}
                            className={`group flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition duration-200 ${
                                activepage === item.id
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-950/40"
                                    : "text-slate-700 hover:bg-blue-100 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                            }`}
                        >
                            <img
                                src={item.icon}
                                alt=""
                                className={`h-6 w-6 shrink-0 object-contain ${
                                    activepage === item.id
                                        ? "brightness-0 invert"
                                        : ""
                                }`}
                            />

                            <span>{item.label}</span>

                            {activepage === item.id && (
                                <span className="ml-auto h-2 w-2 rounded-full bg-white" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="border-t border-blue-200 pt-5 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(true)}
                        className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                        <img
                            src={turnoff}
                            alt=""
                            className="h-6 w-6 shrink-0 object-contain"
                        />

                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <div className="min-h-screen">
                <div className="min-h-screen px-5 pb-8 pt-20 sm:px-8 lg:px-10">
                    <Carddisplayer
                        page={activepage}
                        setactivepage={setactivepage}
                    />
                </div>
            </div>

            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-5 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-500/10">
                            <img
                                src={turnoff}
                                alt=""
                                className="h-7 w-7 object-contain"
                            />
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Are you sure?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Do you really want to log out of ParkNest?
                        </p>

                        <div className="mt-7 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowLogoutConfirm(false);
                                    setSidebar(false);
                                    setactivepage("logout");
                                }}
                                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                            >
                                Yes, log out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Carddisplayer(props) {
    const location = useLocation();

    return (
        <div className="animate-[fadeIn_0.3s_ease-out]">
            <Carddisp
                page={props.page}
                setactivepage={props.setactivepage}
                name={location.state?.name}
            />
        </div>
    );
}

export default Dashboard;
