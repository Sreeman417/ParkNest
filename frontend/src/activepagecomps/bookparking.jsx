
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function BookParking() {
    const location = useLocation();
    const navigate = useNavigate();
    const space = location.state?.space;

    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [hours, setHours] = useState(1);
    const [slotCount, setSlotCount] = useState(1);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(null);

    if (!space) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    No parking space selected
                </h2>
                <button
                    onClick={() => navigate("/dashboard/findparking")}
                    className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
                >
                    Find Parking
                </button>
            </div>
        );
    }

    const pricePerHour = Number(space.price) || 0;
    const total = pricePerHour * hours * slotCount;

    const today = new Date();
    const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    const handleBooking = async () => {
        setError("");

        if (!date || !startTime) {
            setError("Please select a parking date and entry time.");
            return;
        }

        if (!space._id) {
            setError("Parking space ID is missing. Please search again.");
            return;
        }

        if (slotCount < 1 || slotCount > Number(space.slots)) {
            setError("Invalid number of parking slots.");
            return;
        }

        const start = new Date(`${date}T${startTime}`);

        if (Number.isNaN(start.getTime()) || start <= new Date()) {
            setError("Please select a future date and time.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Your session has expired. Please log in again.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/booking_request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    land_id: space._id,
                    start_time: start.toISOString(),
                    hours: Number(hours),
                    slot_count: Number(slotCount)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Booking request failed.");
            }

            setBooking(data);
        } catch (err) {
            setError(err.message || "Unable to submit booking.");
        } finally {
            setLoading(false);
        }
    };

    if (booking) {
        const statusMessages = {
            pending: "Your request has been sent to the landowner. Waiting for approval.",
            accepted: "Your booking has been accepted automatically. You can proceed to payment when payment is available.",
            confirmed: "Your booking is confirmed.",
            rejected: "Your booking request was rejected."
        };

        const message = statusMessages[booking.status] ||
            `Your booking status is ${booking.status}.`;

        return (
            <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-slate-900">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
                    ✓
                </div>

                <h2 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
                    Booking Request Submitted
                </h2>

                <p className="mt-3 text-slate-500 dark:text-slate-400">
                    {message}
                </p>

                {booking.total_price !== undefined && (
                    <p className="mt-3 font-bold text-blue-600">
                        Total: ₹{Number(booking.total_price).toFixed(2)}
                    </p>
                )}

                {booking.booking_id && (
                    <p className="mt-2 text-xs text-slate-400">
                        Booking ID: {booking.booking_id}
                    </p>
                )}

                <button
                    onClick={() => navigate("/dashboard/mybookings")}
                    className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                    View My Bookings
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate("/dashboard/findparking")}
                        className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Search
                    </button>

                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Booking Reservation
                    </h1>

                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Reserve your parking space in a few simple steps.
                    </p>
                </div>

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Selected Parking Space
                </span>
            </div>

            <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-7">
                    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-6 flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 font-bold text-white dark:bg-blue-600">
                                1
                            </span>

                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Parking Details
                                </h2>

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Confirm your selected parking location.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 rounded-xl bg-slate-50 p-5 dark:bg-slate-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {space.title}
                            </h3>

                            <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <span className="material-symbols-outlined text-blue-600">
                                    location_on
                                </span>
                                {space.address}
                            </p>

                            <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Available slots
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {space.slots}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Price per slot per hour
                                </span>
                                <span className="font-bold text-blue-600">
                                    ₹{pricePerHour.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 font-bold text-white dark:bg-blue-600">
                                2
                            </span>

                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Select Reservation Window
                                </h2>

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Choose when you need the parking space.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Parking Date
                                </span>

                                <input
                                    type="date"
                                    min={localToday}
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </label>

                            <label className="space-y-2">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Entry Time
                                </span>

                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </label>
                        </div>

                        <label className="block space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Parking Duration
                                </span>

                                <span className="font-bold text-blue-600">
                                    {hours} {hours === 1 ? "Hour" : "Hours"}
                                </span>
                            </div>

                            <input
                                type="range"
                                min="1"
                                max="12"
                                value={hours}
                                onChange={e => setHours(Number(e.target.value))}
                                className="w-full accent-blue-600"
                            />

                            <div className="flex justify-between text-xs text-slate-500">
                                <span>1 hour</span>
                                <span>12 hours</span>
                            </div>
                        </label>

                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 4, 6, 8, 12].map(value => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setHours(value)}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                        hours === value
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-100 text-slate-700 hover:bg-blue-100 dark:bg-slate-800 dark:text-slate-300"
                                    }`}
                                >
                                    {value}h
                                </button>
                            ))}
                        </div>

                        <label className="block space-y-2">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Number of parking slots
                            </span>

                            <input
                                type="number"
                                min="1"
                                max={Number(space.slots)}
                                value={slotCount}
                                onChange={e => setSlotCount(Number(e.target.value))}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </label>
                    </section>
                </div>

                <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-5">
                    <section className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                Booking Summary
                            </span>

                            <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                                {space.title}
                            </h2>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between gap-3">
                                <span className="text-slate-500 dark:text-slate-400">Date</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {date || "Not selected"}
                                </span>
                            </div>

                            <div className="flex justify-between gap-3">
                                <span className="text-slate-500 dark:text-slate-400">Entry</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {startTime || "Not selected"}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Duration</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {hours} hours
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Slots</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {slotCount}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">
                                    ₹{pricePerHour.toFixed(2)} × {slotCount} slots × {hours} hours
                                </span>

                                <span className="font-semibold text-slate-900 dark:text-white">
                                    ₹{total.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                    Total
                                </span>

                                <span className="text-2xl font-extrabold text-blue-600">
                                    ₹{total.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {error && (
                            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={handleBooking}
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 font-bold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span className="material-symbols-outlined">lock</span>
                            {loading ? "Submitting..." : "Send Booking Request"}
                        </button>

                        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                            Your request will be processed according to the landowner's booking mode.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default BookParking;
