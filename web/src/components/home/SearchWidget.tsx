export function SearchWidget() {
    return (
        <section className="px-4 lg:px-40 relative z-30 -mt-20 mb-12">
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 max-w-6xl mx-auto">
                <form className="flex flex-col xl:flex-row gap-4 items-end">
                    {/* From Field */}
                    <label className="flex flex-col w-full xl:w-1/4">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 ml-1">Nơi đi</span>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-primary">trip_origin</span>
                            </div>
                            <input type="text" placeholder="Điểm đi" className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary font-medium" />
                        </div>
                    </label>
                    {/* To Field */}
                    <label className="flex flex-col w-full xl:w-1/4">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 ml-1">Nơi đến</span>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-primary">location_on</span>
                            </div>
                            <input type="text" placeholder="Điểm đến" className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary font-medium" />
                        </div>
                    </label>
                    {/* Date Field */}
                    <label className="flex flex-col w-full sm:w-1/2 xl:w-1/5">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 ml-1">Ngày đi</span>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-primary">calendar_today</span>
                            </div>
                            <input type="date" className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary font-medium" />
                        </div>
                    </label>
                    {/* Passengers Field */}
                    <label className="flex flex-col w-full sm:w-1/2 xl:w-1/6">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 ml-1">Hành khách</span>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-primary">group</span>
                            </div>
                            <select className="w-full pl-10 pr-8 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-medium appearance-none">
                                <option>1 Hành khách</option>
                                <option>2 Hành khách</option>
                                <option>3 Hành khách</option>
                                <option>4+ Hành khách</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </div>
                        </div>
                    </label>
                    {/* Search Button */}
                    <div className="w-full xl:w-auto xl:flex-1">
                        <button type="button" className="w-full h-[48px] bg-primary hover:bg-sky-600 text-white font-bold rounded-lg shadow-lg shadow-primary/40 flex items-center justify-center gap-2 transition-all active:scale-95">
                            <span className="material-symbols-outlined">search</span>
                            <span>Tìm chuyến xe</span>
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
