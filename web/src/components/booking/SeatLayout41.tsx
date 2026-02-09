"use client";

import { Seat } from "@/types/seat";
import { SeatItem } from "./SeatItem";

interface SeatLayout41Props {
    seats: Seat[];
    selectedSeats: Seat[];
    invalidSeatId?: number | null;
    onSelectSeat: (seat: Seat) => void;
}

export function SeatLayout41({ seats, selectedSeats, invalidSeatId, onSelectSeat }: SeatLayout41Props) {
    // 1. Separate Floors
    const lowerSeats = seats.filter(s => s.floor === 1).sort((a, b) => a.id - b.id);
    const upperSeats = seats.filter(s => s.floor === 2).sort((a, b) => a.id - b.id);

    // 2. Logic specific to Flutter SeatLayout41Form:
    // It moves the last 3 seats of the lower deck (usually row 6) to the upper deck's last row visually.
    // "movedSeats = lowerSeats.skip(6 * 3).take(3).toList()"

    const lowerDeckMain = lowerSeats.slice(0, 18); // First 6 rows (6 * 3 = 18)
    const lowerDeckMoved = lowerSeats.slice(18, 21); // Next 3 seats

    const upperDeckMain = upperSeats.slice(0, 18); // First 6 rows
    const upperDeckLast = upperSeats.slice(18, 20); // Last 2 seats usually

    // Combine for the "5-seat" back row effect on Upper Deck
    // Flutter: lastRowUpperSeats.addAll(movedSeats); -> [UpperLast... + LowerMoved...]
    const complexBackRow = [...upperDeckLast, ...lowerDeckMoved].sort((a, b) => a.id - b.id);

    const renderGrid = (seats: Seat[]) => {
        // Render in groups of 3
        const groups = [];
        for (let i = 0; i < seats.length; i += 3) {
            groups.push(seats.slice(i, i + 3));
        }
        return (
            <div className="flex flex-col gap-4">
                {groups.map((group, idx) => (
                    <div key={idx} className="flex gap-8 justify-between">
                        {/* Column 1 */}
                        <div className="flex-1 flex justify-center">{group[0] && <SeatItem seat={group[0]} isSelected={selectedSeats.some(s => s.id === group[0].id)} isInvalid={invalidSeatId === group[0].id} onSelect={onSelectSeat} />}</div>
                        {/* Column 2 */}
                        <div className="flex-1 flex justify-center">{group[1] && <SeatItem seat={group[1]} isSelected={selectedSeats.some(s => s.id === group[1].id)} isInvalid={invalidSeatId === group[1].id} onSelect={onSelectSeat} />}</div>
                        {/* Column 3 */}
                        <div className="flex-1 flex justify-center">{group[2] && <SeatItem seat={group[2]} isSelected={selectedSeats.some(s => s.id === group[2].id)} isInvalid={invalidSeatId === group[2].id} onSelect={onSelectSeat} />}</div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-8 border-b pb-4 border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-500">sports_scoring</span>
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-300">Tài xế</span>
            </div>

            <div className="flex flex-col md:flex-row justify-around gap-12 bg-white">
                {/* Lower Floor - Adjusted */}
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4 font-bold text-green-600">
                        <span className="material-symbols-outlined">bed</span>
                        Tầng dưới
                    </div>
                    {renderGrid(lowerDeckMain)}
                    {/* Lower deck usually loses its back row in this visual logic */}
                    <div className="h-12"></div>
                </div>

                {/* Upper Floor - Enhanced with Back Row */}
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4 font-bold text-blue-600">
                        <span className="material-symbols-outlined">bed</span>
                        Tầng trên
                    </div>
                    {renderGrid(upperDeckMain)}

                    {/* The Complex Back Row (5 seats) */}
                    <div className="mt-4 flex gap-2 justify-center">
                        {complexBackRow.map(seat => (
                            <SeatItem
                                key={seat.id}
                                seat={seat}
                                isSelected={selectedSeats.some(s => s.id === seat.id)}
                                isInvalid={invalidSeatId === seat.id}
                                onSelect={onSelectSeat}
                            />
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
