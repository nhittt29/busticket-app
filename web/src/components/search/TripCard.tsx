import { Schedule } from "@/types/schedule";
import { useState, useEffect } from "react";
import { format, differenceInMinutes, parseISO } from "date-fns";
import {
    Star,
    Calendar,
    ArrowRight,
    Bus,
    Armchair,
    Bed,
    Clock,
    MapPin,
    AlertTriangle,
    CheckCircle,
    XCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TripCardProps {
    schedule: Schedule;
}

export function TripCard({ schedule }: TripCardProps) {
    const departure = parseISO(schedule.departureAt);
    const arrival = parseISO(schedule.arrivalAt);
    const durationMinutes = differenceInMinutes(arrival, departure);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const durationString = `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;

    // Status Logic mirroring Flutter App
    // Initialize with static data (seats) for SSR consistency
    const [status, setStatus] = useState(() => {
        if (schedule.availableSeats === 0) return "FULL";
        if (schedule.availableSeats <= 5) return "FEW_SEATS";
        return "UPCOMING";
    });

    useEffect(() => {
        // Calculate live status on client side only
        const checkStatus = () => {
            let newStatus = "UPCOMING";
            if (schedule.availableSeats === 0) newStatus = "FULL";
            else if (schedule.availableSeats <= 5) newStatus = "FEW_SEATS";

            const now = new Date();
            if (now > departure) newStatus = "ONGOING";
            if (now > arrival) newStatus = "COMPLETED";

            if (newStatus !== status) setStatus(newStatus);
        };

        checkStatus();
        // Optional: Interval to update status every minute
        const timer = setInterval(checkStatus, 60000);
        return () => clearInterval(timer);
    }, [departure, arrival, schedule.availableSeats]);

    // HIDE trip if it has departed (ONGOING or COMPLETED) - User Request
    if (status === "ONGOING" || status === "COMPLETED") return null;

    const isBookable = status === "UPCOMING" || status === "FEW_SEATS";

    // Colors
    const primaryBlue = "text-blue-700";
    const bgBlueLight = "bg-blue-50";
    const textDarkBlue = "text-slate-900 dark:text-slate-100";

    return (
        <div className="group relative transition-all duration-300 hover:-translate-y-1">
            <Link href={isBookable ? `/booking/${schedule.id}` : "#"} className={cn("block", !isBookable && "cursor-not-allowed")}>
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 overflow-hidden relative">

                    {/* Header: Bus Name + Info */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-1">
                                {schedule.bus.brand?.name || "Nhà xe"}
                            </h3>
                            <div className="flex items-center gap-3 text-sm">
                                {/* REMOVED RATING AS REQUESTED */}
                                <div className="flex items-center text-slate-500 dark:text-slate-400 font-medium">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {format(departure, "dd/MM/yyyy")}
                                </div>
                                <div className="flex items-center text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs">
                                    {schedule.bus.type === "SLEEPER" ? "Giường nằm" : "Ghế ngồi"}
                                </div>
                            </div>
                        </div>
                        <StatusChip status={status} />
                    </div>

                    {/* Route Time & Layout */}
                    <div className="flex items-center justify-between mb-6">
                        {/* Departure */}
                        <div className="text-left w-24">
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                                {format(departure, "HH:mm")}
                            </div>
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                                {schedule.route.startPoint}
                            </div>
                        </div>

                        {/* Duration Line */}
                        <div className="flex-1 px-4 flex flex-col items-center">
                            <div className="text-xs text-slate-500 font-medium mb-1">{durationString}</div>
                            <div className="w-full flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                                <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-800 relative">
                                    <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 bg-white dark:bg-slate-900" />
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                            </div>
                        </div>

                        {/* Arrival */}
                        <div className="text-right w-24">
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                                {format(arrival, "HH:mm")}
                            </div>
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                                {schedule.route.endPoint}
                            </div>
                        </div>
                    </div>

                    {/* Footer: Seats, Price & Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div>
                            {schedule.availableSeats > 0 && (
                                <div className={cn(
                                    "px-2 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1.5",
                                    schedule.availableSeats < 5
                                        ? "bg-red-50 text-red-600 dark:bg-red-900/20"
                                        : "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                                )}>
                                    {schedule.availableSeats < 5 ? (
                                        <AlertTriangle className="w-3 h-3" />
                                    ) : (
                                        <Armchair className="w-3 h-3" />
                                    )}
                                    Còn {schedule.availableSeats} ghế
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-xl font-bold text-green-600 dark:text-green-500">
                                    {(schedule.route.lowestPrice || 0).toLocaleString('vi-VN')}đ
                                </div>
                            </div>

                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl text-sm transition-colors shadow-blue-200 dark:shadow-none shadow-lg">
                                Chọn chuyến
                            </button>
                        </div>
                    </div>

                    {/* Disabled Overlay */}
                    {!isBookable && (
                        <div className="absolute inset-0 bg-white/60 dark:bg-black/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                {status === "FULL" ? "Hết vé" : "Đã đóng"}
                            </div>
                        </div>
                    )}
                </div>
            </Link>
        </div>
    );
}

function StatusChip({ status }: { status: string }) {
    switch (status) {
        case 'UPCOMING':
            return <Chip label="Sắp chạy" color="text-orange-500" bg="bg-orange-50 dark:bg-orange-900/20" icon={Clock} />;
        case 'ONGOING':
            return <Chip label="Đang chạy" color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" icon={Bus} />;
        case 'COMPLETED':
            return <Chip label="Đã xong" color="text-green-600" bg="bg-green-50 dark:bg-green-900/20" icon={CheckCircle} />;
        case 'FULL':
            return <Chip label="Hết vé" color="text-red-600" bg="bg-red-50 dark:bg-red-900/20" icon={XCircle} />;
        case 'FEW_SEATS':
            return <Chip label="Sắp hết" color="text-orange-600" bg="bg-orange-50 dark:bg-orange-900/20" icon={AlertTriangle} />;
        default:
            return null;
    }
}

function Chip({ label, color, bg, icon: Icon }: { label: string, color: string, bg: string, icon: any }) {
    return (
        <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg border border-transparent", bg, color)}>
            <Icon className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </div>
    );
}
