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

    const updateStartDate = value => {
        setStartDate(value);

        if (endDate < value) {
            setEndDate(value);
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 text-slate-900 dark:text-slate-100">
            <section className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                    Your schedule
                </span>

                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                    My Bookings
                </h1>

                <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                    Choose dates for a parking session and keep track of your upcoming bookings.
                </p>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-6 flex items-center gap-3 text-xl font-bold">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                            <img src={book} alt="" className="h-6 w-6 object-contain" />
                        </span>
                        Book a parking space
                    </h2>

                    <div className="space-y-5">
                        <label className="block space-y-2">
                            <span className="text-sm font-semibold">Parking location</span>
                            <select
                                disabled
                                value=""
                                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                            >
                                <option value="">No parking locations available</option>
                            </select>
                        </label>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <label className="block space-y-2">
                                <span className="text-sm font-semibold">Start date</span>
                                <input
                                    type="date"
                                    min={localDate()}
                                    value={startDate}
                                    onChange={event => updateStartDate(event.target.value)}
                                    required
                                    className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
                                />
                            </label>

                            <label className="block space-y-2">
                                <span className="text-sm font-semibold">End date</span>
                                <input
                                    type="date"
                                    min={startDate}
                                    value={endDate}
                                    onChange={event => setEndDate(event.target.value)}
                                    required
                                    className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
                                />
                            </label>
                        </div>

                        <label className="block space-y-2">
                            <span className="text-sm font-semibold">Hours per day</span>
                            <select
                                value={hours}
                                onChange={event => setHours(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
                            >
                                <option value="1">1 hour</option>
                                <option value="2">2 hours</option>
                                <option value="4">4 hours</option>
                                <option value="8">8 hours</option>
                                <option value="12">12 hours</option>
                                <option value="24">24 hours</option>
                            </select>
                        </label>

                        <div className="flex items-center justify-between gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-500/10">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Estimated daily total
                            </span>
                            <strong className="text-sm font-bold text-blue-700 dark:text-blue-400">
                                Not available
                            </strong>
                        </div>

                        <button
                            type="button"
                            disabled
                            className="w-full cursor-not-allowed rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white opacity-50"
                        >
                            Add booking
                        </button>
                    </div>
                </div>

                <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                Date picker
                            </span>
                            <h2 className="mt-1 text-xl font-bold">Booking dates</h2>
                        </div>

                        <span className="material-symbols-outlined flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            calendar_month
                        </span>
                    </div>

                    <label className="block space-y-2">
                        <span className="text-sm font-semibold">Choose a date</span>
                        <input
                            type="date"
                            min={localDate()}
                            value={startDate}
                            onChange={event => updateStartDate(event.target.value)}
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
                        />
                    </label>

                    <div className="mt-6 flex flex-1 flex-col justify-center rounded-2xl bg-slate-50 p-6 dark:bg-slate-800/70">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Active bookings on selected date
                        </span>

                        <strong className="mt-2 text-5xl font-extrabold tracking-tight">
                            {activeBookings.length}
                        </strong>

                        <span className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {activeBookings.length === 1 ? "booking" : "bookings"} scheduled for {startDate}
                        </span>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Select a date to see bookings covering that day.
                    </p>
                </div>
            </section>

            <section className="space-y-5">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">
                            Your bookings
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Your saved parking reservations.
                        </p>
                    </div>

                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {bookings.length} saved {bookings.length === 1 ? "booking" : "bookings"}
                    </span>
                </div>

                {bookings.length ? (
                    <div className="space-y-4">
                        {bookings.map(item => (
                            <article
                                key={item.id}
                                className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900"
                            >
                                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                    <strong className="text-2xl leading-7">
                                        {new Date(`${item.startDate}T12:00:00`).toLocaleDateString(
                                            "en-IN",
                                            { day: "2-digit" }
                                        )}
                                    </strong>

                                    <span className="text-xs font-bold uppercase">
                                        {new Date(`${item.startDate}T12:00:00`).toLocaleDateString(
                                            "en-IN",
                                            { month: "short" }
                                        )}
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="break-words text-lg font-bold">
                                        {item.space}
                                    </h3>

                                    <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
                                        {item.address}
                                    </p>

                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        {item.startDate} to {item.endDate} · {item.hours} hour(s)/day
                                    </p>

                                    <p className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">
                                        ₹{item.price}/day
                                    </p>
                                </div>

                                <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                                    <span
                                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                                            item.status === "Cancelled"
                                                ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                        }`}
                                    >
                                        {item.status}
                                    </span>

                                    {item.status !== "Cancelled" && (
                                        <button
                                            type="button"
                                            className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                            onClick={() => cancelBooking(item.id)}
                                        >
                                            Cancel booking
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
                        <span className="material-symbols-outlined text-5xl text-slate-400">
                            event_busy
                        </span>

                        <h3 className="mt-4 text-lg font-bold">
                            No bookings yet
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Your parking reservations will appear here once bookings have been saved.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}

export default MyBookings;
