import book from "./assets/book-reader.png";
import land from "./assets/land-plot.png";
import userdash from "./assets/user_dash.png";
import turnoff from "./assets/turn-off.png";
import available_space from "./assets/available_space.png";
import mybookings from "./assets/mybookings.png";
import mylands from "./assets/mylands.png";
import "./activepage.css";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { useEffect, useRef, useState } from "react";
import parknestLogo from "./assets/parknest.png";
const defaultParkingSpaces = [
    { id: 1, name: "City Centre Parking", address: "Gandhipuram, Coimbatore", price: 40, distance: "0.8 km", available: 8, lat: 11.0183, lng: 76.9674 },
    { id: 2, name: "Mall Road Parking", address: "RS Puram, Coimbatore", price: 60, distance: "1.5 km", available: 5, lat: 11.0068, lng: 76.9558 },
    { id: 3, name: "Market Side Parking", address: "Town Hall, Coimbatore", price: 30, distance: "2.1 km", available: 12, lat: 10.9945, lng: 76.9616 }
];

const sampleLands = [
    { id: "sample-1", title: "Gandhipuram Open Plot", address: "Gandhipuram, Coimbatore", area: "2,400 sq.ft", price: 50, slots: 10, lat: 11.0195, lng: 76.9662, utilities: ["Electricity", "Water", "Road access"] },
    { id: "sample-2", title: "RS Puram Parking Land", address: "RS Puram, Coimbatore", area: "1,800 sq.ft", price: 40, slots: 7, lat: 11.0061, lng: 76.9537, utilities: ["Electricity", "Road access"] },
    { id: "sample-3", title: "Town Hall Side Plot", address: "Town Hall, Coimbatore", area: "3,000 sq.ft", price: 35, slots: 14, lat: 10.9951, lng: 76.9608, utilities: ["Water", "Electricity", "Road access", "Lighting"] }
];

const nearbyUtilities = [
    { id: "utility-1", name: "Hospital", type: "Hospital", lat: 11.0172, lng: 76.9631 },
    { id: "utility-2", name: "Grocery store", type: "Grocery", lat: 11.0128, lng: 76.9592 },
    { id: "utility-3", name: "Petrol station", type: "Petrol station", lat: 11.0221, lng: 76.9712 },
    { id: "utility-4", name: "Bus stop", type: "Public transport", lat: 11.0187, lng: 76.9701 },
    { id: "utility-5", name: "School", type: "School", lat: 11.0091, lng: 76.9642 }
];

const localDate = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const readSaved = (key, fallback) => {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

const saveData = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        return;
    }
};

