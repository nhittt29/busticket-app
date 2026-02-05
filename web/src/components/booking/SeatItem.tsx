"use client";

import { Seat } from "@/types/seat";
import { cn } from "@/lib/utils";

interface SeatItemProps {
    seat: Seat;
    isSelected: boolean;
    onSelect: (seat: Seat) => void;
    type?: "SEAT" | "BED"; // Derived from bus type usually, but we can default to BED for now if mostly sleepers
}

export function SeatItem({ seat, isSelected, onSelect, type = "BED" }: SeatItemProps) {
    // Logic matching Flutter: isAvailable check
    const isAvailable = seat.isAvailable;
    const isSold = !isAvailable; // For now assuming if not available, it's sold/booked

    // Colors matching Flutter design intent (approximate Tailwind classes)

    // Base styles
    const baseStyles = "relative flex flex-col items-center justify-center border transition-all duration-200 cursor-pointer rounded-lg";

    // Size (Flutter 28x28 logic, scaled) -> Let's use w-10 h-10 or similar for Web
    const sizeStyles = "w-10 h-10 md:w-12 md:h-12";

    // State Styles
    let stateStyles = "";
    let iconColor = "";
    let textColor = "";

    if (isSelected) {
        // Orange Selected (Flutter: 0xFFFFB74D)
        stateStyles = "bg-orange-300 border-orange-400 shadow-md shadow-orange-300/50 scale-105 z-10";
        iconColor = "text-white";
        textColor = "text-white";
    } else if (isAvailable) {
        // Green Available (Flutter: 0xFF4CAF50) - using lighter bg opacity
        stateStyles = "bg-green-50 border-green-500 hover:bg-green-100 hover:shadow-sm";
        iconColor = "text-green-600";
        textColor = "text-green-600";
    } else {
        // Red Sold (Flutter: 0xFFEF5350)
        stateStyles = "bg-red-50 border-red-400 cursor-not-allowed opacity-80";
        iconColor = "text-red-500";
        textColor = "text-red-500";
    }

    const handleClick = () => {
        if (isAvailable) {
            onSelect(seat);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(baseStyles, sizeStyles, stateStyles)}
            title={`Ghế ${seat.seatNumber} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(seat.price)}`}
        >
            <div className="flex flex-col items-center justify-center leading-none">
                <span className={cn("material-symbols-outlined text-lg mb-[1px]", iconColor)}>
                    {type === "SEAT" ? "chair" : "bed"}
                </span>
                <span className={cn("text-[10px] font-bold", textColor)}>
                    {seat.seatNumber}
                </span>
            </div>
            {/* Floor indicator if needed, though usually context implies floor */}
        </div>
    );
}
