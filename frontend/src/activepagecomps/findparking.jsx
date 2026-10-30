
import "../activepage.css";
import { useState } from "react";
import Map from "./map.jsx";

function FindParking() {
    const [search, setSearch] = useState("");
    const [maxPrice, setMaxPrice] = useState("all");
    const [sort, setSort] = useState("recommended");

    const parkingSpaces = [];

    const filteredSpaces = parkingSpaces
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
                    <div className="empty_results">
                        No parking locations available yet.
                    </div>
                )}
            </div>

            <Map />
        </div>
    );
}

export default FindParking;
