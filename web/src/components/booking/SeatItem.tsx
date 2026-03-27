"use client";

import { Seat } from "@/types/seat";
import { cn } from "@/lib/utils";

interface SeatItemProps {
    seat: Seat;
    isSelected: boolean;
    isInvalid?: boolean;
    onSelect: (seat: Seat) => void;
    isOthersSelecting?: boolean;
    type?: "SEAT" | "BED";
}

export function SeatItem({ seat, isSelected, isInvalid, isOthersSelecting, onSelect, type = "BED" }: SeatItemProps) {
    // Logic matching Flutter: isAvailable check
    const isAvailable = seat.isAvailable;
    const isSold = !isAvailable;

    // ... Base Styles ...
    // Add animate-shaking effect if invalid (need custom keyframes or simple transition)
    const baseStyles = "relative flex flex-col items-center justify-center border transition-all duration-200 cursor-pointer rounded-lg";

    // Size check
    const sizeStyles = "w-10 h-10 md:w-12 md:h-12";

    // State Styles
    let stateStyles = "";
    let iconColor = "";
    let textColor = "";

    if (isInvalid) {
        // Red Invalid State (Error shake matching Flutter's intent of "Warning")
        stateStyles = "bg-red-50 border-red-500 ring-2 ring-red-200 z-20 animate-pulse";
        iconColor = "text-red-500";
        textColor = "text-red-600 font-extrabold";
    } else if (isOthersSelecting) {
        // NEW: Being selected by someone else - Polling Based
        stateStyles = "bg-[#FFB74D] border-[#FFB74D] opacity-70 animate-pulse cursor-wait";
        iconColor = "text-white";
        textColor = "text-white";
    } else if (isSelected) {
        // MATCH FLUTTER: Orange #FFB74D (approx tailwind orange-300/400)
        stateStyles = "bg-[#FFB74D] border-[#FFB74D] shadow-lg shadow-orange-500/30 scale-105 z-10";
        iconColor = "text-white";
        textColor = "text-white";
    } else if (isAvailable) {
        // MATCH FLUTTER: Green #4CAF50 (approx tailwind green-500)
        // Background is opacity 0.15 of base color
        stateStyles = "bg-green-50 border-[#4CAF50] hover:bg-green-100 hover:shadow-md transition-all";
        iconColor = "text-[#4CAF50]";
        textColor = "text-[#4CAF50]";
    } else {
        // MATCH FLUTTER: Red Sold #EF5350
        stateStyles = "bg-red-50 border-[#EF5350] cursor-not-allowed opacity-60";
        iconColor = "text-[#EF5350]";
        textColor = "text-[#EF5350]";
    }

    const handleClick = () => {
        if (isAvailable && !isOthersSelecting) {
            onSelect(seat);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(baseStyles, sizeStyles, stateStyles)}
            title={`Ghế ${seat.seatNumber} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(seat.price)}`}
        >
            {/* MATCH FLUTTER: Invalid Overlay with Dark Background & Red X */}
            {isInvalid && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg z-30 animate-in fade-in zoom-in duration-200">
                    <span className="material-symbols-outlined text-red-500 text-3xl font-bold drop-shadow-md">close</span>
                </div>
            )}

            <div className="flex flex-col items-center justify-center leading-none">
                <span className={cn("material-symbols-outlined text-lg mb-[1px]", iconColor)}>
                    {type === "SEAT" ? "chair" : "bed"}
                </span>
                <span className={cn("text-[10px] font-bold", textColor)}>
                    {seat.seatNumber}
                </span>
            </div>
            {/* Floor indicator if needed */}
        </div>
    );
}

