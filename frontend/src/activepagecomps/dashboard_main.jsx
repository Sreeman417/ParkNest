
import available_space from "../assets/available_space.png";
import mybookings from "../assets/mybookings.png";
import mylands from "../assets/mylands.png";
import parknestLogo from "../assets/parknest.png";
import "../activepage.css";
import Map from "./map.jsx";

function Dashboard_main({ setactivepage, name }) {
    return (
        <div className="page_shell dashboard_page">
            <div className="page_intro">
                <span className="eyebrow">YOUR PARKING SPACE</span>
                <h1 id="dashboard_txt">
                    <img src={parknestLogo} alt="ParkNest" />
                </h1>
                <h2 id="welcomde_txt">
                    Welcome back! {name || "Driver"}
                </h2>
                <p>Manage your parking, bookings and properties in one place.</p>
            </div>

            <div className="cards_container">
                <div
                    className="availablespace"
                    onClick={() => setactivepage("find_parking")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={event => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setactivepage("find_parking");
                        }
                    }}
                >
                    <img src={available_space} alt="Available Parking Space" />
                    <h2>Available Parking Space</h2>
                    <h1>Find a spot</h1>
                </div>

                <div
                    className="mybookings"
                    onClick={() => setactivepage("mybookings")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={event => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setactivepage("mybookings");
                        }
                    }}
                >
                    <img src={mybookings} alt="My Bookings" />
                    <h2>My Bookings</h2>
                    <h1>View bookings</h1>
                </div>

                <div
                    className="mylands"
                    onClick={() => setactivepage("mylands")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={event => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setactivepage("mylands");
                        }
                    }}
                >
                    <img src={mylands} alt="My Lands" />
                    <h2>My Lands</h2>
                    <h1>Manage spaces</h1>
                </div>
            </div>

            <div className="section_heading">
                <h2>Explore Nearby</h2>
                <p>Real parking locations and useful places will appear here when available.</p>
            </div>

            <Map />
        </div>
    );
}

export default Dashboard_main;
