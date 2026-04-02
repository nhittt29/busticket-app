"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Ticket, Home, ArrowRight } from "lucide-react";
import { bookingApi } from "@/lib/api/booking";
import Link from "next/link";

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Support multiple param formats
    const paymentIdParam = searchParams.get('paymentId');
    const historyIdParam = searchParams.get('paymentHistoryId');
    const idParam = searchParams.get('id');

    // Priority: paymentId (from controller redirect) > paymentHistoryId > id
    const rawId = paymentIdParam || historyIdParam || idParam;
    
    // Sanitize ID: avoid strings "undefined", "null" or NaN
    const id = (rawId && rawId !== "undefined" && rawId !== "null" && !isNaN(Number(rawId))) 
        ? rawId 
        : null;

    const [loading, setLoading] = useState(true);
    const [ticketInfo, setTicketInfo] = useState<any>(null);

    useEffect(() => {
        const fetchInfo = async () => {
            if (!id) {
                console.error("Invalid or missing Payment ID in URL");
                setLoading(false);
                return;
            }

            try {
                const data = await bookingApi.getPaymentDetail(Number(id));
                setTicketInfo(data);
            } catch (error) {
                console.error("Error fetching payment success info:", error);
                toast.error("Không thể tải thông tin vé.");
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Đang xác thực giao dịch...</p>
        </div>
    );

    if (!ticketInfo) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">😕</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy thông tin vé</h1>
            <p className="text-slate-600 mb-8 max-w-md">
                Có lỗi xảy ra hoặc mã giao dịch không hợp lệ. Vui lòng kiểm tra lại trong phần Lịch sử vé.
            </p>
            <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                Về trang chủ
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex py-12 px-4 justify-center">
            <div className="w-full max-w-5xl">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">

                    {/* Left Panel: Success Message & Actions */}
                    <div className="md:w-1/2 bg-green-500 text-white relative flex flex-col justify-center items-center p-8 md:p-12 text-center h-full min-h-[500px]">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="relative z-10 flex flex-col items-center w-full">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 ring-8 ring-white/10 animate-bounce">
                                <CheckCircle2 className="w-12 h-12 text-white" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight tracking-tight">Thanh toán<br />Thành công!</h1>
                            <p className="text-green-100 font-medium text-lg mb-10 opacity-90">Cảm ơn bạn đã đồng hành cùng BUSTICKET</p>

                            <div className="w-full max-w-sm flex flex-col gap-4">
                                <Link
                                    href="/account/tickets"
                                    className="w-full py-4 bg-white text-green-600 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-slate-50 hover:scale-[1.02] shadow-lg"
                                >
                                    <Ticket className="w-5 h-5" />
                                    Xem vé của tôi
                                </Link>

                                <Link
                                    href="/"
                                    className="w-full py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-white/10"
                                >
                                    <Home className="w-5 h-5" />
                                    Về trang chủ
                                </Link>
                            </div>
                            <p className="text-green-100/70 text-sm mt-8">
                                Thông tin chi tiết vé đã được gửi về email của bạn.
                            </p>
                        </div>
                    </div>

                    {/* Right Panel: Boarding Pass */}
                    <div className="md:w-1/2 p-6 md:p-12 flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative">
                        {/* Cutout effects for boarding pass look */}
                        <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full z-20"></div>

                        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                            {/* Pass Header */}
                            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Boarding Pass</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">BUSTICKET</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 font-medium">Mã Vé</p>
                                    <span className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400">
                                        #{ticketInfo.tickets?.[0]?.id || ticketInfo.ticketPayments?.[0]?.ticket?.id || ticketInfo.id}
                                    </span>
                                </div>
                            </div>

                            {/* Pass Body */}
                            <div className="p-6 relative space-y-6">
                                {(() => {
                                    const firstTicket = ticketInfo.tickets?.[0] || ticketInfo.ticketPayments?.[0]?.ticket;
                                    const route = firstTicket?.schedule?.route;
                                    const startPoint = route?.startPoint || "N/A";
                                    const endPoint = route?.endPoint || "N/A";
                                    const departureTime = firstTicket?.schedule?.departureAt ? new Date(firstTicket.schedule.departureAt) : null;

                                    // Collect all seat numbers
                                    const seats = (ticketInfo.tickets || ticketInfo.ticketPayments?.map((tp: any) => tp.ticket) || [])
                                        .map((t: any) => t.seat?.seatNumber)
                                        .filter(Boolean)
                                        .join(', ');

                                    return (
                                        <>
                                            {/* Route Info */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{startPoint}</p>
                                                </div>
                                                <div className="px-4 text-slate-300 dark:text-slate-700">
                                                    <ArrowRight className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 text-right">
                                                    <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{endPoint}</p>
                                                </div>
                                            </div>

                                            {/* Time & Date Info */}
                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-medium">Ngày đi</p>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                                                        {departureTime ? departureTime.toLocaleDateString('vi-VN') : '---'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-medium">Giờ khởi hành</p>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                                                        {departureTime ? departureTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '---'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Seat Info & Price */}
                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-medium">Vị trí ghế</p>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-lg text-blue-600 dark:text-blue-400">
                                                        {seats || "---"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-medium">Bến xe</p>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-md truncate">
                                                        BX Miền Đông
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Barcode / Footer Area */}
                            <div className="p-6 pt-0 border-t-2 border-dashed border-slate-200 dark:border-slate-700 relative">
                                {/* Semi-circles for the dashed line effect */}
                                <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950"></div>
                                <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950"></div>

                                <div className="mt-6 flex flex-col items-center justify-center opacity-80">
                                    {/* Simulated Barcode */}
                                    <div className="w-full h-12 bg-black dark:bg-white" style={{ maskImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmYiIC8+PGcgdHJhbnNmb3JtPSJzY2FsZSg0LCAxKSI+PHBhdGggZD0iTTAgMGgwLjV2MTBIMHogTTEgMGgwLjV2MTBIMXogTTEuNSAwSDF2MTBIMj41eiBNMyAwSDF2MTBIM3ogTTQgMGgxLjV2MTBINHogTTUuNSAwSDAuNXYxMEg1LjV6IE02LjUgMGgwLjV2MTBINi41eiBNNy41IDBoMXYxMEg3LjV6IE05IDBoMC41djEwSDl6')", WebkitMaskImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmYiIC8+PGcgdHJhbnNmb3JtPSJzY2FsZSg0LCAxKSI+PHBhdGggZD0iTTAgMGgwLjV2MTBIMHogTTEgMGgwLjV2MTBIMXogTTEuNSAwSDF2MTBIMj41eiBNMyAwSDF2MTBIM3ogTTQgMGgxLjV2MTBINHogTTUuNSAwSDAuNXYxMEg1LjV6IE02LjUgMGgwLjV2MTBINi41eiBNNy41IDBoMXYxMEg3LjV6IE05IDBoMC41djEwSDl6')", maskSize: "20px 100%", WebkitMaskSize: "20px 100%", maskRepeat: "repeat-x", WebkitMaskRepeat: "repeat-x" }}></div>
                                    <p className="font-mono text-xs text-slate-400 tracking-[0.3em] mt-2">
                                        {ticketInfo.tickets?.[0]?.id || ticketInfo.ticketPayments?.[0]?.ticket?.id || ticketInfo.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
                <p className="text-slate-600 font-medium">Đang chuẩn bị thông tin...</p>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
