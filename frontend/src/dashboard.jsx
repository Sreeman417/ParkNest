
import { useState, useEffect, useRef } from "react";
import "./App.css";
import "./dashboard.css";
import "./activepage.css";
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
                !event.target.closest(".menu_btn")
            ) {
                setSidebar(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [sidebar]);

    return (
        <div>
            <button
                className={sidebar ? "menu_btn active" : "menu_btn"}
                onClick={toggleSidebar}
            >
                <img src={list} alt="List" id="list_img" />
            </button>

            <div
                ref={sidebarRef}
                className={sidebar ? "sidebar active" : "sidebar"}
            >
                <img
                    src={parknest}
                    alt="Parknest"
                    className="parknest_logo"
                />

                <button
                    className={`sidebar_btn ${activepage === "dashboard" ? "selected" : ""}`}
                    onClick={() => setactivepage("dashboard")}
                >
                    <img src={home} alt="Dashboard" />
                    <span>Dashboard</span>
                </button>

                <button
                    className={`sidebar_btn ${activepage === "find_parking" ? "selected" : ""}`}
                    onClick={() => setactivepage("find_parking")}
                >
                    <img src={magnifying_glass} alt="Find Parking" />
                    <span>Find Parking</span>
                </button>

                <button
                    className={`sidebar_btn ${activepage === "add_land" ? "selected" : ""}`}
                    onClick={() => setactivepage("add_land")}
                >
                    <img src={add} alt="Add Land" />
                    <span>Add Land</span>
                </button>

                <button
                    className={`sidebar_btn ${activepage === "mybookings" ? "selected" : ""}`}
                    onClick={() => setactivepage("mybookings")}
                >
                    <img src={book} alt="My Bookings" />
                    <span>My Bookings</span>
                </button>

                <button
                    className={`sidebar_btn ${activepage === "mylands" ? "selected" : ""}`}
                    onClick={() => setactivepage("mylands")}
                >
                    <img src={land} alt="My Lands" />
                    <span>My Lands</span>
                </button>

                <button
                    className={`sidebar_btn ${activepage === "profile" ? "selected" : ""}`}
                    onClick={() => setactivepage("profile")}
                >
                    <img src={userdash} alt="Profile" />
                    <span>Profile</span>
                </button>

                <button
                    className="sidebar_btn logout_btn"
                    onClick={() => setShowLogoutConfirm(true)}
                >
                    <img src={turnoff} alt="Logout" />
                    <span>Logout</span>
                </button>
            </div>

            <Carddisplayer
                page={activepage}
                setactivepage={setactivepage}
            />

            {showLogoutConfirm && (
                <div className="logout_overlay">
                    <div className="logout_popup">
                        <h2>Are you sure?</h2>
                        <p>Do you really want to log out of ParkNest?</p>

                        <div className="logout_popup_actions">
                            <button
                                className="popup_cancel"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="popup_confirm"
                                onClick={() => {
                                    setShowLogoutConfirm(false);
                                    setSidebar(false);
                                    setactivepage("logout");
                                }}
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
        <div className="page_transition">
            <Carddisp
                page={props.page}
                setactivepage={props.setactivepage}
                name={location.state?.name}
            />
        </div>
    );
}

export default Dashboard;
