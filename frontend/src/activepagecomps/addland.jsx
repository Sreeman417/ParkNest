
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
    const [Loading, setLoading] = useState(false);

    const update = event => {
        setForm(current => ({
            ...current,
            [event.target.name]: event.target.value
        }));
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
                        latitude: String(lat),
                        longitude: String(lng)
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

    const submit = async event => {
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

    const inputClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";
    const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-200";

    const utilities = [
        "Electricity",
        "Water",
        "Road access",
        "Street lighting",
        "Security",
        "CCTV",
        "Restroom",
        "EV charging"
    ];

    return (
        <div className="min-h-screen w-full bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                <div className="mb-8">
                    <span className="text-xs font-bold tracking-[0.2em] text-blue-600 dark:text-blue-400">
                        PROPERTY OWNER
                    </span>

                    <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                        Add your property
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Turn your unused land into a parking space. Provide your property details and available facilities.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">

                    <form
                        onSubmit={submit}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7"
                    >
                        <div className="mb-7 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                <span className="material-symbols-outlined">domain</span>
                            </div>

                            <div>
                                <h2 className="text-lg font-bold">Property details</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Enter the basic information about your land.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            <label className={labelClass}>
                                Property name
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={update}
                                    placeholder="e.g. Gandhipuram Open Plot"
                                    className={inputClass}
                                    required
                                />
                            </label>

                            <label className={labelClass}>
                                Land area
                                <input
                                    name="area"
                                    type="text"
                                    value={form.area}
                                    onChange={update}
                                    placeholder="e.g. 2400 sq.ft"
                                    className={inputClass}
                                    required
                                />
                            </label>

                            <div className="sm:col-span-2">
                                <label className={labelClass}>
                                    Full address
                                    <input
                                        name="address"
                                        value={form.address}
                                        onChange={update}
                                        placeholder="Street, area, city"
                                        className={inputClass}
                                        required
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={getCurrentLocation}
                                    disabled={locationLoading}
                                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    <span className="material-symbols-outlined text-lg">my_location</span>
                                    {locationLoading ? "Detecting location..." : "Use my current location"}
                                </button>
                            </div>

                            <label className={labelClass}>
                                Price per hour (₹)
                                <input
                                    name="price"
                                    type="number"
                                    min="1"
                                    value={form.price}
                                    onChange={update}
                                    placeholder="Enter hourly price"
                                    className={inputClass}
                                    required
                                />
                            </label>

                            <label className={labelClass}>
                                Parking spaces
                                <input
                                    name="slots"
                                    type="number"
                                    min="1"
                                    value={form.slots}
                                    onChange={update}
                                    placeholder="Number of spaces"
                                    className={inputClass}
                                    required
                                />
                            </label>

                            <label className={`${labelClass} sm:col-span-2`}>
                                Description
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={update}
                                    rows="4"
                                    placeholder="Access instructions or other details about your property..."
                                    className={`${inputClass} resize-y`}
                                />
                            </label>
                        </div>

                        <div className="my-8 border-t border-slate-200 dark:border-slate-800" />

                        <div className="mb-5">
                            <h3 className="text-base font-bold">
                                Available utilities
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Select all facilities available at your property.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {utilities.map(item => (
                                <label
                                    key={item}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-medium transition ${
                                        form.utilities.includes(item)
                                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500/60 dark:bg-blue-500/10 dark:text-blue-300"
                                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.utilities.includes(item)}
                                        onChange={() => toggleUtility(item)}
                                        className="h-4 w-4 accent-blue-600"
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Your property details will be saved securely.
                            </p>

                            <button
                                type="submit"
                                disabled={Loading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span className="material-symbols-outlined text-xl">
                                    {Loading ? "progress_activity" : "save"}
                                </span>
                                {Loading ? "Saving..." : "Save property"}
                            </button>
                        </div>

                        {message && (
                            <p
                                role="status"
                                className={`mt-5 rounded-xl p-4 text-sm font-medium ${
                                    message.includes("successfully")
                                        ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                                        : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                }`}
                            >
                                {message}
                            </p>
                        )}
                    </form>

                    <div className="space-y-6">
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="border-b border-slate-200 p-5 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                                        location_on
                                    </span>
                                    <div>
                                        <h2 className="font-bold">Property location</h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            View your selected location on the map.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3">
                                <Map />
                            </div>
                        </section>

                        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/5">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">
                                    lightbulb
                                </span>
                                <h3 className="font-bold">Listing tips</h3>
                            </div>

                            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                <li className="flex gap-2">
                                    <span className="text-blue-600">•</span>
                                    Use a recognizable property name.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-blue-600">•</span>
                                    Provide an accurate address.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-blue-600">•</span>
                                    Mention any access restrictions in the description.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-blue-600">•</span>
                                    Select only utilities that are actually available.
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>

                {setactivepage && (
                    <div className="mt-7 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setactivepage("mylands")}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-400"
                        >
                            View my properties
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddLand;
