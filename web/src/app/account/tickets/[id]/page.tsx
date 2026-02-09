"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
    Loader2,
    Calendar,
    MapPin,
    QrCode,
    Clock,
    User,
    Bus,
    CreditCard,
    ArrowLeft,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Copy
} from "lucide-react";
import { toast } from "sonner";

import { bookingApi } from "@/lib/api/booking";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

interface TicketDetailProps {
    params: Promise<{
        id: string;
    }>
}

export default function TicketDetailPage({ params }: TicketDetailProps) {
    const router = useRouter();
    const { id } = use(params);
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"info" | "payment">("info");

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const data = await bookingApi.getTicketById(Number(id));
                if (!data) throw new Error("Ticket not found");
                setTicket(data);
            } catch (error) {
                console.error("Error fetching ticket:", error);
                toast.error("Không tìm thấy thông tin vé");
                router.push("/account/tickets");
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [id, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!ticket) return null;

    const isPaid = ticket.status === "PAID" || ticket.status === "Đã thanh toán" || ticket.status === "SUCCESS";
    const payment = ticket.paymentHistory;
    const schedule = ticket.schedule;
    const route = schedule?.route;

    // Dropoff Logic
    let dropoffTitle = 'Bến xe đích';
    let dropoffAddressLine = '';
    let surchargeText = 'Miễn phí';
    let hasSurcharge = false;

    if (ticket.dropoffAddress) {
        dropoffTitle = 'Trả tận nơi';
        dropoffAddressLine = ticket.dropoffAddress;
        if (ticket.surcharge > 0) {
            surchargeText = `${ticket.surcharge.toLocaleString('vi-VN')}đ`;
            hasSurcharge = true;
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-[#6AB7F5] to-[#4A9EFF] pt-6 pb-24 px-4 shadow-lg relative">
                <div className="max-w-5xl mx-auto flex items-center justify-between text-white relative z-10">
                    <Link href="/account/tickets" className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-bold">Vé #{ticket.id}</h1>
                    <div className="w-10" />
                </div>

                {/* Tabs - Centered but consistent */}
                <div className="max-w-5xl mx-auto mt-6 flex justify-center gap-8 relative z-10">
                    <button
                        onClick={() => setActiveTab("info")}
                        className={cn(
                            "pb-2 font-bold text-sm transition-all border-b-4",
                            activeTab === "info"
                                ? "border-white text-white opacity-100"
                                : "border-transparent text-white/70 hover:text-white"
                        )}
                    >
                        Thông tin vé
                    </button>
                    <button
                        onClick={() => setActiveTab("payment")}
                        className={cn(
                            "pb-2 font-bold text-sm transition-all border-b-4",
                            activeTab === "payment"
                                ? "border-white text-white opacity-100"
                                : "border-transparent text-white/70 hover:text-white"
                        )}
                    >
                        Thanh toán
                    </button>
                </div>

                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            </div>

            {/* Content Container - Overlapping Header - Expanded Width */}
            <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* MAIN CONTENT COLUMN (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === "info" ? (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                {/* Route */}
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3 mb-1">
                                        <Bus className="w-5 h-5 text-blue-600" />
                                        <span className="text-slate-500 font-medium text-sm">Tuyến xe</span>
                                    </div>
                                    <div className="pl-8">
                                        <div className="font-bold text-xl text-slate-900 dark:text-slate-100">
                                            {route?.startPoint} <span className="text-slate-400 mx-1">→</span> {route?.endPoint}
                                        </div>
                                    </div>
                                </div>

                                {/* Departure */}
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3 mb-1">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                        <span className="text-slate-500 font-medium text-sm">Giờ khởi hành</span>
                                    </div>
                                    <div className="pl-8">
                                        <div className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                            {schedule?.departureAt ? format(parseISO(schedule.departureAt), "HH:mm • dd/MM/yyyy") : "—"}
                                        </div>
                                    </div>
                                </div>

                                {/* Seat */}
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3 mb-1">
                                        <User className="w-5 h-5 text-blue-600" />
                                        <span className="text-slate-500 font-medium text-sm">Số ghế</span>
                                    </div>
                                    <div className="pl-8">
                                        <div className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                            {ticket.seat?.seatNumber || "—"}
                                        </div>
                                    </div>
                                </div>

                                {/* Dropoff Point - Highlighted */}
                                <div className="bg-red-50 dark:bg-red-900/10 p-6 border-b border-red-100 dark:border-red-900/20">
                                    <div className="flex items-start gap-4">
                                        <MapPin className="w-6 h-6 text-red-500 mt-1" />
                                        <div className="flex-1">
                                            <div className="font-bold text-green-800 dark:text-green-400 text-base mb-1">
                                                {dropoffTitle}
                                            </div>
                                            {dropoffAddressLine && (
                                                <div className="text-slate-800 dark:text-slate-200 font-medium text-sm mb-1">
                                                    {dropoffAddressLine}
                                                </div>
                                            )}
                                            {hasSurcharge && (
                                                <div className="text-red-600 font-bold text-sm">
                                                    Phụ thu: {surchargeText}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Price & Status */}
                                <div className="p-6 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Tổng tiền</div>
                                        <div className="text-xl font-bold text-blue-600">
                                            {ticket.totalPrice?.toLocaleString('vi-VN')}đ
                                        </div>
                                    </div>
                                    <StatusBadge status={ticket.status} />
                                </div>
                            </div>
                        ) : (
                            // PAYMENT TAB CONTENT
                            <div className="space-y-6">
                                {!payment ? (
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-500 shadow-sm border border-slate-200">
                                        Chưa có thông tin thanh toán
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                            <h3 className="text-lg font-bold mb-4">Chi tiết thanh toán</h3>
                                            <InfoRow label="Mã thanh toán" value={`#${payment.id}`} icon={CreditCard} />
                                            <InfoRow label="Phương thức" value={payment.method} icon={CreditCard} />
                                            <InfoRow
                                                label="Số tiền"
                                                value={`${payment.amount?.toLocaleString('vi-VN')}đ`}
                                                icon={CheckCircle2}
                                                valueClassName="text-blue-600 font-bold"
                                            />
                                            <InfoRow
                                                label="Thời gian"
                                                value={payment.paidAt ? format(parseISO(payment.paidAt), "HH:mm dd/MM/yyyy") : "—"}
                                                icon={Clock}
                                                valueClassName="text-green-600"
                                            />
                                            {payment.transactionId && (
                                                <InfoRow label="Mã giao dịch" value={payment.transactionId} icon={Copy} isCopyable />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SIDEBAR COLUMN (1/3) - QR Code & Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* QR Code Section - Always Visible if Paid, or show placeholder? */}
                        {isPaid && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden p-6 text-center border border-slate-100 dark:border-slate-800">
                                <h3 className="text-slate-500 text-sm font-medium mb-4 uppercase tracking-wider">Mã QR lên xe</h3>
                                <div className="bg-white p-4 inline-block rounded-xl border border-slate-100 shadow-sm mx-auto">
                                    <QRCodeSVG
                                        value={payment?.qrCode || `TICKET_${ticket.id}`}
                                        size={180}
                                        level="H"
                                        includeMargin
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-4">Vui lòng đưa mã này cho nhân viên soát vé</p>
                            </div>
                        )}
                        {!isPaid && (
                            <div className="bg-orange-50 dark:bg-orange-900/10 rounded-3xl p-6 text-center border border-orange-100 dark:border-orange-900/20">
                                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                                <h3 className="text-orange-700 font-bold mb-1">Chưa thanh toán</h3>
                                <p className="text-xs text-orange-600">Vui lòng thanh toán để nhận mã QR</p>
                            </div>
                        )}

                        {/* Actions */}
                        {ticket.status !== 'CANCELLED' && ticket.status !== 'COMPLETED' && (
                            <button
                                onClick={() => toast.info("Vui lòng liên hệ tổng đài để hủy vé")}
                                className="w-full py-4 rounded-2xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 bg-white"
                            >
                                <XCircle className="w-5 h-5" />
                                Hủy đặt vé
                            </button>
                        )}

                        {/* Help / Contact */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-6 border border-blue-100 dark:border-blue-900/20 text-center">
                            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Cần hỗ trợ?</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Liên hệ tổng đài: <span className="font-bold">1900 xxxx</span></p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value, icon: Icon, valueClassName, isCopyable }: any) {
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3 text-slate-500">
                {Icon && <Icon className="w-5 h-5 text-blue-600" />}
                <span className="font-medium text-sm">{label}</span>
            </div>
            <div className={cn("font-medium text-slate-900 dark:text-white flex items-center gap-2", valueClassName)}>
                {value}
                {isCopyable && (
                    <button onClick={() => {
                        navigator.clipboard.writeText(value);
                        toast.success("Đã sao chép");
                    }}>
                        <Copy className="w-4 h-4 text-slate-400 hover:text-blue-500" />
                    </button>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    let color = "bg-slate-100 text-slate-600";
    let icon = AlertTriangle;
    let label = status;

    if (status === "PAID" || status === "Đã thanh toán" || status === "SUCCESS") {
        color = "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
        icon = CheckCircle2;
        label = "Đã thanh toán";
    } else if (status === "BOOKED" || status === "PENDING") {
        color = "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
        icon = Clock;
        label = "Chờ thanh toán";
    } else if (status === "CANCELLED") {
        color = "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
        icon = XCircle;
        label = "Đã hủy";
    }

    const Icon = icon;

    return (
        <div className={cn("px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold uppercase", color)}>
            <Icon className="w-4 h-4" />
            {label}
        </div>
    );
}
