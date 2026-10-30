
import land from "../assets/land-plot.png";
import "../activepage.css";
import { useEffect, useState } from "react";
import Map from "./map.jsx";

function MyLands() {
    const [lands, setLands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchMyLands = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/my_lands", {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        typeof data.detail === "string"
                            ? data.detail
                            : "Could not fetch your properties"
                    );
                }

                setLands(data.lands || []);
            } catch (error) {
                setMessage(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMyLands();
    }, []);

    return (
        <div className="page_shell">
            <div className="page_intro">
                <span className="eyebrow">PROPERTY MANAGEMENT</span>
                <h1>My properties</h1>
                <p>Review your listed parking lands, rates and basic utilities.</p>
            </div>

            {loading ? (
                <div className="empty_results">Loading properties...</div>
            ) : message ? (
                <div className="empty_results">{message}</div>
            ) : lands.length ? (
                <div className="property_grid">
                    {lands.map(item => (
                        <article className="property_card" key={item._id}>
                            <div className="property_card_top">
                                <img src={land} alt="" />
                                <span className="parking_badge">
                                    {item.slots} spaces
                                </span>
                            </div>

                            <h2>{item.title}</h2>
                            <p>{item.address}</p>

                            <p className="property_area">
                                {item.area || "Land area not provided"}
                            </p>

                            <div className="property_price">
                                ₹{item.price}/hour
                            </div>

                            <div className="utility_tags">
                                {(item.utilities || []).map(utility => (
                                    <span key={utility}>{utility}</span>
                                ))}
                            </div>

                            <button
                                className="secondary_btn"
                                onClick={() => window.dispatchEvent(
                                    new CustomEvent("showPlaceOnMap", {
                                        detail: {
                                            lat: Number(item.latitude),
                                            lng: Number(item.longitude),
                                            name: item.title
                                        }
                                    })
                                )}
                            >
                                Show on map
                            </button>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="empty_results">
                    You haven't added any properties yet.
                </div>
            )}

            <Map />
        </div>
    );
}

export default MyLands;
