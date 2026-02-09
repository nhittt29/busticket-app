"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, RefreshCw, CreditCard, CheckCircle2 } from "lucide-react";
import { bookingApi } from "@/lib/api/booking";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
    // RESOLVE PARAMS
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [paymentDetail, setPaymentDetail] = useState<any>(null);
    const [selectedMethod, setSelectedMethod] = useState<"MOMO" | "ZALOPAY" | "VNPAY" | "CASH">("MOMO");
    const [processing, setProcessing] = useState(false);

    // Polling for ZaloPay
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (selectedMethod === 'ZALOPAY' && processing) {
            interval = setInterval(async () => {
                if (!paymentDetail?.paymentHistoryId) return;
                try {
                    const res = await bookingApi.checkZaloPayStatus(paymentDetail.paymentHistoryId);
                    if (res.success) {
                        toast.success("Thanh toán thành công!");
                        router.push(`/payment/success?id=${paymentDetail.paymentHistoryId}`);
                    }
                } catch (e) {
                    // Silent fail for polling
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [selectedMethod, processing, paymentDetail, router]);

    // FETCH DATA
    useEffect(() => {
        if (id) {
            bookingApi.getPaymentDetail(Number(id))
                .then(data => setPaymentDetail(data))
                .catch(() => toast.error("Không tìm thấy thông tin thanh toán"))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handlePayment = async () => {
        if (!paymentDetail) return;
        setProcessing(true);

        // In a real flow, we would call an API like `/api/tickets/{id}/pay` here
        // But since our `createBooking` API ALREADY returned the Pay URL (MoMo/Zalo),
        // we might just need to redirect if the Payment URL is stored or re-fetch it.
        // HOWEVER, based on the backend Flutter logic:
        // - `createBooking` returns the PayUrl immediately for the selected method.
        // - IF the user comes here LATER (from History), they need to re-initiate payment.

        // FOR SIMPLICITY (MVP): We assume this page is reached IMMEDIATELY after booking.
        // If coming from history, we would need a `repay` API which we haven't built yet on frontend.
        // Let's assume we are just simulating the redirect for now or handling the 'PENDING' state.

        // TODO: Implement `repay` API call if logic demands it. 
        // For now, let's simulate the flow based on method.

        try {
            // If we ALREADY have a payUrl from the initial creation (stored in local/context?), we use it.
            // But since we are reloading `getPaymentDetail`, it might not have the PayUrl if it wasn't saved.
            // Let's assume for this MVP step we re-create the payment link or specific logic.
            // Given the backend `payTicket` endpoint: POST /api/tickets/:id/pay -> ONLY SUPPORTS CASH currently in controller??
            // WAIT: Backend `TicketService.payTicket` takes `paymentMethod`.
            // Let's check `TicketController.pay`:
            // @Post(':id/pay') pay(@Param('id') id: string) { return this.ticketService.payTicket(Number(id), PaymentMethod.CASH); }
            // IT IS HARDCODED TO CASH! This is a backend limitation we might need to fix or workaround.

            // WORKAROUND: For this demo, we will use the `createBooking` response directly in the Modal to redirect.
            // This Page will act more as a "Review & Status" page if redirect fails or for Cash/Pending.

            // IF method is CASH/PENDING, allow finishing.
            if (selectedMethod === 'CASH') {
                toast.success("Đã xác nhận thanh toán tiền mặt tại quầy!");
                router.push(`/payment/success?id=${id}`);
            } else {
                toast.info("Chức năng thanh toán lại đang được cập nhật. Vui lòng đặt vé mới để lấy link thanh toán.");
            }
        } catch (error) {
            toast.error("Lỗi xử lý thanh toán");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!paymentDetail) return <div className="min-h-screen flex items-center justify-center text-red-500">Lỗi dữ liệu</div>;

    const { ticketCode, route, departureTime, seatNumber, price, status } = paymentDetail;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
                </button>

                <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Thanh toán vé xe</h1>

                {/* TICKET INFO CARD */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Mã vé</p>
                            <p className="text-xl font-bold font-mono text-blue-600">#{ticketCode}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Tuyến đường</span>
                            <span className="font-bold text-slate-900 dark:text-slate-200">{route}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Giờ xuất bến</span>
                            <span className="font-bold text-slate-900 dark:text-slate-200">{new Date(departureTime).toLocaleString('vi-VN')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Số ghế</span>
                            <span className="font-bold text-slate-900 dark:text-slate-200">{seatNumber}</span>
                        </div>
                        <div className="h-px bg-slate-100 my-2" />
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">Tổng tiền</span>
                            <span className="font-bold text-2xl text-blue-600">{price}</span>
                        </div>
                    </div>
                </div>

                {/* PAYMENT METHODS */}
                <div className="space-y-4 mb-8">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Phương thức thanh toán</h3>

                    {[
                        { id: 'MOMO', name: 'Ví MoMo', img: '/assets/images/momo.jpeg' },
                        { id: 'ZALOPAY', name: 'Ví ZaloPay', img: '/assets/images/zalopay.jpeg' },
                        { id: 'VNPAY', name: 'Ví VNPay', img: '/assets/images/vnpay.png' },
                    ].map((method) => (
                        <div
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id as any)}
                            className={cn(
                                "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                                selectedMethod === method.id
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                                    : "border-slate-200 bg-white dark:bg-slate-900 hover:border-blue-200"
                            )}
                        >
                            <div className="w-12 h-12 rounded-lg bg-white border border-slate-100 mr-4 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                                <img
                                    src={method.img}
                                    alt={method.name}
                                    className="w-full h-full object-contain p-1"
                                />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200 flex-1">{method.name}</span>
                            <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors", selectedMethod === method.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300')}>
                                {selectedMethod === method.id && (
                                    <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {processing ? <Loader2 className="animate-spin" /> : <CreditCard />}
                    Thanh toán ngay
                </button>
            </div>
        </div>
    );
}
