"use client";

import { Seat } from "@/types/seat";
import { SeatItem } from "./SeatItem";

interface SeatLayout45Props {
    seats: Seat[];
    selectedSeats: Seat[];
    onSelectSeat: (seat: Seat) => void;
}

export function SeatLayout45({ seats, selectedSeats, onSelectSeat }: SeatLayout45Props) {
    // 1. Sort by ID as per Flutter logic
    const sortedSeats = [...seats].sort((a, b) => a.id - b.id);

    // 2. Partition seats for layout
    const mainSeats = sortedSeats.slice(0, 40); // 10 rows of 4 (40 seats)
    const last5Seats = sortedSeats.slice(40, 45); // 1 row of 5

    // Helper to render standard 2-2 rows
    const render22Row = (rowSeats: Seat[]) => {
        // Assume rowSeats has 4 items
        const left = rowSeats.slice(0, 2);
        const right = rowSeats.slice(2, 4);
        return (
            <div className="flex items-center justify-center gap-16 mb-4">
                <div className="flex gap-4">
                    {left.map(seat => (
                        <SeatItem
                            key={seat.id}
                            seat={seat}
                            isSelected={selectedSeats.some(s => s.id === seat.id)}
                            onSelect={onSelectSeat}
                            type="SEAT"
                        />
                    ))}
                </div>
                <div className="flex gap-4">
                    {right.map(seat => (
                        <SeatItem
                            key={seat.id}
                            seat={seat}
                            isSelected={selectedSeats.some(s => s.id === seat.id)}
                            onSelect={onSelectSeat}
                            type="SEAT"
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-8 border-b pb-4 border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-500">sports_scoring</span>
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-300">Tài xế</span>
            </div>

            <div className="flex flex-col items-center">
                {/* Main 40 Seats (10 Rows of 2-2) */}
                <div className="mb-4">
                    {Array.from({ length: 10 }).map((_, i) => {
                        const rowSeats = mainSeats.slice(i * 4, (i * 4) + 4);
                        return <div key={`row-${i}`}>{render22Row(rowSeats)}</div>;
                    })}
                </div>

                {/* Last 5 Seats */}
                <div className="flex items-center justify-center gap-4 mt-2">
                    {last5Seats.map(seat => (
                        <SeatItem
                            key={seat.id}
                            seat={seat}
                            isSelected={selectedSeats.some(s => s.id === seat.id)}
                            onSelect={onSelectSeat}
                            type="SEAT"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
