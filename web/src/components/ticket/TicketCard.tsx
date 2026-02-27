import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface TicketCardProps {
    ticket: any; // Using any for now to match backend response structure flexibility
    groupTickets?: any[]; // For grouped tickets (multi-seat)
    onPay?: (ticket: any) => void;
    onView?: (ticket: any) => void;
    onReview?: (ticket: any) => void;
    isProcessing?: boolean;
}

export function TicketCard({ ticket, groupTickets, onPay, onView, onReview, isProcessing }: TicketCardProps) {
    // Data Extraction
    const schedule = ticket.schedule || {};
    const route = schedule.route || {};
    const bus = schedule.bus || {};

    // Status Logic
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'text-green-600 bg-green-50 border-green-200';
            case 'BOOKED': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'CANCELLED': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PAID': return 'Đã thanh toán';
            case 'BOOKED': return 'Chờ thanh toán';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    const statusStyle = getStatusColor(ticket.status);
    const statusText = getStatusText(ticket.status);

    // Date & Time
    const departureDate = schedule.departureAt ? new Date(schedule.departureAt) : null;
    const timeStr = departureDate ? format(departureDate, "HH:mm") : "--:--";
    const dateStr = departureDate ? format(departureDate, "dd/MM") : "--/--";
    const fullDateStr = departureDate ? format(departureDate, "dd 'thg' MM, yyyy", { locale: vi }) : "";

    // Seats
    let seatDisplay = ticket.seat?.seatNumber || "—";
    if (groupTickets && groupTickets.length > 1) {
        const seats = groupTickets
            .map(t => t.seat?.seatNumber)
            .filter(Boolean);

        if (seats.length > 3) {
            seatDisplay = `${seats.slice(0, 3).join(", ")}... (+${seats.length - 3})`;
        } else {
            seatDisplay = seats.join(", ");
        }
    }

    // Amount
    const totalAmount = groupTickets
        ? groupTickets.reduce((sum, t) => sum + t.price, 0)
        : ticket.price;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div className="relative group">
            {/* Ticket Scale Effect on Hover */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-300 overflow-hidden">

                {/* CSS Mask for Ticket Shape (Cutouts) */}
                {/* Visual representation using pseudo-elements or just simple design for now. 
                    True CSS mask for cutouts requires masking image or radial-gradient hack. 
                    Let's use a standard card but with a dashed divider. */}

                <div className="flex flex-col md:flex-row">
                    {/* LEFT: Main Info (70%) */}
                    <div className="flex-1 p-5 md:p-6 md:pr-12 relative">
                        {/* Cutout Decoration (Right Side of Left Panel) */}
                        <div className="absolute right-0 top-0 bottom-0 w-[1px] border-r-2 border-dashed border-slate-200 dark:border-slate-700 hidden md:block"></div>
                        <div className="absolute -right-3 top-0 bottom-0 flex flex-col justify-between py-2 hidden md:flex h-full">
                            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950 -mt-5 border border-slate-200 dark:border-slate-800 z-10"></div>
                            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950 -mb-5 border border-slate-200 dark:border-slate-800 z-10"></div>
                        </div>

                        {/* Header: Bus Name & ID */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">
                                    {bus.name || "Xe Khách"}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Mã vé: <span className="font-mono font-bold text-slate-600 dark:text-slate-400">#{ticket.id}</span>
                                </p>
                            </div>
                            <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", statusStyle)}>
                                {statusText}
                            </span>
                        </div>

                        {/* Journey Info */}
                        <div className="flex items-center gap-6 mb-4">
                            <div className="text-center min-w-[60px]">
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">{timeStr}</p>
                                <p className="text-xs text-slate-500 font-medium">{dateStr}</p>
                            </div>

                            {/* Journey Line */}
                            <div className="flex-1 flex flex-col gap-1">
                                <div className="flex justify-between text-xs text-slate-500 font-medium">
                                    <span>{route.startPoint}</span>
                                    <span>{route.endPoint}</span>
                                </div>
                                <div className="relative h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full w-full">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-red-500 opacity-20 rounded-full"></div>
                                </div>
                                <div className="text-center text-[10px] text-slate-400 mt-1">
                                    {fullDateStr}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Price & Actions (30%) */}
                    <div className="md:w-48 bg-slate-50 dark:bg-slate-800/30 p-5 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-dashed border-slate-200 dark:border-slate-700 relative">
                        {/* Seats */}
                        <div className="mb-4 text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Ghế</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{seatDisplay}</p>
                        </div>

                        {/* Price */}
                        <div className="mb-6 text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Tổng tiền</p>
                            <p className="text-xl font-bold text-blue-600">{formatCurrency(totalAmount || 0)}</p>
                        </div>

                        {/* Actions */}
                        <div className="w-full space-y-2">
                            {(ticket.status === 'BOOKED' || ticket.status === 'PENDING') && onPay && (
                                <button
                                    onClick={() => onPay(ticket)}
                                    disabled={isProcessing}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                                    Thanh toán
                                </button>
                            )}

                            {onView && (
                                <button
                                    onClick={() => onView(ticket)}
                                    className="w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg transition-all active:scale-95"
                                >
                                    Xem chi tiết
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {/* Review Action */}
                {onReview && !ticket.review && (
                    <button
                        onClick={() => onReview(ticket)}
                        className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">rate_review</span>
                        Đánh giá
                    </button>
                )}

                {ticket.review && (
                    <div className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-500 text-sm font-bold rounded-lg flex items-center justify-center gap-2 cursor-default">
                        <span className="material-symbols-outlined text-lg text-yellow-500 fill-current">star</span>
                        Đã đánh giá ({ticket.review.rating}*)
                    </div>
                )}
            </div>
        </div>

    );
}
