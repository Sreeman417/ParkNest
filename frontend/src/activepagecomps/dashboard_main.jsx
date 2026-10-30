
import { useEffect,useState } from "react";
import available_space from "../assets/available_space.png";
import mybookings from "../assets/mybookings.png";
import mylands from "../assets/mylands.png";
import parknestLogo from "../assets/parknest.png";
import Map from "./map.jsx";

function Dashboard_main({ setactivepage}) {
    const token = localStorage.getItem("token");
    const [name,setname] = useState("");
    const getprofile = async()=>{
        try{
            const response = await fetch("http://127.0.0.1:8000/main_profile",
                {headers:{
                    "Authorization":`Bearer ${token}`
                }
            }
            );
            const data = await response.json();
            setname(data.name);
        }
        catch(err){
            console.log("Error while getting info(name).");
        }
    };
    useEffect(()=>{getprofile();},[]);
    const cards = [
        {
            id: "find_parking",
            image: available_space,
            title: "Find Parking",
            description: "Discover available parking spaces near you and find a convenient place to park.",
            previewTitle: "Explore available spaces",
            previewText: "Find parking near your location",
            action: "Explore spaces",
            color: "text-[#0051d5]",
            iconBg: "bg-[#e5eeff]",
            decoration: "from-[#dbe1ff] to-transparent"
        },
        {
            id: "mybookings",
            image: mybookings,
            title: "My Bookings",
            description: "Keep track of your parking reservations and manage your upcoming bookings.",
            previewTitle: "Your reservations",
            previewText: "View and manage your bookings",
            action: "View bookings",
            color: "text-[#3c475a]",
            iconBg: "bg-[#e5eeff]",
            decoration: "from-[#d3e4fe] to-transparent"
        },
        {
            id: "mylands",
            image: mylands,
            title: "My Lands",
            description: "Manage your listed parking properties and keep your spaces organised.",
            previewTitle: "Your properties",
            previewText: "Manage your listed parking spaces",
            action: "Manage properties",
            color: "text-[#00875a]",
            iconBg: "bg-[#d8f8e8]",
            decoration: "from-[#baf5d8] to-transparent"
        }
    ];

    return (
        <main className="min-h-screen bg-[#f8f9ff] px-4 py-6 font-['Plus_Jakarta_Sans'] text-[#0b1c30] dark:bg-slate-950 dark:text-white sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">

                <section className="mb-8">
                    <div className="flex flex-col items-start justify-between gap-6 rounded-xl bg-[#eff4ff] p-6 shadow-sm dark:bg-slate-900 lg:flex-row lg:items-center lg:p-8">
                        <div className="flex min-w-0 max-w-2xl flex-col">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-[#dbe1ff] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#003ea8] dark:bg-blue-950 dark:text-blue-300">
                                    YOUR PARKING SPACE
                                </span>
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Welcome to ParkNest
                                </span>
                            </div>

                            <h1 className="mb-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Welcome back, {name || "Driver"}!
                            </h1>

                            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                                Everything you need for a smoother parking experience.
                            </p>
                        </div>

                        <div className="flex w-full shrink-0 items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-md dark:bg-slate-800 lg:w-auto lg:justify-start">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#091426]">
                                <img
                                    src={parknestLogo}
                                    alt="ParkNest"
                                    className="h-8 w-8 object-contain"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-[#0b1c30] dark:text-white">
                                    Your Parking Pass
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                    Check your current reservations
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setactivepage("mybookings")}
                                className="flex shrink-0 items-center gap-1 rounded-lg bg-[#0051d5] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#316bf3] active:scale-95"
                            >
                                View
                                <span aria-hidden="true">→</span>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <div className="mb-5">
                        <h2 className="text-xl font-bold tracking-tight">
                            Quick Access
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Everything you need, just one click away.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {cards.map(card => (
                            <button
                                key={card.id}
                                type="button"
                                onClick={() => setactivepage(card.id)}
                                className="group relative flex min-h-[310px] flex-col justify-between overflow-hidden rounded-xl bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0051d5] dark:bg-slate-900"
                            >
                                <div className={`pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-bl-full bg-gradient-to-bl ${card.decoration} opacity-70 transition-transform duration-300 group-hover:scale-110 dark:opacity-20`} />

                                <div className="relative z-10">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} shadow-sm`}>
                                            <img
                                                src={card.image}
                                                alt=""
                                                className="h-8 w-8 object-contain"
                                            />
                                        </div>
                                    </div>

                                    <h3 className="mb-1 text-lg font-bold tracking-tight">
                                        {card.title}
                                    </h3>

                                    <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                                        {card.description}
                                    </p>
                                </div>

                                <div className="relative z-10 mt-6 border-t border-slate-100 pt-4 dark:border-slate-700">
                                    <div className="mb-4 flex items-center justify-between rounded-lg bg-[#eff4ff] p-3 dark:bg-slate-800">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span className={`text-lg ${card.color}`} aria-hidden="true">
                                                ◈
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-bold">
                                                    {card.previewTitle}
                                                </p>
                                                <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
                                                    {card.previewText}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-2 text-sm font-bold ${card.color}`}>
                                        <span>{card.action}</span>
                                        <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                                            →
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="mb-10">
                    <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-[#0051d5]" />
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0051d5] dark:text-blue-400">
                                    Geospatial Explorer
                                </span>
                            </div>

                            <h2 className="text-2xl font-bold tracking-tight">
                                Explore Nearby
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Explore your surroundings and discover nearby locations.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl bg-white shadow-md dark:bg-slate-900">
                        <Map />
                    </div>
                </section>

                <section className="mb-8">
                    <div className="flex flex-col gap-5 rounded-xl bg-[#eff4ff] p-5 shadow-sm dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between lg:p-6">
                        <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl text-[#0051d5] shadow-sm dark:bg-slate-800">
                                    ↗
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        Parking activity
                                    </p>
                                    <p className="text-sm font-bold">
                                        My Bookings
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl text-emerald-600 shadow-sm dark:bg-slate-800">
                                    ◈
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        Listed properties
                                    </p>
                                    <p className="text-sm font-bold">
                                        My Lands
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                                    ▣
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        Account
                                    </p>
                                    <p className="text-sm font-bold">
                                        ParkNest
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setactivepage("mybookings")}
                            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#0b1c30] shadow-sm transition hover:bg-[#dbe1ff] dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                        >
                            View Bookings
                            <span aria-hidden="true">→</span>
                        </button>
                    </div>
                </section>

                <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 py-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row">
                    <p>ParkNest · Your parking companion</p>
                    <p>Find parking. Manage spaces. Park smarter.</p>
                </footer>

            </div>
        </main>
    );
}

export default Dashboard_main;
