import { useEffect, useState } from "react";
import userdash from "../assets/user_dash.png";

function Profile({ name = "" }) {
    const [locationLoading, setLocationLoading] = useState(false);

    const getCurrentAddress = () => {
        if (!navigator.geolocation) {
            setMessage("Geolocation is not supported by your browser.");
            return;
        }

        setLocationLoading(true);
        setMessage("");

        navigator.geolocation.getCurrentPosition(
            async position => {
                try {
                    const { latitude, longitude } = position.coords;

                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                    );

                    if (!response.ok) {
                        throw new Error("Could not retrieve your address.");
                    }

                    const data = await response.json();

                    setProfile(current => ({
                        ...current,
                        address: data.display_name || ""
                    }));
                } catch (error) {
                    setMessage(error.message);
                } finally {
                    setLocationLoading(false);
                }
            },
            error => {
                setMessage(
                    error.code === 1
                        ? "Location permission denied."
                        : "Unable to retrieve your location."
                );
                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000
            }
        );
    };
    const initialProfile = {
        name: name || "",
        email: "",
        phone: "",
        address: "",
        vehicleType: "Car",
        vehicleNumber: "",
        emergencyContact: "",
        bio: ""
    };

    const [profile, setProfile] = useState(initialProfile);
    const [savedProfile, setSavedProfile] = useState(initialProfile);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Please log in again.");
                }

                const response = await fetch(
                    "http://127.0.0.1:8000/main_profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Could not load profile."
                    );
                }

                const loadedProfile = {
                    name: data.name || name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    vehicleType: data.vehicle || "Car",
                    vehicleNumber: data.vehicel_no || "",
                    emergencyContact: data.emergency_con || "",
                    bio: data.about_u || ""
                };

                setProfile(loadedProfile);
                setSavedProfile(loadedProfile);
            } catch (error) {
                setMessage(error.message || "Could not load profile.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [name]);

    const update = event => {
        const { name, value } = event.target;

        setProfile(current => ({
            ...current,
            [name]: value
        }));

        setMessage("");
    };

    const submit = async event => {
        event.preventDefault();
        setMessage("");
        setSaving(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Please log in again.");
            }

            const response = await fetch(
                "http://127.0.0.1:8000/main_profile",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: profile.name,
                        address: profile.address,
                        vehicle: profile.vehicleType,
                        vehicel_no: profile.vehicleNumber,
                        emergency_con: profile.emergencyContact,
                        about_u: profile.bio
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to save profile."
                );
            }

            setSavedProfile(profile);
            setMessage("Profile saved successfully.");
        } catch (error) {
            setMessage(error.message || "Could not connect to the server.");
        } finally {
            setSaving(false);
        }
    };

    const discardChanges = () => {
        const confirmed = window.confirm(
            "Are you sure? All your profile information will be cleared."
        );

        if (!confirmed) return;

        const clearedProfile = {
            ...profile,
            name: "",
            address: "",
            vehicleType: "Car",
            vehicleNumber: "",
            emergencyContact: "",
            bio: ""
        };

        setProfile(clearedProfile);
        setSavedProfile(clearedProfile);
        setMessage("");
    };

    const inputClass =
        "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

    const labelClass =
        "block text-sm font-semibold text-slate-700 dark:text-slate-300";

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl animate-pulse space-y-6 text-slate-900 dark:text-slate-100">
                <div className="h-8 w-56 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 text-slate-900 dark:text-slate-100">
            <section className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Account settings
                </span>

                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                    Your profile
                </h1>

                <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                    Manage your personal information and vehicle details to make parking bookings easier.
                </p>
            </section>

            <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-5">
                        <div className="relative shrink-0">
                            <img
                                src={userdash}
                                alt="Profile"
                                className="h-20 w-20 rounded-2xl border-4 border-slate-100 object-cover shadow-md sm:h-24 sm:w-24 dark:border-slate-800"
                            />

                            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-white dark:border-slate-900">
                                <span className="material-symbols-outlined text-sm">
                                    check
                                </span>
                            </span>
                        </div>

                        <div className="min-w-0">
                            <h2 className="break-words text-2xl font-extrabold tracking-tight">
                                {profile.name || "Your profile"}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                ParkNest member
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                    <span className="material-symbols-outlined text-sm">
                                        verified_user
                                    </span>
                                    Account
                                </span>

                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-sm">
                                        directions_car
                                    </span>
                                    {profile.vehicleType}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Profile completion
                        </p>

                        <p className="mt-2 text-2xl font-extrabold">
                            {Math.round(
                                [
                                    profile.name,
                                    profile.email,
                                    profile.phone,
                                    profile.address,
                                    profile.vehicleType,
                                    profile.vehicleNumber,
                                    profile.emergencyContact,
                                    profile.bio
                                ].filter(value => String(value || "").trim()).length / 8 * 100
                            )}%
                        </p>

                        <div className="mt-2 h-1.5 w-40 max-w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                                className="h-full rounded-full bg-blue-600 transition-all"
                                style={{
                                    width: `${Math.round(
                                        [
                                            profile.name,
                                            profile.email,
                                            profile.phone,
                                            profile.address,
                                            profile.vehicleType,
                                            profile.vehicleNumber,
                                            profile.emergencyContact,
                                            profile.bio
                                        ].filter(value => String(value || "").trim()).length / 8 * 100
                                    )}%`
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="relative mt-8 grid grid-cols-1 gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            <span className="material-symbols-outlined">
                                mail
                            </span>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Email address
                            </p>
                            <p className="mt-1 break-all text-sm font-semibold">
                                {profile.email || "Not provided"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <span className="material-symbols-outlined">
                                call
                            </span>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Phone number
                            </p>
                            <p className="mt-1 break-words text-sm font-semibold">
                                {profile.phone || "Not provided"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-violet-50 p-3 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                            <span className="material-symbols-outlined">
                                location_on
                            </span>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Home address
                            </p>
                            <p className="mt-1 break-words text-sm font-semibold">
                                {profile.address || "Not provided"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                            <span className="material-symbols-outlined">
                                directions_car
                            </span>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Vehicle registration
                            </p>
                            <p className="mt-1 break-words text-sm font-semibold">
                                {profile.vehicleNumber || "Not provided"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <form onSubmit={submit} className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-6 flex items-start gap-3">
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            <span className="material-symbols-outlined text-2xl">
                                person
                            </span>
                        </div>

                        <div>
                            <h2 className="text-xl font-extrabold">
                                Personal information
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Keep your contact information up to date.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <label className={labelClass}>
                            Full name
                            <input
                                className={inputClass}
                                name="name"
                                value={profile.name}
                                onChange={update}
                                required
                                placeholder="Your full name"
                            />
                        </label>

                        <label className={labelClass}>
                            Verified email address
                            <div className="relative">
                                <input
                                    className={`${inputClass} cursor-not-allowed pr-11 opacity-75`}
                                    type="email"
                                    value={profile.email}
                                    readOnly
                                />

                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg text-emerald-600">
                                    verified
                                </span>
                            </div>
                        </label>

                        <label className={labelClass}>
                            Phone number
                            <input
                                className={`${inputClass} cursor-not-allowed opacity-75`}
                                type="tel"
                                value={profile.phone}
                                readOnly
                            />
                        </label>

                        <label className={labelClass}>
                            Home address

                            <input
                                className={inputClass}
                                name="address"
                                value={profile.address}
                                onChange={update}
                                placeholder="Street, area, city"
                            />

                            <button
                                type="button"
                                onClick={getCurrentAddress}
                                disabled={locationLoading}
                                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                            >
                                <span className="material-symbols-outlined text-lg">
                                    my_location
                                </span>

                                {locationLoading ? "Getting location..." : "Use my current location"}
                            </button>
                        </label>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-6 flex items-start gap-3">
                        <div className="rounded-xl bg-violet-50 p-3 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                            <span className="material-symbols-outlined text-2xl">
                                directions_car
                            </span>
                        </div>

                        <div>
                            <h2 className="text-xl font-extrabold">
                                Vehicle information
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Add your vehicle details for easier parking reservations.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <label className={labelClass}>
                            Vehicle type
                            <select
                                className={inputClass}
                                name="vehicleType"
                                value={profile.vehicleType}
                                onChange={update}
                            >
                                <option>Car</option>
                                <option>Motorcycle</option>
                                <option>Scooter</option>
                                <option>Van</option>
                                <option>Other</option>
                            </select>
                        </label>

                        <label className={labelClass}>
                            Vehicle registration
                            <input
                                className={inputClass}
                                name="vehicleNumber"
                                value={profile.vehicleNumber}
                                onChange={update}
                                placeholder="e.g. TN 00 AB 1234"
                            />
                        </label>

                        <label className={labelClass}>
                            Emergency contact
                            <input
                                className={inputClass}
                                name="emergencyContact"
                                type="tel"
                                value={profile.emergencyContact}
                                onChange={update}
                                placeholder="Optional contact number"
                            />
                        </label>

                        <label className={`${labelClass} md:col-span-2`}>
                            About you
                            <textarea
                                className={`${inputClass} resize-y`}
                                name="bio"
                                rows="4"
                                value={profile.bio}
                                onChange={update}
                                placeholder="Parking preferences or other notes"
                            />
                        </label>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined mt-0.5 text-2xl text-blue-600 dark:text-blue-400">
                                cloud_done
                            </span>

                            <div>
                                <h3 className="font-bold">
                                    Profile settings
                                </h3>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Save your changes to update your ParkNest profile.
                                </p>

                                {message && (
                                    <p
                                        role="status"
                                        className={`mt-2 text-sm font-semibold ${
                                            message === "Profile saved successfully."
                                                ? "text-emerald-600 dark:text-emerald-400"
                                                : "text-red-600 dark:text-red-400"
                                        }`}
                                    >
                                        {message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={discardChanges}
                                disabled={saving}
                                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                            >
                                Discard changes
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {saving ? "progress_activity" : "save"}
                                </span>

                                {saving ? "Saving..." : "Save profile"}
                            </button>
                        </div>
                    </div>
                </section>
            </form>
        </div>
    );
}

export default Profile;
