"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Ticket, Home, ArrowRight } from "lucide-react";
import { bookingApi } from "@/lib/api/booking";
import Link from "next/link";

// Suspense boundary might be needed for useSearchParams in Next.js 13+ app directory if not wrapped.
// But simpler here to just use client side logic.

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Support multiple param formats
    const paymentIdParam = searchParams.get('paymentId');
    const historyIdParam = searchParams.get('paymentHistoryId');
    const idParam = searchParams.get('id');

    // Priority: paymentId (from controller redirect) > paymentHistoryId > id
    const id = paymentIdParam || historyIdParam || idParam;

    const [loading, setLoading] = useState(true);
    const [ticketInfo, setTicketInfo] = useState<any>(null);

    useEffect(() => {
        const fetchInfo = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                const data = await bookingApi.getPaymentDetail(Number(id));
                setTicketInfo(data);
                // Optional: If status is still PENDING (latency), maybe poll or just show "Processing"
                // But usually this page is reached after success.
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden">
                    {/* Header Banner */}
                    <div className="bg-green-500 p-8 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 ring-4 ring-white/10">
                                <CheckCircle2 className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold mb-1">Thanh toán thành công!</h1>
                            <p className="text-green-100 font-medium">Cảm ơn bạn đã đặt vé</p>
                        </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="p-6">
                        <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 mb-6 bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-dashed border-slate-200 dark:border-slate-700">
                                <span className="text-slate-500 text-sm">Mã vé</span>
                                <span className="font-mono font-bold text-lg text-slate-800 dark:text-slate-200">
                                    #{ticketInfo.tickets?.[0]?.id || ticketInfo.ticketPayments?.[0]?.ticket?.id || ticketInfo.id}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {/* Extract ticket details from the first ticket in the history */}
                                {(() => {
                                    const firstTicket = ticketInfo.tickets?.[0] || ticketInfo.ticketPayments?.[0]?.ticket;
                                    const route = firstTicket?.schedule?.route;
                                    const routeName = route ? `${route.startPoint} - ${route.endPoint}` : "N/A";
                                    const departureTime = firstTicket?.schedule?.departureAt;
                                    // Collect all seat numbers
                                    const seats = (ticketInfo.tickets || ticketInfo.ticketPayments?.map((tp: any) => tp.ticket) || [])
                                        .map((t: any) => t.seat?.seatNumber)
                                        .filter(Boolean)
                                        .join(', ');

                                    return (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 text-sm">Tuyến đường</span>
                                                <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{routeName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 text-sm">Thời gian</span>
                                                <span className="font-medium text-slate-800 dark:text-slate-200 text-right w-2/3">
                                                    {departureTime ? new Date(departureTime).toLocaleString('vi-VN') : 'Invalid Date'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 text-sm">Vị trí ghế</span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200">{seats || "Chưa chọn ghế"}</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link
                                href="/account/tickets"
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <Ticket className="w-5 h-5" />
                                Xem vé của tôi
                            </Link>

                            <Link
                                href="/"
                                className="w-full py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                                <Home className="w-5 h-5" />
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-400 text-sm mt-8">
                    Thông tin vé đã được gửi về email của bạn.
                </p>
            </div>
        </div>
    );
}
