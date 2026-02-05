"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SearchWidget() {
    const router = useRouter();
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [date, setDate] = useState("");
    const [passengers, setPassengers] = useState(1);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (!from || !to || !date) {
            toast.error("Vui lòng nhập đầy đủ thông tin tìm kiếm");
            return;
        }

        const params = new URLSearchParams();
        params.set("startPoint", from);
        params.set("endPoint", to);
        params.set("date", date);
        params.set("passengers", passengers.toString());

        router.push(`/search?${params.toString()}`);
    };

    // ... imports

    return (
        <section className="px-4 lg:px-40 relative z-30 -mt-20 mb-12">
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 max-w-6xl mx-auto">
                <form onSubmit={handleSearch} className="flex flex-col xl:flex-row gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* From Field */}
                        <label className="flex flex-col w-full">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 ml-1">Nơi đi</span>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-primary">trip_origin</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Điểm đi (Ví dụ: Hà Nội)"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary font-medium truncate"
                                />
                            </div>
                        </label>
                        {/* To Field */}
                        <label className="flex flex-col w-full">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 ml-1">Nơi đến</span>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-primary">location_on</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Điểm đến (Ví dụ: Đà Nẵng)"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary font-medium truncate"
                                />
                            </div>
                        </label>
                        {/* Date Field */}
                        <label className="flex flex-col w-full">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 ml-1">Ngày đi</span>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                                </div>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary font-medium"
                                />
                            </div>
                        </label>
                        {/* Passengers Field */}
                        <label className="flex flex-col w-full">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 ml-1">Hành khách</span>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-primary">group</span>
                                </div>
                                <select
                                    value={passengers}
                                    onChange={(e) => setPassengers(parseInt(e.target.value))}
                                    className="w-full pl-10 pr-8 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-medium appearance-none truncate"
                                >
                                    <option value={1}>1 Hành khách</option>
                                    <option value={2}>2 Hành khách</option>
                                    <option value={3}>3 Hành khách</option>
                                    <option value={4}>4+ Hành khách</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Search Button */}
                    <div className="w-full xl:w-auto mt-4 xl:mt-0 xl:min-w-[150px]">
                        {/* Invisible label for alignment */}
                        <div className="hidden xl:block text-xs font-semibold uppercase tracking-wider mb-2 ml-1 opacity-0 select-none">
                            Tìm kiếm
                        </div>
                        <button type="submit" className="w-full h-[48px] bg-primary hover:from-sky-500 hover:to-blue-600 hover:scale-[1.02] bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95">
                            <span className="material-symbols-outlined">search</span>
                            <span>Tìm chuyến</span>
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
