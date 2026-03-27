"use client";

import { Seat } from "@/types/seat";
import { SeatItem } from "./SeatItem";

interface SeatLayout34Props {
    seats: Seat[];
    selectedSeats: Seat[];
    invalidSeatId?: number | null;
    onSelectSeat: (seat: Seat) => void;
    othersSelecting: Record<number, { userId: string }>;
    currentUserId: string;
}

export function SeatLayout34({ seats, selectedSeats, invalidSeatId, onSelectSeat, othersSelecting, currentUserId }: SeatLayout34Props) {
    // 1. Separate Floors (Preserve API order which is sorted by Floor -> SeatNumber)
    const lowerSeats = seats.filter(s => s.floor === 1 || s.floor === null);
    const upperSeats = seats.filter(s => s.floor === 2);

    // If no floor info (rare for 34-sleeper), assume first half is lower
    if (upperSeats.length === 0 && lowerSeats.length > 20) {
        // Fallback logic if needed, but backend usually sends floor
        // For now rely on backend floor data
    }

    const renderFloor = (floorName: string, floorSeats: Seat[], colorClass: string) => {
        const config = [6, 5, 6, 5, 6, 6];
        let seatIndex = 0;
        const columns: Seat[][] = [];

        config.forEach(count => {
            columns.push(floorSeats.slice(seatIndex, seatIndex + count));
            seatIndex += count;
        });

        return (
            <div className="flex flex-col items-center relative w-fit">
                {/* Header Section (Driver or Spacer) */}
                {floorName === "Tầng dưới" ? (
                    <div className="flex items-center gap-2 mb-8 self-start">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-slate-500">album</span>
                        </div>
                        <span className="font-bold text-slate-600 dark:text-slate-300 text-sm">Tài xế</span>
                    </div>
                ) : (
                    <div className="h-[72px] mb-0"></div> // Spacer to match driver icon height + margin
                )}

                <div className={`flex items-center gap-2 mb-6 font-bold ${colorClass} text-lg`}>
                    <span className="material-symbols-outlined">bed</span>
                    {floorName}
                </div>

                <div className="flex gap-4">
                    {columns.map((colSeats, colIdx) => (
                        <div key={colIdx} className="flex flex-col gap-4">
                            {colSeats.map(seat => (
                                <SeatItem
                                    key={seat.id}
                                    seat={seat}
                                    isSelected={selectedSeats.some(s => s.id === seat.id)}
                                    isInvalid={invalidSeatId === seat.id}
                                    isOthersSelecting={!!othersSelecting[seat.id] && othersSelecting[seat.id].userId !== currentUserId}
                                    onSelect={onSelectSeat}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl mx-auto relative pt-12 mt-4">
            {/* Top Fixed Elements (Only Door stays absolute) */}
            <div className="absolute top-4 right-6 flex items-center gap-2">
                <span className="font-bold text-slate-600 dark:text-slate-300 text-sm">Cửa</span>
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-slate-500">door_open</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-around items-start gap-12 pt-4">
                {renderFloor("Tầng dưới", lowerSeats, "text-green-600")}
                {upperSeats.length > 0 && renderFloor("Tầng trên", upperSeats, "text-blue-600")}
            </div>
        </div>
    );
}
