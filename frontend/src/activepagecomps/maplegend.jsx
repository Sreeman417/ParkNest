
function MapLegend() {
    return (
        <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <span className="text-sm font-bold text-slate-800 dark:text-white">
                Map Legend
            </span>

            <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-blue-600"></span>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                    Your lands
                </span>
            </div>

            <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-green-600"></span>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                    Other owners' lands
                </span>
            </div>

            <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-red-600"></span>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                    Your location
                </span>
            </div>
        </div>
    );
}

export default MapLegend;
