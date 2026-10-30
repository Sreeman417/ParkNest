
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
        <main className="min-h-screen bg-[#f8f9ff] px-5 py-7 font-['Plus_Jakarta_Sans'] text-[#0b1c30] dark:bg-slate-950 dark:text-white sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">

                <section className="mb-7">
                    <span className="inline-flex rounded-full bg-[#dbe1ff] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#003ea8] dark:bg-blue-950 dark:text-blue-300">
                        Parking Search
                    </span>

                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Find Parking
                    </h1>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                        Search parking spaces, compare hourly rates and view nearby amenities.
                    </p>
                </section>

                <section className="mb-7 rounded-2xl bg-[#eff4ff] p-5 shadow-sm dark:bg-slate-900 sm:p-6">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">

                        <div className="w-full lg:col-span-6">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search location or parking name"
                                autoComplete="off"
                                className="!static !m-0 !block !h-12 !w-full !transform-none !appearance-none !rounded-xl !border !border-slate-300 !bg-white !px-4 !py-0 !text-left !text-sm !leading-normal !text-slate-900 !opacity-100 !shadow-none placeholder:!text-slate-400 placeholder:!opacity-100 focus:!border-blue-500 focus:!outline-none focus:!ring-2 focus:!ring-blue-500/20 dark:!border-slate-700 dark:!bg-slate-800 dark:!text-white dark:placeholder:!text-slate-400"
                            />
                        </div>

                        <div className="lg:col-span-3">
                            <select
                                value={maxPrice}
                                onChange={event => setMaxPrice(event.target.value)}
                                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            >
                                <option value="all">All prices</option>
                                <option value="30">Up to ₹30/hour</option>
                                <option value="40">Up to ₹40/hour</option>
                                <option value="60">Up to ₹60/hour</option>
                            </select>
                        </div>

                        <div className="lg:col-span-3">
                            <select
                                value={sort}
                                onChange={event => setSort(event.target.value)}
                                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            >
                                <option value="recommended">Recommended</option>
                                <option value="price">Lowest price</option>
                                <option value="availability">Most spaces</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-blue-100 pt-4 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            <span className="font-extrabold text-slate-900 dark:text-white">
                                {filteredSpaces.length}
                            </span>{" "}
                            parking locations found
                        </p>

                        <span className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Live search
                        </span>
                    </div>
                </section>

                <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">

                    <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold tracking-tight">
                                Available Locations
                            </h2>

                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {filteredSpaces.length} results
                            </span>
                        </div>

                        {filteredSpaces.length ? (
                            filteredSpaces.map(space => (
                                <article
                                    key={space.id}
                                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                            {space.available} spaces available
                                        </span>

                                        <span className="text-lg font-extrabold text-blue-700 dark:text-blue-400">
                                            ₹{space.price}
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                /hour
                                            </span>
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold tracking-tight transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-400">
                                        {space.name}
                                    </h3>

                                    <p className="mt-2 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-base">
                                            location_on
                                        </span>
                                        {space.address}
                                    </p>

                                    <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-base">
                                            near_me
                                        </span>
                                        {space.distance} away
                                    </p>

                                    <div className="mt-4 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => window.dispatchEvent(
                                                new CustomEvent("showPlaceOnMap", { detail: space })
                                            )}
                                            className="flex items-center gap-2 rounded-xl bg-[#0051d5] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                                        >
                                            Show on Map
                                            <span className="material-symbols-outlined text-base">
                                                arrow_forward
                                            </span>
                                        </button>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 text-center dark:border-slate-700 dark:bg-slate-900">
                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                                    <span className="material-symbols-outlined text-3xl">
                                        local_parking
                                    </span>
                                </div>

                                <h3 className="font-bold">
                                    No parking locations available
                                </h3>

                                <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                                    Parking locations will appear here when they become available.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 lg:sticky lg:top-28 lg:col-span-7">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                                <div>
                                    <h2 className="font-bold">Map View</h2>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Explore parking locations nearby
                                    </p>
                                </div>

                                <span className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    Location
                                </span>
                            </div>

                            <div className="min-h-[420px]">
                                <Map />
                            </div>
                        </div>
                    </div>

                </section>
            </div>
        </main>
    );
}

export default FindParking;
