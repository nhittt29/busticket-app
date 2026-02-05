"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SeatLayout41 } from "./SeatLayout41";
import { SeatLayout34 } from "./SeatLayout34";
import { SeatLayout28 } from "./SeatLayout28";
import { SeatLayout45 } from "./SeatLayout45";
import { Seat, SeatMapResponse } from "@/types/seat";
import { seatApi } from "@/lib/api/seat";
import { Loader2 } from "lucide-react";

interface BookingPageContentProps {
    scheduleId: number;
}

export function BookingPageContent({ scheduleId }: BookingPageContentProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [seatMap, setSeatMap] = useState<SeatMapResponse | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [maxSeats] = useState(8); // Updated policy to 8 seats

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const data = await seatApi.getSeatsBySchedule(scheduleId);
                setSeatMap(data);
            } catch (error) {
                console.error("Failed to fetch seats:", error);
                toast.error("Không thể tải sơ đồ ghế. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        if (scheduleId) {
            fetchSeats();
        }
    }, [scheduleId]);

    const handleSelectSeat = (seat: Seat) => {
        const isSelected = selectedSeats.some(s => s.id === seat.id);

        if (isSelected) {
            setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
        } else {
            if (selectedSeats.length >= maxSeats) {
                toast.warning(`Bạn chỉ được chọn tối đa ${maxSeats} ghế.`);
                return;
            }
            setSelectedSeats(prev => [...prev, seat]);
        }
    };

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-slate-500 font-medium">Đang tải sơ đồ ghế...</p>
            </div>
        );
    }

    if (!seatMap) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Không tìm thấy dữ liệu chuyến xe.</p>
            </div>
        );
    }

    // Determine Layout based on total seats or logic
    const renderLayout = () => {
        if (!seatMap) return null;

        const { totalSeats, seatType } = seatMap;

        // Logic refined to match Flutter's heuristics
        // 34 seats -> Layout 34
        if (totalSeats === 34) {
            return (
                <SeatLayout34
                    seats={seatMap.seats}
                    selectedSeats={selectedSeats}
                    onSelectSeat={handleSelectSeat}
                />
            );
        }

        // 28 seats -> Layout 28
        if (totalSeats === 28) {
            return (
                <SeatLayout28
                    seats={seatMap.seats}
                    selectedSeats={selectedSeats}
                    onSelectSeat={handleSelectSeat}
                />
            );
        }

        // 45 seats -> Layout 45
        if (totalSeats === 45) {
            return (
                <SeatLayout45
                    seats={seatMap.seats}
                    selectedSeats={selectedSeats}
                    onSelectSeat={handleSelectSeat}
                />
            );
        }

        // Default to Layout 41 (most common sleeper) if > 35 or generic sleeper
        if (totalSeats >= 35 && totalSeats <= 44 && (seatType === 'SLEEPER' || seatType === 'LIMOUSINE')) {
            return (
                <SeatLayout41
                    seats={seatMap.seats}
                    selectedSeats={selectedSeats}
                    onSelectSeat={handleSelectSeat}
                />
            );
        }

        // Fallback to Layout 41 for now if undefined, or we can add a simple grid
        return (
            <SeatLayout41
                seats={seatMap.seats}
                selectedSeats={selectedSeats}
                onSelectSeat={handleSelectSeat}
            />
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-4 text-white shadow-lg sticky top-0 z-20">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-lg font-bold">Chọn ghế: {seatMap.busName}</h1>
                    <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <span className="material-symbols-outlined">info</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mb-8 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-green-50 border border-green-500 flex items-center justify-center">
                                <span className="material-symbols-outlined text-green-600 text-xs">bed</span>
                            </div>
                            <span className="text-sm font-medium">Còn trống</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-orange-300 border border-orange-400 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-xs">bed</span>
                            </div>
                            <span className="text-sm font-medium">Đang chọn</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-red-50 border border-red-400 flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-500 text-xs">bed</span>
                            </div>
                            <span className="text-sm font-medium">Đã bán</span>
                        </div>
                    </div>

                    {renderLayout()}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] sticky bottom-0 z-20">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-slate-500">Đã chọn: <span className="font-bold text-slate-900 dark:text-white">{selectedSeats.length}</span> ghế</p>
                            <p className="text-xs text-green-600 font-medium">
                                {selectedSeats.map(s => s.seatNumber).join(', ')}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Tổng tiền</p>
                            <p className="text-xl font-bold text-primary">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                            </p>
                        </div>
                    </div>

                    <button
                        disabled={selectedSeats.length === 0}
                        className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-95"
                    >
                        Tiếp tục
                    </button>
                </div>
            </div>
        </div>
    );
}