function resetPageScroll() {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    document.querySelectorAll(
        "main, .main_content, .content_area, .dashboard_content, .page_content"
    ).forEach(element => {
        element.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
}

function Map({ showNearby = true }) {
    const [location, setLocation] = useState({ lat: 11.0168, lng: 76.9558 });
    const mapRef = useRef(null);
    const googleMap = useRef(null);
    const userMarker = useRef(null);
    const selectedMarker = useRef(null);
    const allMarkers = useRef([]);
    const selectedPlace = useRef(null);
    const locationRef = useRef(location);

    useEffect(() => {
        locationRef.current = location;

        if (googleMap.current && userMarker.current && !selectedPlace.current) {
            googleMap.current.setCenter(location);
            userMarker.current.position = location;
        }
    }, [location]);

    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            position => setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }),
            () => {},
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }, []);

    useEffect(() => {
        const handleShowPlace = event => {
            const place = event.detail;

            if (!place || typeof place.lat !== "number" || typeof place.lng !== "number") return;

            selectedPlace.current = place;

            if (googleMap.current) {
                const position = { lat: place.lat, lng: place.lng };

                googleMap.current.setCenter(position);
                googleMap.current.setZoom(17);

                if (selectedMarker.current) {
                    selectedMarker.current.position = position;
                    selectedMarker.current.title = place.name || place.title || "Selected place";
                }
            }
        };

        window.addEventListener("showPlaceOnMap", handleShowPlace);

        return () => window.removeEventListener("showPlaceOnMap", handleShowPlace);
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function initMap() {
            try {
                const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

                if (!apiKey) throw new Error("Add VITE_GOOGLE_MAPS_API_KEY to your .env file.");

                setOptions({ key: apiKey, v: "weekly" });

                const { Map: GoogleMap } = await importLibrary("maps");
                const { AdvancedMarkerElement } = await importLibrary("marker");

                if (cancelled || !mapRef.current) return;

                const selected = selectedPlace.current;
                const center = selected
                    ? { lat: selected.lat, lng: selected.lng }
                    : locationRef.current;

                googleMap.current = new GoogleMap(mapRef.current, {
                    center,
                    zoom: selected ? 17 : 14,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    mapId: "DEMO_MAP_ID"
                });

                userMarker.current = new AdvancedMarkerElement({
                    map: googleMap.current,
                    position: locationRef.current,
                    title: "Your approximate location"
                });

                if (selected) {
                    selectedMarker.current = new AdvancedMarkerElement({
                        map: googleMap.current,
                        position: { lat: selected.lat, lng: selected.lng },
                        title: selected.name || selected.title || "Selected place"
                    });
                }

                if (showNearby) {
                    [...readSaved("parknest_lands", []), ...sampleLands].forEach(place => {
                        const marker = new AdvancedMarkerElement({
                            map: googleMap.current,
                            position: { lat: place.lat, lng: place.lng },
                            title: `${place.title || place.name} · ₹${place.price}/hour`
                        });

                        allMarkers.current.push(marker);
                    });

                    nearbyUtilities.forEach(place => {
                        const marker = new AdvancedMarkerElement({
                            map: googleMap.current,
                            position: { lat: place.lat, lng: place.lng },
                            title: `${place.type}: ${place.name}`
                        });

                        allMarkers.current.push(marker);
                    });
                }
            } catch (error) {
                console.error("Google Maps failed to load:", error);
            }
        }

        initMap();

        return () => {
            cancelled = true;

            allMarkers.current.forEach(marker => {
                marker.map = null;
            });

            allMarkers.current = [];

            if (selectedMarker.current) {
                selectedMarker.current.map = null;
                selectedMarker.current = null;
            }
        };
    }, [showNearby]);

    return (
        <div className="map_section">
            <div className="map_legend">
                <span><i className="legend_dot legend_user" /> Your location</span>
                {showNearby && <span><i className="legend_dot legend_land" /> Available lands</span>}
                {showNearby && <span><i className="legend_dot legend_utility" /> Nearby utilities</span>}
            </div>

            <div className="map_container">
                <div ref={mapRef} className="map" />
            </div>

            <p className="demo_note">
                Map pins and listings are sample data for the Coimbatore area. Replace them with verified backend or Google Places data before launch.
            </p>
        </div>
    );
}

function FindParking() {
    const [search, setSearch] = useState("");
    const [maxPrice, setMaxPrice] = useState("all");
    const [sort, setSort] = useState("recommended");

    const filteredSpaces = defaultParkingSpaces
        .filter(space =>
            `${space.name} ${space.address}`.toLowerCase().includes(search.trim().toLowerCase())
        )
        .filter(space => maxPrice === "all" || space.price <= Number(maxPrice))
        .sort((a, b) =>
            sort === "price"
                ? a.price - b.price
                : sort === "availability"
                    ? b.available - a.available
                    : a.id - b.id
        );

    return (
        <div className="page_shell">
            <div className="page_intro">
                <span className="eyebrow">PARKING SEARCH</span>
                <h1>Find Parking</h1>
                <p>Search parking spaces, compare hourly rates and view nearby amenities.</p>
            </div>

            <section className="find_parking_card">
                <div className="parking_search">
                    <input
                        type="text"
                        placeholder="Search location or parking name"
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                    />

                    <select value={maxPrice} onChange={event => setMaxPrice(event.target.value)}>
                        <option value="all">All prices</option>
                        <option value="30">Up to ₹30/hour</option>
                        <option value="40">Up to ₹40/hour</option>
                        <option value="60">Up to ₹60/hour</option>
                    </select>

                    <select value={sort} onChange={event => setSort(event.target.value)}>
                        <option value="recommended">Recommended</option>
                        <option value="price">Lowest price</option>
                        <option value="availability">Most spaces</option>
                    </select>
                </div>

                <p>{filteredSpaces.length} parking locations found</p>
            </section>

            <div className="parking_results">
                {filteredSpaces.length ? filteredSpaces.map(space => (
                    <article className="parking_card" key={space.id}>
                        <span className="parking_badge">{space.available} spaces available</span>
                        <h2>{space.name}</h2>
                        <p>{space.address}</p>
                        <p>{space.distance} away</p>
                        <p className="parking_price">₹{space.price}/hour</p>
                        <button onClick={() => window.dispatchEvent(
                            new CustomEvent("showPlaceOnMap", { detail: space })
                        )}>
                            Show on Map
                        </button>
                    </article>
                )) : (
                    <div className="empty_results">No parking locations match your search.</div>
                )}
            </div>

            <Map />
        </div>
    );
}

