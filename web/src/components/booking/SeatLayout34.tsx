"use client";

import { Seat } from "@/types/seat";
import { SeatItem } from "./SeatItem";

interface SeatLayout34Props {
    seats: Seat[];
    selectedSeats: Seat[];
    onSelectSeat: (seat: Seat) => void;
}

export function SeatLayout34({ seats, selectedSeats, onSelectSeat }: SeatLayout34Props) {
    // 1. Separate Floors (Preserve API order which is sorted by Floor -> SeatNumber)
    const lowerSeats = seats.filter(s => s.floor === 1 || s.floor === null);
    const upperSeats = seats.filter(s => s.floor === 2);

    // If no floor info (rare for 34-sleeper), assume first half is lower
    if (upperSeats.length === 0 && lowerSeats.length > 20) {
        // Fallback logic if needed, but backend usually sends floor
        // For now rely on backend floor data
    }

    const renderFloor = (floorName: string, floorSeats: Seat[], colorClass: string) => {
        // Config from Flutter: [6, 5, 6, 5, 6, 6]
        // This supports standard 34 seats (first 3 cols) and potential extensions
        const config = [6, 5, 6, 5, 6, 6];
        let seatIndex = 0;
        const columns: Seat[][] = [];

        config.forEach(count => {
            // Safe slice: if index out of bounds, returns empty array, which is handled gracefully
            columns.push(floorSeats.slice(seatIndex, seatIndex + count));
            seatIndex += count;
        });

        return (
            <div className="flex flex-col items-center">
                <div className={`flex items-center gap-2 mb-4 font-bold ${colorClass}`}>
                    <span className="material-symbols-outlined">bed</span>
                    {floorName}
                </div>

                <div className="flex gap-4">
                    {/* Render split columns */}
                    {columns.map((colSeats, colIdx) => (
                        <div key={colIdx} className="flex flex-col gap-4">
                            {colSeats.map(seat => (
                                <SeatItem
                                    key={seat.id}
                                    seat={seat}
                                    isSelected={selectedSeats.some(s => s.id === seat.id)}
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-8 border-b pb-4 border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-500">sports_scoring</span>
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-300">Tài xế</span>
            </div>

            <div className="flex flex-col md:flex-row justify-around gap-12">
                {renderFloor("Tầng dưới", lowerSeats, "text-green-600")}
                {/* Only render upper floor if it has seats */}
                {upperSeats.length > 0 && renderFloor("Tầng trên", upperSeats, "text-blue-600")}
            </div>
        </div>
    );
}
