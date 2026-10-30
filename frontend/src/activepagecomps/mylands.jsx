
import land from "../assets/land-plot.png";
import "../activepage.css";
import { useState } from "react";
import { readSaved, saveData } from "./storage.js";
import Map from "./map.jsx";

function MyLands() {
    const [lands, setLands] = useState(() =>
        readSaved("parknest_lands", [])
    );

    const removeLand = id => {
        const updated = lands.filter(item => item.id !== id);

        saveData("parknest_lands", updated);
        setLands(updated);
    };

    return (
        <div className="page_shell">
            <div className="page_intro">
                <span className="eyebrow">PROPERTY MANAGEMENT</span>
                <h1>My properties</h1>
                <p>Review your listed parking lands, rates and basic utilities.</p>
            </div>

            {lands.length ? (
                <div className="property_grid">
                    {lands.map(item => (
                        <article className="property_card" key={item.id}>
                            <div className="property_card_top">
                                <img src={land} alt="" />
                                <span className="parking_badge">
                                    {item.slots || 0} spaces
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
                                        detail: item
                                    })
                                )}
                            >
                                Show on map
                            </button>

                            <button
                                className="text_btn danger_text"
                                onClick={() => removeLand(item.id)}
                            >
                                Remove listing
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
