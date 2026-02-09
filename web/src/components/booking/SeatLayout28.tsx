"use client";

import { Seat } from "@/types/seat";
import { SeatItem } from "./SeatItem";

interface SeatLayout28Props {
    seats: Seat[];
    selectedSeats: Seat[];
    invalidSeatId?: number | null;
    onSelectSeat: (seat: Seat) => void;
}

export function SeatLayout28({ seats, selectedSeats, invalidSeatId, onSelectSeat }: SeatLayout28Props) {
    // 1. Sort by ID as per Flutter logic
    const sortedSeats = [...seats].sort((a, b) => a.id - b.id);

    // 2. Logic: 6 rows of 4 seats + 1 row of 5 seats
    const mainRows = 6;
    const seatsPerRow = 4;
    const lastRowSeats = sortedSeats.slice(mainRows * seatsPerRow, (mainRows * seatsPerRow) + 5);

    const renderRow = (rowIndex: number) => {
        const startIndex = rowIndex * seatsPerRow;
        // Get 2 left seats
        const leftSeats = sortedSeats.slice(startIndex, startIndex + 2);
        // Get 2 right seats
        const rightSeats = sortedSeats.slice(startIndex + 2, startIndex + 4);

        return (
            <div key={rowIndex} className="flex items-center justify-center gap-16 mb-6">
                {/* Left Block */}
                <div className="flex gap-4">
                    {leftSeats.map(seat => (
                        <SeatItem
                            key={seat.id}
                            seat={seat}
                            isSelected={selectedSeats.some(s => s.id === seat.id)}
                            isInvalid={invalidSeatId === seat.id}
                            onSelect={onSelectSeat}
                            type="SEAT"
                        />
                    ))}
                </div>

                {/* Right Block */}
                <div className="flex gap-4">
                    {rightSeats.map(seat => (
                        <SeatItem
                            key={seat.id}
                            seat={seat}
                            isSelected={selectedSeats.some(s => s.id === seat.id)}
                            isInvalid={invalidSeatId === seat.id}
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
                {/* Main 6 Rows */}
                {Array.from({ length: mainRows }).map((_, i) => renderRow(i))}

                {/* Last 5-seat Row */}
                <div className="flex items-center justify-center gap-4 mt-2">
                    {lastRowSeats.map(seat => (
                        <SeatItem
                            key={seat.id}
                            seat={seat}
                            isSelected={selectedSeats.some(s => s.id === seat.id)}
                            isInvalid={invalidSeatId === seat.id}
                            onSelect={onSelectSeat}
                            type="SEAT"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
