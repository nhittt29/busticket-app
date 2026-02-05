import { Schedule } from "@/types/schedule";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { UserAvatar } from "../ui/UserAvatar";

interface TripCardProps {
    schedule: Schedule;
}

export function TripCard({ schedule }: TripCardProps) {
    const formatTime = (dateStr: string) => {
        return format(new Date(dateStr), "HH:mm");
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const duration = schedule.route.duration;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-all hover:shadow-md hover:border-primary/20 group">
            <div className="flex flex-col md:flex-row gap-6">

                {/* 1. Bus Image & Carrier Info */}
                <div className="w-full md:w-48 flex-shrink-0">
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
                        {schedule.bus.images && schedule.bus.images.length > 0 ? (
                            <img src={schedule.bus.images[0]} alt="Bus" className="w-full h-full object-cover" />
                        ) : (
                            // Fallback placeholder
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined text-4xl">directions_bus</span>
                            </div>
                        )}
                        <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/70 backdrop-blur text-[10px] font-bold px-2 py-1 rounded">
                            {schedule.bus.type}
                        </div>
                    </div>
                    {schedule.bus.brand && (
                        <div className="mt-3 flex items-center gap-2">
                            {/* Brand Avatar? Or just name */}
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                {schedule.bus.brand.name.substring(0, 1)}
                            </div>
                            <span className="text-sm font-semibold truncate">{schedule.bus.brand.name}</span>
                        </div>
                    )}
                </div>

                {/* 2. Schedule Info */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    {formatTime(schedule.departureAt)}
                                    <span className="text-slate-400 font-normal text-sm material-symbols-outlined">arrow_forward</span>
                                    {formatTime(schedule.arrivalAt)}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {schedule.route.startPoint}
                                    <span className="mx-2">•</span>
                                    {schedule.route.endPoint}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-black text-primary">
                                    {formatPrice(schedule.price)}
                                </div>
                                <p className="text-xs text-slate-400">/khách</p>
                            </div>
                        </div>

                        {/* Timeline / Duration Visual */}
                        <div className="flex items-center gap-3 text-sm text-slate-500 mb-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg w-fit">
                            <span className="material-symbols-outlined text-base">schedule</span>
                            <span>{duration} giờ di chuyển</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-green-600 font-medium">Còn {schedule.availableSeats} chỗ trống</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-auto">
                        <Link href={`/booking/${schedule.id}`} className="px-6 py-2.5 bg-primary hover:bg-sky-600 text-white font-bold rounded-lg shadow transition-colors flex items-center gap-2">
                            <span>Chọn chuyến</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
