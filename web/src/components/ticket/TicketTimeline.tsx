import React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ReceiptText, Banknote, Bus, UserCheck, Star, XCircle } from "lucide-react";

interface TicketTimelineProps {
    ticket: any;
}

export function TicketTimeline({ ticket }: TicketTimelineProps) {
    const isCancelled = ticket.status === "CANCELLED";
    const hasPaid = ticket.status === "PAID" || ticket.status === "COMPLETED";
    const scheduleStatus = ticket.schedule?.status || "UPCOMING";
    const hasStarted = hasPaid && (scheduleStatus === "ONGOING" || scheduleStatus === "COMPLETED");
    const hasCompleted = hasPaid && scheduleStatus === "COMPLETED";
    const hasReviewed = !!ticket.review;

    // Define steps
    const steps = [
        {
            key: "booked",
            title: "Đã Đặt Vé",
            icon: ReceiptText,
            active: true, // Always active if it exists
            date: ticket.createdAt,
        },
        {
            key: "paid",
            title: isCancelled ? "Đã Hủy" : "Đã Xác Nhận Thanh Toán",
            icon: isCancelled ? XCircle : Banknote,
            active: hasPaid || isCancelled,
            isError: isCancelled,
            date: ticket.updatedAt, // Approximation for payment/cancel time
        },
        {
            key: "ongoing",
            title: "Đang Di Chuyển",
            icon: Bus,
            active: hasStarted && !isCancelled,
            date: hasStarted ? ticket.schedule?.departureAt : null,
        },
        {
            key: "completed",
            title: "Hoàn Thành Chuyến",
            icon: UserCheck,
            active: hasCompleted && !isCancelled,
            date: hasCompleted ? ticket.schedule?.arrivalAt : null,
        },
        {
            key: "reviewed",
            title: "Đánh Giá",
            icon: Star,
            active: hasReviewed && !isCancelled,
            date: ticket.review?.createdAt,
        },
    ];

    return (
        <div className="w-full mt-4 mb-2">
            <div className="relative flex justify-between items-start w-full">
                {/* Connecting Lines */}
                <div className="absolute top-5 md:top-6 left-[10%] right-[10%] h-[2px] md:h-[3px] bg-slate-200 dark:bg-slate-700 z-0"></div>
                <div
                    className={cn(
                        "absolute top-5 md:top-6 left-[10%] h-[2px] md:h-[3px] z-0 transition-all duration-500",
                        isCancelled ? "bg-red-500" : "bg-blue-500"
                    )}
                    style={{
                        width: isCancelled
                            ? "20%" // Stop at step 2
                            : hasReviewed
                                ? "80%"
                                : hasCompleted
                                    ? "60%"
                                    : hasStarted
                                        ? "40%"
                                        : hasPaid
                                            ? "20%"
                                            : "0%",
                    }}
                ></div>

                {/* Steps */}
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.active;
                    const isError = step.isError;

                    return (
                        <div key={step.key} className="flex flex-col items-center w-1/5 relative z-10">
                            {/* Icon Circle */}
                            <div
                                className={cn(
                                    "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 md:border-[3px] bg-white dark:bg-slate-900 transition-colors duration-300",
                                    isActive
                                        ? isError
                                            ? "border-red-500 text-red-500"
                                            : "border-blue-500 bg-blue-500 text-white"
                                        : "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600"
                                )}
                            >
                                <Icon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>

                            {/* Label */}
                            <p
                                className={cn(
                                    "mt-2 text-[11px] md:text-xs font-semibold text-center leading-tight px-1",
                                    isActive
                                        ? isError
                                            ? "text-red-600"
                                            : "text-slate-800 dark:text-white"
                                        : "text-slate-400 dark:text-slate-500"
                                )}
                            >
                                {step.title}
                            </p>

                            {/* Time */}
                            {isActive && step.date && (
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 whitespace-nowrap">
                                    {format(new Date(step.date), "HH:mm dd-MM-yyyy")}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
