import "../activepage.css";
import { useState } from "react";
import Map from "./map.jsx";


function AddLand({ setactivepage }) {
    const [form, setForm] = useState({
        title: "",
        address: "",
        area: "",
        price: "",
        slots: "",
        description: "",
        utilities: ["Road access"],
        latitude: "",
        longitude: ""
    });

    const [message, setMessage] = useState("");
    const [locationLoading, setLocationLoading] = useState(false);
    const [Loading,setLoading] = useState(false);
    const update = event => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setMessage("Geolocation is not supported by this browser.");
            return;
        }

        setLocationLoading(true);
        setMessage("");

        navigator.geolocation.getCurrentPosition(
            async position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
                    );

                    if (!response.ok) {
                        throw new Error("Could not find the address.");
                    }

                    const data = await response.json();

                    if (!data.display_name) {
                        throw new Error("Address not found for this location.");
                    }

                    setForm(current => ({
                        ...current,
                        address: data.display_name,
                        latitude:String(lat),
                        longitude:String(lng),
                    }));

                    window.dispatchEvent(
                        new CustomEvent("showPlaceOnMap", {
                            detail: {
                                lat,
                                lng,
                                name: "Selected property location"
                            }
                        })
                    );

                    setMessage("Current location loaded successfully.");
                } catch (error) {
                    setMessage(error.message);
                } finally {
                    setLocationLoading(false);
                }
            },
            error => {
                setMessage(
                    error.code === 1
                        ? "Location permission denied. Please allow location access."
                        : "Unable to detect your location. Please try again."
                );
                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    };

    const toggleUtility = utility => {
        setForm(current => ({
            ...current,
            utilities: current.utilities.includes(utility)
                ? current.utilities.filter(item => item !== utility)
                : [...current.utilities, utility]
        }));
    };

    const submit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const newLand = {
                ...form,
                latitude: String(form.latitude ?? ""),
                longitude: String(form.longitude ?? "")
            };

            const response = await fetch("http://127.0.0.1:8000/add_land", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(newLand)
            });

            const data = await response.json();
            if (!response.ok) {
                const errorMessage = Array.isArray(data.detail)
                    ? data.detail.map(item => item.msg).join(", ")
                    : typeof data.detail === "string"
                        ? data.detail
                        : "Could not save property.";

                throw new Error(errorMessage);
            }

            setMessage("Property added successfully.");

            setForm({
                title: "",
                address: "",
                area: "",
                price: "",
                slots: "",
                description: "",
                utilities: ["Road access"],
                latitude: "",
                longitude: ""
            });

        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
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
                        <button
                            className="text_btn"
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                        >
                            {locationLoading ? "Detecting location..." : "Use my current location"}
                        </button>
                    </label>

                    <label>
                        Land area
                        <input
                            name="area"
                            value={form.area}
                            type = "decimal"
                            onChange={update}
                            placeholder="e.g. 2400 sq.ft"
                            required
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
                    {[
                        "Electricity",
                        "Water",
                        "Road access",
                        "Street lighting",
                        "Security",
                        "CCTV",
                        "Restroom",
                        "EV charging"
                    ].map(item => (
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

                <button className="primary_btn" type="submit" disabled={Loading}>
                    {Loading ? "Saving..." : "Save property"}
                </button>

                {message && (
                    <p className="success_message">{message}</p>
                )}
            </form>

            <Map />

            {setactivepage && (
                <button
                    className="text_btn"
                    onClick={() => setactivepage("mylands")}
                >
                    View my properties
                </button>
            )}
        </div>
    );
}

export default AddLand;
