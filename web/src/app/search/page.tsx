"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { TripCard } from "@/components/search/TripCard";
import { scheduleApi } from "@/lib/api/schedule";
import { Schedule } from "@/types/schedule";
import { Loader2 } from "lucide-react";
import { SearchWidget } from "@/components/home/SearchWidget"; // Reuse to allow changing search

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Extract params
    const startPoint = searchParams.get("startPoint") || "";
    const endPoint = searchParams.get("endPoint") || "";
    const date = searchParams.get("date") || "";

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // If no date is selected, maybe default to today or show error? 
                // For now allow fetch.
                const data = await scheduleApi.getSchedules({ startPoint, endPoint, date });
                setSchedules(data);
            } catch (err) {
                setError("Không thể tải danh sách chuyến xe. Vui lòng thử lại.");
            } finally {
                setIsLoading(false);
            }
        };

        if (startPoint || endPoint || date) {
            fetchData();
        } else {
            // If accessed directly without params, maybe fetch all or show empty?
            // Let's fetch all for demo purpose of "Browsing"
            fetchData();
        }
    }, [startPoint, endPoint, date]);

    return (
        <div className="min-h-screen bg-background dark:bg-slate-950 pb-20">
            {/* Header / Search Modification Area */}
            {/* Header / Search Modification Area */}
            <div className="bg-gradient-to-r from-[#6AB7F5] to-[#4A9EFF] pt-24 pb-32 px-4 border-b border-blue-400/30">
                <div className="max-w-7xl mx-auto text-center lg:text-left">
                    <h1 className="text-3xl font-black mb-2 text-white">
                        Kết quả tìm kiếm
                    </h1>
                    <p className="text-blue-50 font-medium">
                        {startPoint && endPoint ? (
                            <span className="flex items-center justify-center lg:justify-start gap-2">
                                {startPoint} <span className="opacity-70">➜</span> {endPoint}
                            </span>
                        ) : "Khám phá các chuyến xe"}
                        {date && <span className="block lg:inline lg:ml-2 opacity-90">• {date.split('-').reverse().join('/')}</span>}
                    </p>
                </div>
            </div>

            {/* Overlapping Widget (Re-using existing widget but maybe formatted simpler? For now standard) */}
            {/* Actually, SearchWidget has -mt-20, so it fits perfectly here too */}
            <SearchWidget />

            <div className="max-w-7xl mx-auto px-4 lg:px-40 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="hidden lg:block lg:col-span-1">
                    <FilterSidebar />
                </div>

                {/* Results */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Status Bar */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                            {schedules.length} chuyến xe được tìm thấy
                        </span>
                        {/* Mobile Filter Toggle could go here */}
                    </div>

                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                            <p>Đang tìm chuyến xe tốt nhất...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 bg-red-50 text-red-600 rounded-xl text-center font-medium">
                            {error}
                        </div>
                    ) : schedules.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300">
                            <span className="material-symbols-outlined text-6xl mb-4 text-slate-300">directions_bus_off</span>
                            <p className="text-lg font-semibold">Không tìm thấy chuyến xe nào</p>
                            <p className="text-sm">Hãy thử thay đổi ngày đi hoặc địa điểm khác nhé</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {schedules.map((schedule) => (
                                <TripCard key={schedule.id} schedule={schedule} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <SearchResultsContent />
        </Suspense>
    );
}
