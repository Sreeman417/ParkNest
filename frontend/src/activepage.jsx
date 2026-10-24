import book from "./assets/book-reader.png";
import land from "./assets/land-plot.png";
import userdash from "./assets/user_dash.png";
import turnoff from "./assets/turn-off.png";
import { useState, useEffect, useRef } from "react";
import available_space from "./assets/available_space.png";
import mybookings from "./assets/mybookings.png";
import mylands from "./assets/mylands.png";
import "./activepage.css";
import car from "./assets/car.png";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";


function Map(){
    const [location, setLocation] = useState([11.0168, 76.9558]);
    const mapRef = useRef(null);
    const googleMap = useRef(null);
    const marker = useRef(null);
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

    useEffect(() => {
        async function initMap() {
            try {
                setOptions({
                    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
                    v: "weekly"
                });

                const { Map } = await importLibrary("maps");
                const { AdvancedMarkerElement } = await importLibrary("marker");

                googleMap.current = new Map(mapRef.current, {
                    center: {
                        lat: location[0],
                        lng: location[1]
                    },
                    zoom: 16,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    mapId: "DEMO_MAP_ID"
                });

                marker.current = new AdvancedMarkerElement({
                    map: googleMap.current,
                    position: {
                        lat: location[0],
                        lng: location[1]
                    },
                    title: "You are here"
                });
            } catch (error) {
                console.error(error);
            }
        }

        initMap();
    }, []);

    useEffect(() => {
        if (googleMap.current && marker.current) {
            const position = {
                lat: location[0],
                lng: location[1]
            };

            googleMap.current.setCenter(position);
            marker.current.position = position;
        }
    }, [location]);
    return(
        <div className="map_container">
                <div
                    ref={mapRef}
                    className="map"
                ></div>
            </div>

    );
}

function Dashboard_main({ setactivepage }) {
    const [location, setLocation] = useState([11.0168, 76.9558]);

    const mapRef = useRef(null);
    const googleMap = useRef(null);
    const marker = useRef(null);

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

    useEffect(() => {
        async function initMap() {
            try {
                setOptions({
                    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
                    v: "weekly"
                });

                const { Map } = await importLibrary("maps");
                const { AdvancedMarkerElement } = await importLibrary("marker");

                googleMap.current = new Map(mapRef.current, {
                    center: {
                        lat: location[0],
                        lng: location[1]
                    },
                    zoom: 16,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    mapId: "DEMO_MAP_ID"
                });

                marker.current = new AdvancedMarkerElement({
                    map: googleMap.current,
                    position: {
                        lat: location[0],
                        lng: location[1]
                    },
                    title: "You are here"
                });
            } catch (error) {
                console.error(error);
            }
        }

        initMap();
    }, []);

    useEffect(() => {
        if (googleMap.current && marker.current) {
            const position = {
                lat: location[0],
                lng: location[1]
            };

            googleMap.current.setCenter(position);
            marker.current.position = position;
        }
    }, [location]);

    return (
        <div>
            <h1 id="dashboard_txt">ParkNest</h1>

            <h2 id="welcomde_txt">Welcome back! name from backend</h2>

            <div className="cards_container">

                <div
                    className="availablespace"
                    onClick={() => {
                        setactivepage("find_parking");
                    }}
                >
                    <img
                        src={available_space}
                        alt="Available Parking Space"
                    />
                    <h2>Available Parking Space</h2>
                    <h1>backend</h1>
                </div>

                <div
                    className="mybookings"
                    onClick={() => {
                        setactivepage("mybookings");
                    }}
                >
                    <img
                        src={mybookings}
                        alt="My Bookings"
                    />
                    <h2>My Bookings</h2>
                    <h1>backend</h1>
                </div>

                <div
                    className="mylands"
                    onClick={() => {
                        setactivepage("mylands");
                    }}
                >
                    <img
                        src={mylands}
                        alt="My Lands"
                    />
                    <h2>My Lands</h2>
                    <h1>backend</h1>
                </div>

            </div>

            <div className="map_container">
                <div
                    ref={mapRef}
                    className="map"
                ></div>
            </div>
        </div>
    );
}

function FindParking() {
    return (
        <div>
            <div className="find_parking_card">
                <h1>Find Parking</h1>
                
            </div>
            <Map/>
        </div>
    );
}

function AddLand() {
    return (
        <div>
            <div className="add_land_card">
                <h1>Add Land</h1>
            </div>
            <Map/>
        </div>
    );
}

function MyBookings() {
    return (
        <div className="mybookings_card">
            <h1>My Bookings</h1>
            <img
                src={book}
                alt="My Bookings"
                id="mybookings_img"
            />
        </div>
    );
}

function MyLands() {
    return (
        <div className="mylands_card">
            <h1>My Lands</h1>
            <img
                src={land}
                alt="My Lands"
                id="mylands_img"
            />
        </div>
    );
}

function Profile() {
    return (
        <div className="profile_card">
            <h1>Profile</h1>
            <img
                src={userdash}
                alt="Profile"
                id="profile_img"
            />
        </div>
    );
}

function Logout() {
    return (
        <div className="logout_card">
            <h1>Logout</h1>
            <img
                src={turnoff}
                alt="Logout"
                id="logout_img"
            />
        </div>
    );
}

function Carddisp(props) {
    if (props.page === "dashboard") {
        return (
            <Dashboard_main
                setactivepage={props.setactivepage}
            />
        );
    }

    if (props.page === "find_parking") {
        return <FindParking />;
    }

    if (props.page === "add_land") {
        return <AddLand />;
    }

    if (props.page === "mybookings") {
        return <MyBookings />;
    }

    if (props.page === "mylands") {
        return <MyLands />;
    }

    if (props.page === "profile") {
        return <Profile />;
    }

    if (props.page === "logout") {
        return <Logout />;
    }

    return null;
}

export {
    Dashboard_main,
    FindParking,
    AddLand,
    MyBookings,
    MyLands,
    Profile,
    Logout,
    Carddisp
};