import MapLegend from "./maplegend";
import land from "../assets/land-plot.png";
import { useEffect, useState } from "react";
import Map from "./map.jsx";
import { useNavigate } from "react-router-dom";

function MyLands() {
    const navigate = useNavigate();
    const [lands, setLands] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [actionLoading, setActionLoading] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All Properties");

    const token = localStorage.getItem("token");

    const fetchData = async () => {
        try {
            const headers = {
                Authorization: `Bearer ${token}`
            };

            const [landResponse, bookingResponse] = await Promise.all([
                fetch("http://127.0.0.1:8000/my_lands", { headers }),
                fetch("http://127.0.0.1:8000/owner_pending_bookings", { headers })
            ]);

            const landData = await landResponse.json();
            const bookingData = await bookingResponse.json();

            if (!landResponse.ok) {
                throw new Error(landData.detail || "Could not fetch properties");
            }

            if (!bookingResponse.ok) {
                throw new Error(bookingData.detail || "Could not fetch booking requests");
            }

            setLands(landData.lands || []);
            setRequests(bookingData.bookings || []);
            setMessage("");
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleBookingResponse = async (bookingId, action) => {
        setActionLoading(bookingId);
        setMessage("");

        try {
            const response = await fetch("http://127.0.0.1:8000/booking_response", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    booking_id: bookingId,
                    action
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Could not update booking");
            }

            setMessage(data.message || `Booking ${action}ed successfully`);
            await fetchData();
        } catch (error) {
            setMessage(error.message);
        } finally {
            setActionLoading("");
        }
    };
    const filteredLands = lands.filter(item => {
        const matchesSearch = [
            item.title,
            item.address,
            item.area
        ].some(value =>
            String(value || "").toLowerCase().includes(search.toLowerCase())
        );

        const matchesFilter =
            filter === "All Properties" ||
            String(item.type || "").toLowerCase() === filter.toLowerCase();

        return matchesSearch && matchesFilter;
    });

    const totalSlots = lands.reduce(
        (total, item) => total + (Number(item.slots) || 0),
        0
    );

    const averagePrice = lands.length
        ? lands.reduce((total, item) => total + (Number(item.price) || 0), 0) / lands.length
        : 0;

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 text-slate-900 dark:text-slate-100">
            <section className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Host management portal
                    </span>

                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Property management
                    </span>
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                    My Lands & Properties
                </h1>

                <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                    Manage your listed parking properties, review available spaces, and keep track of your parking rates.
                </p>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                            Total properties
                        </span>
                        <span className="material-symbols-outlined rounded-xl bg-blue-50 p-2 text-xl text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            apartment
                        </span>
                    </div>
                    <p className="mt-5 text-3xl font-extrabold">
                        {loading ? "—" : lands.length}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Your listed parking lands
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                            Total parking spaces
                        </span>
                        <span className="material-symbols-outlined rounded-xl bg-emerald-50 p-2 text-xl text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            local_parking
                        </span>
                    </div>
                    <p className="mt-5 text-3xl font-extrabold">
                        {loading ? "—" : totalSlots}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Spaces across your properties
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                            Average hourly rate
                        </span>
                        <span className="material-symbols-outlined rounded-xl bg-violet-50 p-2 text-xl text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                            currency_rupee
                        </span>
                    </div>
                    <p className="mt-5 text-3xl font-extrabold">
                        {loading ? "—" : `₹${averagePrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Average listed price per hour
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                            Pending requests
                        </span>
                        <span className="material-symbols-outlined rounded-xl bg-amber-50 p-2 text-xl text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                            pending_actions
                        </span>
                    </div>
                    <p className="mt-5 text-3xl font-extrabold">
                        {loading ? "—" : requests.length}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Awaiting your response
                    </p>
                </article>
            </section>

            <section className="space-y-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">
                            Property inventory
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            View your properties and manage their booking requests.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/addland")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
                    >
                        <span className="material-symbols-outlined text-xl">
                            add_circle
                        </span>
                        Add New Land / Lot
                    </button>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400">
                            search
                        </span>
                        <input
                            type="search"
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            placeholder="Search property or address..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
                        />
                    </div>

                    <select
                        value={filter}
                        onChange={event => setFilter(event.target.value)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                    >
                        <option>All Properties</option>
                        {[...new Set(lands.map(item => item.type).filter(Boolean))].map(type => (
                            <option key={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {message && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                        {message}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                        Loading properties...
                    </div>
                ) : filteredLands.length ? (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {filteredLands.map(item => {
                            const landRequests = requests.filter(
                                request => String(request.land_id) === String(item._id)
                            );

                            return (
                                <article
                                    key={item._id}
                                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-6 dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="space-y-5">
                                        <div className="flex items-start gap-4">
                                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                                                <img
                                                    src={land}
                                                    alt="Parking property"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Listed property
                                                </span>
                                                <h3 className="mt-2 break-words text-lg font-bold">
                                                    {item.title}
                                                </h3>
                                                <p className="mt-1 flex items-start gap-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                                                    <span className="material-symbols-outlined mt-0.5 text-base">
                                                        location_on
                                                    </span>
                                                    <span className="break-words">{item.address}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 sm:gap-3 sm:p-4 dark:bg-slate-800/70">
                                            <div className="min-w-0">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    Spaces
                                                </span>
                                                <p className="mt-1 text-xl font-extrabold">
                                                    {item.slots ?? "—"}
                                                </p>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    Total
                                                </span>
                                            </div>

                                            <div className="min-w-0 border-x border-slate-200 px-2 dark:border-slate-700 sm:px-3">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    Rate
                                                </span>
                                                <p className="mt-1 text-xl font-extrabold text-blue-600 dark:text-blue-400">
                                                    ₹{item.price}
                                                </p>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    Per hour
                                                </span>
                                            </div>

                                            <div className="min-w-0">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    Area
                                                </span>
                                                <p className="mt-1 break-words text-base font-bold">
                                                    {item.area || "Not provided"}
                                                </p>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    Land size
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                Available utilities
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {(item.utilities || []).length ? (
                                                    item.utilities.map(utility => (
                                                        <span
                                                            key={utility}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">
                                                                check_circle
                                                            </span>
                                                            {utility}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-slate-400">
                                                        No utilities listed
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                                            <div className="mb-3 flex items-center justify-between gap-2">
                                                <h4 className="font-bold">
                                                    Booking requests
                                                </h4>
                                                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                                    {landRequests.length} pending
                                                </span>
                                            </div>

                                            {landRequests.length ? (
                                                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                                                    {landRequests.map(request => (
                                                        <div
                                                            key={request._id}
                                                            className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm font-bold">
                                                                        {request.customer_email}
                                                                    </p>
                                                                    <a
                                                                        href={`tel:${request.customer_phone}`}
                                                                        className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">
                                                                            call
                                                                        </span>
                                                                        {request.customer_phone || "Phone not available"}
                                                                    </a>
                                                                </div>

                                                                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                                                                    Pending
                                                                </span>
                                                            </div>

                                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                                                <span>{request.slot_count} slots</span>
                                                                <span>{request.hours} hours</span>
                                                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                                                    ₹{request.total_price}
                                                                </span>
                                                            </div>

                                                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                                {new Date(request.start_time).toLocaleString()}
                                                            </p>

                                                            <div className="mt-3 flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    disabled={actionLoading !== ""}
                                                                    onClick={() => handleBookingResponse(request._id, "accept")}
                                                                    className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    {actionLoading === request._id ? "Please wait..." : "Accept"}
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    disabled={actionLoading !== ""}
                                                                    onClick={() => handleBookingResponse(request._id, "reject")}
                                                                    className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    {actionLoading === request._id ? "Please wait..." : "Decline"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                                                    No pending booking requests for this property.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            Property ID: {String(item._id).slice(-8)}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => window.dispatchEvent(
                                                new CustomEvent("showPlaceOnMap", {
                                                    detail: {
                                                        lat: Number(item.latitude),
                                                        lng: Number(item.longitude),
                                                        name: item.title
                                                    }
                                                })
                                            )}
                                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-blue-500 dark:hover:text-white"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                map
                                            </span>
                                            Show on map
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
                        <span className="material-symbols-outlined text-5xl text-slate-400">
                            {lands.length ? "search_off" : "location_city"}
                        </span>
                        <h3 className="mt-4 text-lg font-bold">
                            {lands.length ? "No matching properties" : "No properties yet"}
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {lands.length
                                ? "Try changing your search or property filter."
                                : "Once you add a parking property, its location, hourly rate, spaces and utilities will appear here."}
                        </p>
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight">
                        Property locations
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Select Show on map on a property card to locate it.
                    </p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <MapLegend/>
                    <Map />
                </div>
            </section>
        </div>
    );
}

export default MyLands;