function Dashboard_main({ setactivepage, name }) {
    return (
        <div className="page_shell dashboard_page">
            <div className="page_intro">
                <span className="eyebrow">YOUR PARKING SPACE</span>
                <h1 id="dashboard_txt">
                    <img src={parknestLogo} alt="ParkNest" />
                </h1>
                <h2 id="welcomde_txt">Welcome back! {name || "Driver"}</h2>
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
                <h2>Lands and useful places nearby</h2>
                <p>Explore sample land listings and nearby everyday amenities on the map.</p>
            </div>

            <Map />

            <div className="utility_grid">
                {nearbyUtilities.map(place => (
                    <div className="utility_chip" key={place.id}>
                        <span>{place.type}</span>
                        <strong>{place.name}</strong>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AddLand({ setactivepage }) {
    const [form, setForm] = useState({
        title: "",
        address: "",
        area: "",
        price: "",
        slots: "",
        description: "",
        utilities: ["Road access"]
    });

    const [message, setMessage] = useState("");

    const update = event => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const toggleUtility = utility => {
        setForm(current => ({
            ...current,
            utilities: current.utilities.includes(utility)
                ? current.utilities.filter(item => item !== utility)
                : [...current.utilities, utility]
        }));
    };

    const submit = event => {
        event.preventDefault();

        const saved = readSaved("parknest_lands", []);

        const newLand = {
            ...form,
            id: `land-${Date.now()}`,
            price: Number(form.price),
            slots: Number(form.slots),
            lat: 11.0168,
            lng: 76.9558,
            area: form.area || "Not specified"
        };

        saveData("parknest_lands", [...saved, newLand]);
        setMessage("Property saved in this browser. Connect your backend to publish it to all users.");

        setForm({
            title: "",
            address: "",
            area: "",
            price: "",
            slots: "",
            description: "",
            utilities: ["Road access"]
        });
    };

    return (
        <div className="page_shell">
            <div className="page_intro">
                <span className="eyebrow">PROPERTY OWNER</span>
                <h1>Add a property</h1>
                <p>List your land for parking and tell drivers which basic utilities are available.</p>
            </div>

            <form className="form_card property_form" onSubmit={submit}>
                <h2>Property details</h2>

                <div className="form_grid">
                    <label>
                        Property name
                        <input
                            name="title"
                            value={form.title}
                            onChange={update}
                            placeholder="e.g. Gandhipuram Open Plot"
                            required
                        />
                    </label>

                    <label>
                        Full address
                        <input
                            name="address"
                            value={form.address}
                            onChange={update}
                            placeholder="Street, area, city"
                            required
                        />
                    </label>

                    <label>
                        Land area
                        <input
                            name="area"
                            value={form.area}
                            onChange={update}
                            placeholder="e.g. 2400 sq.ft"
                        />
                    </label>

                    <label>
                        Price per hour (₹)
                        <input
                            name="price"
                            type="number"
                            min="1"
                            value={form.price}
                            onChange={update}
                            required
                        />
                    </label>

                    <label>
                        Parking spaces
                        <input
                            name="slots"
                            type="number"
                            min="1"
                            value={form.slots}
                            onChange={update}
                            required
                        />
                    </label>

                    <label className="full_field">
                        Description
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={update}
                            rows="3"
                            placeholder="Access instructions or other details"
                        />
                    </label>
                </div>

                <h3>Basic utilities available</h3>

                <div className="checkbox_grid">
                    {["Electricity", "Water", "Road access", "Street lighting", "Security", "CCTV", "Restroom", "EV charging"].map(item => (
                        <label className="check_option" key={item}>
                            <input
                                type="checkbox"
                                checked={form.utilities.includes(item)}
                                onChange={() => toggleUtility(item)}
                            />
                            {item}
                        </label>
                    ))}
                </div>

                <button className="primary_btn" type="submit">Save property</button>

                {message && <p className="success_message">{message}</p>}
            </form>

            <Map />

            {setactivepage && (
                <button className="text_btn" onClick={() => setactivepage("mylands")}>
                    View my properties
                </button>
            )}
        </div>
    );
}

function MyBookings() {
    const [bookings, setBookings] = useState(() => readSaved("parknest_bookings", []));
    const [spaceId, setSpaceId] = useState("1");
    const [startDate, setStartDate] = useState(localDate());
    const [endDate, setEndDate] = useState(localDate());
    const [hours, setHours] = useState("2");
    const [message, setMessage] = useState("");

    const selectedSpace = defaultParkingSpaces.find(
        space => String(space.id) === spaceId
    ) || defaultParkingSpaces[0];

    const bookSpace = event => {
        event.preventDefault();

        if (endDate < startDate) {
            setMessage("End date must be on or after the start date.");
            return;
        }

        const booking = {
            id: `booking-${Date.now()}`,
            space: selectedSpace.name,
            address: selectedSpace.address,
            startDate,
            endDate,
            hours: Number(hours),
            price: selectedSpace.price * Number(hours),
            status: "Upcoming"
        };

        const updated = [booking, ...bookings];

        setBookings(updated);
        saveData("parknest_bookings", updated);
        setMessage("Booking added to your calendar.");
    };

    const cancelBooking = id => {
        const updated = bookings.map(item =>
            item.id === id ? { ...item, status: "Cancelled" } : item
        );

        setBookings(updated);
        saveData("parknest_bookings", updated);
    };

    return (
        <div className="page_shell">
            <div className="page_intro">
                <span className="eyebrow">YOUR SCHEDULE</span>
                <h1>Bookings calendar</h1>
                <p>Choose dates for a parking session and keep track of upcoming bookings.</p>
            </div>

            <div className="booking_layout">
                <form className="form_card" onSubmit={bookSpace}>
                    <h2><img src={book} alt="" className="inline_icon" /> Book a parking space</h2>

                    <label>
                        Parking location
                        <select value={spaceId} onChange={event => setSpaceId(event.target.value)}>
                            {defaultParkingSpaces.map(space => (
                                <option key={space.id} value={space.id}>
                                    {space.name} — ₹{space.price}/hour
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="form_grid date_grid">
                        <label>
                            Start date
                            <input
                                type="date"
                                min={localDate()}
                                value={startDate}
                                onChange={event => {
                                    setStartDate(event.target.value);
                                    if (endDate < event.target.value) {
                                        setEndDate(event.target.value);
                                    }
                                }}
                                required
                            />
                        </label>

                        <label>
                            End date
                            <input
                                type="date"
                                min={startDate}
                                value={endDate}
                                onChange={event => setEndDate(event.target.value)}
                                required
                            />
                        </label>
                    </div>

                    <label>
                        Hours per day
                        <select value={hours} onChange={event => setHours(event.target.value)}>
                            <option value="1">1 hour</option>
                            <option value="2">2 hours</option>
                            <option value="4">4 hours</option>
                            <option value="8">8 hours</option>
                            <option value="12">12 hours</option>
                            <option value="24">24 hours</option>
                        </select>
                    </label>

                    <div className="booking_estimate">
                        <span>Estimated daily total</span>
                        <strong>₹{selectedSpace.price * Number(hours)}</strong>
                    </div>

                    <button className="primary_btn" type="submit">Add booking</button>

                    {message && (
                        <p className={message.startsWith("Booking") ? "success_message" : "error_message"}>
                            {message}
                        </p>
                    )}
                </form>

                <div className="calendar_card">
                    <div className="calendar_header">
                        <div>
                            <span className="eyebrow">DATE PICKER</span>
                            <h2>Booking dates</h2>
                        </div>
                        <span className="calendar_icon">▦</span>
                    </div>

                    <label>
                        Choose a date
                        <input
                            type="date"
                            min={localDate()}
                            value={startDate}
                            onChange={event => {
                                setStartDate(event.target.value);
                                if (endDate < event.target.value) {
                                    setEndDate(event.target.value);
                                }
                            }}
                        />
                    </label>

                    <div className="calendar_summary">
                        <strong>
                            {bookings.filter(item =>
                                item.status !== "Cancelled" &&
                                item.startDate <= startDate &&
                                item.endDate >= startDate
                            ).length}
                        </strong>
                        <span>active booking(s) on selected date</span>
                    </div>

                    <p className="muted_text">Use the date fields to choose the exact booking period.</p>
                </div>
            </div>

            <section className="content_section">
                <div className="section_heading">
                    <h2>Your bookings</h2>
                    <p>{bookings.length} saved booking(s)</p>
                </div>

                {bookings.length ? (
                    <div className="booking_list">
                        {bookings.map(item => (
                            <article className="booking_item" key={item.id}>
                                <div className="booking_date">
                                    <strong>
                                        {new Date(`${item.startDate}T12:00:00`).toLocaleDateString("en-IN", { day: "2-digit" })}
                                    </strong>
                                    <span>
                                        {new Date(`${item.startDate}T12:00:00`).toLocaleDateString("en-IN", { month: "short" })}
                                    </span>
                                </div>

                                <div className="booking_details">
                                    <h3>{item.space}</h3>
                                    <p>{item.address}</p>
                                    <p>{item.startDate} to {item.endDate} · {item.hours} hour(s)/day</p>
                                    <strong>₹{item.price}/day</strong>
                                </div>

                                <div className="booking_actions">
                                    <span className={item.status === "Cancelled" ? "status_cancelled" : "status_active"}>
                                        {item.status}
                                    </span>

                                    {item.status !== "Cancelled" && (
                                        <button className="text_btn" onClick={() => cancelBooking(item.id)}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="empty_results">
                        No bookings yet. Choose dates above to add your first booking.
                    </div>
                )}
            </section>
        </div>
    );
}

function MyLands() {
    const [lands, setLands] = useState(() => [
        ...readSaved("parknest_lands", []),
        ...sampleLands
    ]);

    const removeLand = id => {
        const custom = readSaved("parknest_lands", []).filter(item => item.id !== id);
        saveData("parknest_lands", custom);
        setLands([...custom, ...sampleLands]);
    };

    return (
        <div className="page_shell">
            <div className="page_intro">
                <span className="eyebrow">PROPERTY MANAGEMENT</span>
                <h1>My properties</h1>
                <p>Review your listed parking lands, rates and basic utilities.</p>
            </div>

            <div className="property_grid">
                {lands.map(item => (
                    <article className="property_card" key={item.id}>
                        <div className="property_card_top">
                            <img src={land} alt="" />
                            <span className="parking_badge">
                                {item.slots || item.available || 0} spaces
                            </span>
                        </div>

                        <h2>{item.title || item.name}</h2>
                        <p>{item.address}</p>
                        <p className="property_area">{item.area || "Land area not provided"}</p>
                        <div className="property_price">₹{item.price}/hour</div>

                        <div className="utility_tags">
                            {(item.utilities || []).map(utility => (
                                <span key={utility}>{utility}</span>
                            ))}
                        </div>

                        <button
                            className="secondary_btn"
                            onClick={() => window.dispatchEvent(
                                new CustomEvent("showPlaceOnMap", { detail: item })
                            )}
                        >
                            Show on map
                        </button>

                        {!String(item.id).startsWith("sample-") && (
                            <button
                                className="text_btn danger_text"
                                onClick={() => removeLand(item.id)}
                            >
                                Remove listing
                            </button>
                        )}
                    </article>
                ))}
            </div>

            <Map />
        </div>
    );
}


function Profile({ name = "" }) {
    const [profile, setProfile] = useState({
        name: name || "",
        email: "",
        phone: "",
        address: "",
        vehicleType: "Car",
        vehicleNumber: "",
        emergencyContact: "",
        bio: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Please log in again.");
                }

                const response = await fetch(
                    "http://127.0.0.1:8000/main_profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || "Could not load profile.");
                }

                setProfile({
                    name: data.name || name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    vehicleType: data.vehicle || "Car",
                    vehicleNumber: data.vehicel_no || "",
                    emergencyContact: data.emergency_con || "",
                    bio: data.about_u || ""
                });
            } catch (error) {
                setMessage(error.message || "Could not load profile.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [name]);

    const update = event => {
        const { name, value } = event.target;

        setProfile(current => ({
            ...current,
            [name]: value
        }));
    };

    const submit = async event => {
        event.preventDefault();
        setMessage("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Please log in again.");
            }

            const response = await fetch(
                "http://127.0.0.1:8000/main_profile",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: profile.name,
                        address: profile.address,
                        vehicle: profile.vehicleType,
                        vehicel_no: profile.vehicleNumber,
                        emergency_con: profile.emergencyContact,
                        about_u: profile.bio
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to save profile.");
            }

            setMessage("Profile saved successfully.");
        } catch (error) {
            setMessage(error.message || "Could not connect to the server.");
        }
    };

    if (loading) {
        return <div className="page_shell">Loading profile...</div>;
    }

    return (
        <div className="page_shell">
            <div className="page_intro">
                <span className="eyebrow">ACCOUNT SETTINGS</span>
                <h1>Complete your profile</h1>
                <p>Add your contact and vehicle details to make bookings easier.</p>
            </div>

            <form className="form_card profile_form" onSubmit={submit}>
                <div className="profile_banner">
                    <div className="profile_avatar">
                        <img src={userdash} alt="Profile" />
                    </div>
                    <div>
                        <h2>{profile.name || "Your profile"}</h2>
                        <p>ParkNest member</p>
                    </div>
                </div>

                <h3>Personal information</h3>

                <div className="form_grid">
                    <label>
                        Full name
                        <input
                            name="name"
                            value={profile.name}
                            onChange={update}
                            required
                            placeholder="Your full name"
                        />
                    </label>

                    <label>
                        Verified email address
                        <input
                            name="email"
                            type="email"
                            value={profile.email}
                            readOnly
                        />
                    </label>

                    <label>
                        Phone number
                        <input
                            name="phone"
                            type="tel"
                            value={profile.phone}
                            readOnly
                        />
                    </label>

                    <label>
                        Home address
                        <input
                            name="address"
                            value={profile.address}
                            onChange={update}
                            placeholder="Street, area, city"
                        />
                    </label>
                </div>

                <h3>Vehicle information</h3>

                <div className="form_grid">
                    <label>
                        Vehicle type
                        <select
                            name="vehicleType"
                            value={profile.vehicleType}
                            onChange={update}
                        >
                            <option>Car</option>
                            <option>Motorcycle</option>
                            <option>Scooter</option>
                            <option>Van</option>
                            <option>Other</option>
                        </select>
                    </label>

                    <label>
                        Vehicle registration
                        <input
                            name="vehicleNumber"
                            value={profile.vehicleNumber}
                            onChange={update}
                            placeholder="e.g. TN 00 AB 1234"
                        />
                    </label>

                    <label>
                        Emergency contact
                        <input
                            name="emergencyContact"
                            type="tel"
                            value={profile.emergencyContact}
                            onChange={update}
                            placeholder="Optional contact number"
                        />
                    </label>

                    <label className="full_field">
                        About you
                        <textarea
                            name="bio"
                            rows="3"
                            value={profile.bio}
                            onChange={update}
                            placeholder="Any preferences or notes"
                        />
                    </label>
                </div>

                <div className="profile_form_footer">
                    <button className="primary_btn" type="submit">
                        Save profile
                    </button>

                    {message && (
                        <span className="success_message">{message}</span>
                    )}
                </div>
            </form>
        </div>
    );
}


function Logout() {
    return (
        <div className="page_shell">
            <div className="form_card logout_card">
                <img src={turnoff} alt="Logout" id="logout_img" />
                <h1>Log out of ParkNest?</h1>
                <p>Connect this button to your authentication logout function when the backend is ready.</p>
            </div>
        </div>
    );
}

function Carddisp(props) {
    useEffect(() => {
        resetPageScroll();
    }, [props.page]);

    if (props.page === "dashboard") {
        return <Dashboard_main setactivepage={props.setactivepage} name={props.name} />;
    }

    if (props.page === "find_parking") {
        return <FindParking />;
    }

    if (props.page === "add_land") {
        return <AddLand setactivepage={props.setactivepage} />;
    }

    if (props.page === "mybookings") {
        return <MyBookings />;
    }

    if (props.page === "mylands") {
        return <MyLands />;
    }

    if (props.page === "profile") {
        return <Profile name={props.name} />;
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