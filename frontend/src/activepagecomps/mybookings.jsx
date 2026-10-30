
import "../activepage.css";
import { useState } from "react";
import { readSaved, saveData, localDate } from "./storage";
import book from "../assets/book-reader.png";

function MyBookings() {
    const [bookings, setBookings] = useState(() =>
        readSaved("parknest_bookings", [])
    );
    const [startDate, setStartDate] = useState(localDate());
    const [endDate, setEndDate] = useState(localDate());
    const [hours, setHours] = useState("2");

    const cancelBooking = id => {
        const updated = bookings.map(item =>
            item.id === id ? { ...item, status: "Cancelled" } : item
        );

        setBookings(updated);
        saveData("parknest_bookings", updated);
    };

    const activeBookings = bookings.filter(item =>
        item.status !== "Cancelled" &&
        item.startDate <= startDate &&
        item.endDate >= startDate
    );

    return (
        <div className="page_shell">
            <div className="page_intro">
                <span className="eyebrow">YOUR SCHEDULE</span>
                <h1>Bookings calendar</h1>
                <p>Choose dates for a parking session and keep track of upcoming bookings.</p>
            </div>

            <div className="booking_layout">
                <div className="form_card">
                    <h2>
                        <img src={book} alt="" className="inline_icon" />
                        Book a parking space
                    </h2>

                    <label>
                        Parking location
                        <select disabled value="">
                            <option value="">No parking locations available</option>
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
                        <select
                            value={hours}
                            onChange={event => setHours(event.target.value)}
                        >
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
                        <strong>Not available</strong>
                    </div>

                    <button className="primary_btn" type="button" disabled>
                        Add booking
                    </button>
                </div>

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
                        <strong>{activeBookings.length}</strong>
                        <span>active booking(s) on selected date</span>
                    </div>

                    <p className="muted_text">
                        Use the date fields to choose the exact booking period.
                    </p>
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
                                        {new Date(`${item.startDate}T12:00:00`).toLocaleDateString(
                                            "en-IN",
                                            { day: "2-digit" }
                                        )}
                                    </strong>

                                    <span>
                                        {new Date(`${item.startDate}T12:00:00`).toLocaleDateString(
                                            "en-IN",
                                            { month: "short" }
                                        )}
                                    </span>
                                </div>

                                <div className="booking_details">
                                    <h3>{item.space}</h3>
                                    <p>{item.address}</p>
                                    <p>
                                        {item.startDate} to {item.endDate} · {item.hours} hour(s)/day
                                    </p>
                                    <strong>₹{item.price}/day</strong>
                                </div>

                                <div className="booking_actions">
                                    <span
                                        className={
                                            item.status === "Cancelled"
                                                ? "status_cancelled"
                                                : "status_active"
                                        }
                                    >
                                        {item.status}
                                    </span>

                                    {item.status !== "Cancelled" && (
                                        <button
                                            type="button"
                                            className="text_btn"
                                            onClick={() => cancelBooking(item.id)}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="empty_results">
                        No bookings yet. Real parking locations will be available here once connected.
                    </div>
                )}
            </section>
        </div>
    );
}

export default MyBookings;
