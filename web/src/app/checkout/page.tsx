"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, MapPin, User, Mail, Phone, CreditCard, Ticket } from "lucide-react";
import { useBookingStore } from "@/store/useBookingStore";
import { bookingApi } from "@/lib/api/booking";
import { useAuthStore } from "@/store/useAuthStore";
import { promotionApi } from "@/lib/api/promotion";
import { Promotion } from "@/types/promotion";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const store = useBookingStore();

    const [processing, setProcessing] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<"MOMO" | "ZALOPAY" | "VNPAY">("MOMO");
    const [promotions, setPromotions] = useState<Promotion[]>([]);

    // Hydration check
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        if (isRedirecting) return; // Prevent redirecting back to home when clearing store for payment

        if (!store.scheduleId || store.selectedSeats.length === 0) {
            router.push('/');
        } else {
            // Fetch Promotions
            promotionApi.getActivePromotions().then(setPromotions);
        }
    }, [store.scheduleId, store.selectedSeats, router, isRedirecting]);

    const handleApplyPromotion = async (code: string) => {
        try {
            const res = await promotionApi.applyPromotion(code, store.totalPrice + store.surcharge);
            if (res.success && res.promotion) {
                store.applyPromotion(res.promotion);
                toast.success(`Áp dụng mã ${code} thành công! -${formatCurrency(res.discountAmount)}`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Mã giảm giá không hợp lệ");
        }
    };

    if (!mounted) return null;

    // Derived states
    const finalPrice = store.finalTotalPrice;
    const { customerInfo, selectedSeats, selectedDropoffPoint, dropoffAddress, surcharge, discountAmount } = store;

    const handlePayment = async () => {
        if (!user) {
            toast.error("Vui lòng đăng nhập lại");
            return;
        }

        setProcessing(true);
        try {
            // Payload matching Backend DTO
            const payload = {
                tickets: selectedSeats.map(seat => ({
                    userId: Number(user.id),
                    scheduleId: store.scheduleId!,
                    seatId: seat.id,
                    price: seat.price,
                    paymentMethod: selectedMethod,
                    dropoffPointId: (store.dropoffPointId && store.dropoffPointId !== -1) ? store.dropoffPointId : undefined,
                    dropoffAddress: (store.dropoffPointId === -1 && store.dropoffAddress) ? store.dropoffAddress : undefined
                })),
                totalAmount: finalPrice,
                // Add Promotion if any
                promotionId: store.selectedPromotion?.id,
                discountAmount: store.discountAmount
            };

            const response = await bookingApi.createBooking(payload);
            const paymentData = response.payment;
            const historyId = response.tickets && response.tickets.length > 0 ? response.tickets[0].paymentHistoryId : null;

            if (!historyId) {
                toast.error("Lỗi: Không nhận được mã đơn hàng");
                return;
            }

            // Prevent the useEffect from sending us back to the home page when we empty the store
            setIsRedirecting(true);

            // Clear Store after successful booking creation
            store.reset();

            toast.success("Đặt vé thành công!");

            // Redirect Logic
            if (paymentData?.payUrl) {
                window.location.href = paymentData.payUrl;
            } else {
                router.push(`/payment/${historyId}`);
            }

        } catch (error: any) {
            console.error("Payment Error:", error);
            toast.error(error.response?.data?.message || "Thanh toán thất bại");
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div className="min-h-screen bg-background dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* LEFT COLUMN - INFO */}
                <div className="md:col-span-2 space-y-6">
                    <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
                    </button>

                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Thanh toán vé xe</h1>

                    {/* Customer Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <User className="w-5 h-5 text-blue-500" />
                            Thông tin hành khách
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <User className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Họ tên</p>
                                    <p className="font-medium">{customerInfo?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <Phone className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Số điện thoại</p>
                                    <p className="font-medium">{customerInfo?.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg md:col-span-2">
                                <Mail className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p className="font-medium">{customerInfo?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dropoff Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <MapPin className="w-5 h-5 text-orange-500" />
                            Điểm trả khách
                        </h3>
                        <div className="p-4 border rounded-xl bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20">
                            <p className="font-bold text-orange-700 dark:text-orange-400">
                                {selectedDropoffPoint?.name || "Trả tận nơi"}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {dropoffAddress || selectedDropoffPoint?.address}
                            </p>
                        </div>
                    </div>

                    {/* Promotion Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <Ticket className="w-5 h-5 text-purple-500" />
                            Mã khuyến mãi
                        </h3>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Nhập mã giảm giá"
                                className="flex-1 px-4 py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                id="promo-input"
                            />
                            <button
                                onClick={() => {
                                    const input = document.getElementById('promo-input') as HTMLInputElement;
                                    if (input?.value) handleApplyPromotion(input.value);
                                }}
                                className="px-4 py-2 bg-purple-100 text-purple-700 font-bold rounded-xl hover:bg-purple-200 transition-colors"
                            >
                                Áp dụng
                            </button>
                        </div>

                        {/* Selected Promotion Display */}
                        {store.selectedPromotion && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex justify-between items-center mb-4">
                                <div>
                                    <p className="font-bold text-green-700">{store.selectedPromotion.code}</p>
                                    <p className="text-xs text-green-600">{store.selectedPromotion.description}</p>
                                </div>
                                <button
                                    onClick={() => store.removePromotion()}
                                    className="text-slate-400 hover:text-red-500"
                                >
                                    <ArrowLeft className="w-4 h-4 rotate-45 transform origin-center" />
                                    {/* Using ArrowLeft rotated as close icon alternative or just X */}
                                    <span className="text-xl font-bold ml-2">×</span>
                                </button>
                            </div>
                        )}

                        {/* Available Promotions List */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-500">Mã ưu đãi dành cho bạn</p>
                            {promotions.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">Hiện không có mã giảm giá nào.</p>
                            ) : (
                                promotions.map(promo => (
                                    <div
                                        key={promo.id}
                                        onClick={() => handleApplyPromotion(promo.code)}
                                        className="p-3 border border-dashed border-purple-300 rounded-xl bg-purple-50/50 cursor-pointer hover:bg-purple-50 transition-colors flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-bold text-slate-700">{promo.code}</p>
                                            <p className="text-xs text-slate-500">{promo.description}</p>
                                        </div>
                                        <div className="text-purple-600 font-bold text-sm">
                                            {promo.discountType === 'PERCENTAGE' ? `-${promo.discountValue}%` : `-${formatCurrency(promo.discountValue)}`}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <CreditCard className="w-5 h-5 text-green-500" />
                            Phương thức thanh toán
                        </h3>
                        <div className="space-y-3">
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
                                            ? `border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md`
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
                    </div>
                </div>

                {/* RIGHT COLUMN - SUMMARY */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-4">
                        <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-200">Chi tiết bảng giá</h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Giá vé ({selectedSeats.length} ghế)</span>
                                <span className="font-medium">{formatCurrency(store.totalPrice)}</span>
                            </div>
                            <div className="text-xs text-slate-500 pl-4">
                                {selectedSeats.map(s => s.seatNumber).join(', ')}
                            </div>

                            {surcharge > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Phụ thu</span>
                                    <span className="font-medium text-orange-500">+{formatCurrency(surcharge)}</span>
                                </div>
                            )}

                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Giảm giá</span>
                                    <span className="font-medium text-green-500">-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}

                            <div className="h-px bg-slate-100 my-2" />

                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-800">Tổng cộng</span>
                                <span className="font-bold text-xl text-blue-600">{formatCurrency(finalPrice)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full py-3.5 bg-brand-gradient text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {processing ? <Loader2 className="animate-spin" /> : "Thanh toán ngay"}
                        </button>

                        <p className="text-xs text-slate-400 text-center mt-4">
                            Bằng cách nhấn thanh toán, bạn đồng ý với điều khoản sử dụng của chúng tôi.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
