import book from "./assets/book-reader.png";
import land from "./assets/land-plot.png";
import userdash from "./assets/user_dash.png";
import turnoff from "./assets/turn-off.png";
import { useState, useEffect } from "react";
import available_space from "./assets/available_space.png";
import mybookings from "./assets/mybookings.png";
import mylands from "./assets/mylands.png"
import "./activepage.css";
import car from "./assets/car.png"
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";


function Dashboard_main() {
    const [location, setLocation] = useState([11.0168, 76.9558]);
    const [mapExpanded, setMapExpanded] = useState(false);
    const [mouseDownPosition, setMouseDownPosition] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation([
                    position.coords.latitude,
                    position.coords.longitude
                ]);
            },
            () => {},
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, []);

    function handleMapMouseDown(e) {
        setMouseDownPosition({
            x: e.clientX,
            y: e.clientY
        });
    }

    function handleMapMouseUp(e) {
        if (!mouseDownPosition) return;

        const distance = Math.sqrt(
            Math.pow(e.clientX - mouseDownPosition.x, 2) +
            Math.pow(e.clientY - mouseDownPosition.y, 2)
        );

        if (distance < 5) {
            setMapExpanded(!mapExpanded);
        }

        setMouseDownPosition(null);
    }
    return (
        <>
            <h1 id = "dashboard_txt">Dashboard</h1>
            {/* name from backend here */}
            <h2 id = "welcomde_txt">Welcome back!backend name</h2>
            <div className = "cards_container">
                <div className = "availablespace">
                    <img src = {available_space} />
                    <h2>Available Parking space</h2>
                    <h1>backend</h1>
                </div>
                <div className = "mybookings">
                    <img src = {mybookings} />
                    <h2>My Bookings</h2>
                    <h1>backend</h1>
                </div>
                <div className = "mylands">
                    <img src = {mylands} />
                    <h2>My Lands</h2>
                    <h1>backend</h1>
                </div>
            </div>
            <div
                className={mapExpanded ? "map_container expanded" : "map_container"}
                onMouseDown={handleMapMouseDown}
                onMouseUp={handleMapMouseUp}
            >
                <MapContainer
                    center={location}
                    zoom={16}
                    className="map"
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="© OpenStreetMap contributors"
                    />

                    <ZoomControl position="bottomright" />

                    <Marker position={location}>
                        <Popup>You are here</Popup>
                    </Marker>
                </MapContainer>
            </div>
        </>
    );
}



function FindParking() {

    return (
        <div className="find_parking_card">
            <h1>Find Parking</h1>
            <img src={car} alt="Car" id="car_img" />
        </div>
    );
}
function AddLand() {

    return (
        <div className="add_land_card">
            <h1>Add Land</h1>
            <img src={land} alt="Land" id="land_img" />
        </div>
    );
}
function MyBookings() {

    return (
        <div className="mybookings_card">
            <h1>My Bookings</h1>
            <img src={book} alt="My Bookings" id="mybookings_img" />
        </div>
    );
}
function MyLands() {

    return (
        <div className="mylands_card">
            <h1>My Lands</h1>
            <img src={land} alt="My Lands" id="mylands_img" />
        </div>
    );
}
function Profile() {

    return (
        <div className="profile_card">
            <h1>Profile</h1>
            <img src={userdash} alt="Profile" id="profile_img" />
        </div>
    );
}
function Logout() {

    return (
        <div className="logout_card">
            <h1>Logout</h1>
            <img src={turnoff} alt="Logout" id="logout_img" />
        </div>
    );
}
export {Dashboard_main,FindParking,AddLand,MyBookings,MyLands,Profile,Logout};