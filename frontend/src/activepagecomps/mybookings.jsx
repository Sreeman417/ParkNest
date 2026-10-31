
import { useState, useEffect } from "react";

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch("http://127.0.0.1:8000/my_bookings", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || "Could not fetch bookings");
                }

                setBookings(data.bookings || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const activeCount = bookings.filter(item =>
        ["pending", "accepted", "confirmed"].includes(item.status)
    ).length;

    const formatDate = value => {
        return new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatTime = value => {
        return new Date(value).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusStyle = status => {
        const styles = {
            pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
            accepted: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
            payment_pending: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
            confirmed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
            rejected: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
            expired: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
            cancelled: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
        };

        return styles[status] || styles.pending;
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 text-slate-900 dark:text-slate-100">
            <section className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                    Your reservations
                </span>

                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                    My Bookings
                </h1>

                <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                    View and track your parking reservations.
                </p>
            </section>

            <section className="space-y-5">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">
                            Your bookings
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            All your parking reservations.
                        </p>
                    </div>

                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {activeCount} {activeCount === 1 ? "active booking" : "active bookings"}
                    </span>
                </div>

                {loading ? (
                    <div className="py-14 text-center text-slate-500">
                        Loading your bookings...
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                        {error}
                    </div>
                ) : bookings.length ? (
                    <div className="space-y-4">
                        {bookings.map(item => (
                            <article
                                key={item._id}
                                className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900"
                            >
                                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                    <strong className="text-2xl leading-7">
                                        {new Date(item.start_time).toLocaleDateString("en-IN", {
                                            day: "2-digit"
                                        })}
                                    </strong>

                                    <span className="text-xs font-bold uppercase">
                                        {new Date(item.start_time).toLocaleDateString("en-IN", {
                                            month: "short"
                                        })}
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="break-words text-lg font-bold">
                                        {item.land_title}
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        {formatDate(item.start_time)}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {formatTime(item.start_time)} – {formatTime(item.end_time)}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {item.slot_count} slot(s) · {item.hours} hour(s)
                                    </p>

                                    <p className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">
                                        ₹{item.total_price}
                                    </p>
                                </div>

                                <div className="shrink-0 sm:self-start">
                                    <span className={`inline-block rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(item.status)}`}>
                                        {item.status.replace("_", " ").toUpperCase()}
                                    </span>
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
                            Your parking reservations will appear here once you make a booking.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}

export default MyBookings;
