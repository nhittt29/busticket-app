"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function SearchWidget() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dateInputRef = useRef<HTMLInputElement>(null);
    const [from, setFrom] = useState(searchParams.get("startPoint") || "");
    const [to, setTo] = useState(searchParams.get("endPoint") || "");
    const [date, setDate] = useState(searchParams.get("date") || "");
    const [passengers, setPassengers] = useState(parseInt(searchParams.get("passengers") || "1"));

    // Sync state with URL params when they change (e.g. user navigates)
    useEffect(() => {
        const start = searchParams.get("startPoint");
        const end = searchParams.get("endPoint");
        const d = searchParams.get("date");
        const p = searchParams.get("passengers");

        if (start) setFrom(start);
        if (end) setTo(end);
        if (d) setDate(d);
        if (p) setPassengers(parseInt(p));
    }, [searchParams]);

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
        <section className="px-4 lg:px-40 relative z-30 -mt-24 mb-12">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(8,112,184,0.12)] border border-blue-50/50 dark:border-slate-800 p-8 max-w-6xl mx-auto backdrop-blur-sm">
                <form onSubmit={handleSearch} className="flex flex-col xl:flex-row gap-6">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* From Field */}
                        <label className="flex flex-col w-full">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2.5 ml-1">Nơi đi</span>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-blue-500 group-focus-within:text-blue-600 transition-colors">trip_origin</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Điểm đi (Ví dụ: Hà Nội)"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium truncate transition-all"
                                />
                            </div>
                        </label>
                        {/* To Field */}
                        <label className="flex flex-col w-full">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2.5 ml-1">Nơi đến</span>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-blue-500 group-focus-within:text-blue-600 transition-colors">location_on</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Điểm đến (Ví dụ: Đà Nẵng)"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium truncate transition-all"
                                />
                            </div>
                        </label>
                        {/* Date Field */}
                        <label className="flex flex-col w-full">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2.5 ml-1">Ngày đi</span>
                            <div 
                                className="relative group cursor-pointer"
                                onClick={() => {
                                    if (dateInputRef.current && 'showPicker' in dateInputRef.current) {
                                        try { dateInputRef.current.showPicker(); } catch (e) {}
                                    }
                                }}
                            >
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                    <span className="material-symbols-outlined text-blue-500 group-focus-within:text-blue-600 transition-colors">calendar_today</span>
                                </div>
                                <input
                                    type="text"
                                    readOnly
                                    placeholder="dd/mm/yyyy"
                                    value={date ? format(new Date(date), "dd/MM/yyyy", { locale: vi }) : ""}
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium transition-all pointer-events-none"
                                />
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="absolute bottom-0 left-1/2 w-0 h-0 opacity-0 pointer-events-none"
                                />
                            </div>
                        </label>
                        {/* Passengers Field */}
                        <label className="flex flex-col w-full">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2.5 ml-1">Hành khách</span>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-blue-500 group-focus-within:text-blue-600 transition-colors">group</span>
                                </div>
                                <select
                                    value={passengers}
                                    onChange={(e) => setPassengers(parseInt(e.target.value))}
                                    className="w-full pl-11 pr-10 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium appearance-none truncate transition-all"
                                >
                                    <option value={1}>1 Hành khách</option>
                                    <option value={2}>2 Hành khách</option>
                                    <option value={3}>3 Hành khách</option>
                                    <option value={4}>4 Hành khách</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                                    <span className="material-symbols-outlined text-lg">expand_more</span>
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Search Button */}
                    <div className="w-full xl:w-auto mt-4 xl:mt-0 xl:min-w-[180px] flex flex-col justify-end">
                        <button type="submit" className="w-full h-[60px] bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 group">
                            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">search</span>
                            <span>Tìm chuyến</span>
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
