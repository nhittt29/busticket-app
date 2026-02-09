"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, MapPin, Phone, User, Mail, CreditCard } from "lucide-react";
import { bookingApi } from "@/lib/api/booking";
import { DropoffPoint, CustomerInfo } from "@/types/booking";
import { Seat } from "@/types/seat";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingStore } from "@/store/useBookingStore";

interface BookingConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    scheduleId: number;
    selectedSeats: Seat[];
    baseTotalPrice: number;
}

export function BookingConfirmationModal({
    isOpen,
    onClose,
    scheduleId,
    selectedSeats,
    baseTotalPrice
}: BookingConfirmationModalProps) {
    const router = useRouter();
    const { user } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false); // New state for API call
    const [dropoffPoints, setDropoffPoints] = useState<DropoffPoint[]>([]);
    const [selectedDropoff, setSelectedDropoff] = useState<DropoffPoint | null>(null);
    const [addressOverride, setAddressOverride] = useState("");

    // Customer Info (Pre-fill from Auth)
    const [customer, setCustomer] = useState<CustomerInfo>({
        fullName: user?.name || "",
        phone: user?.phone || "",
        email: user?.email || ""
    });

    // Update customer info when user changes or modal opens
    useEffect(() => {
        if (isOpen && user) {
            setCustomer(prev => ({
                ...prev,
                fullName: user.name || prev.fullName,
                phone: user.phone || prev.phone,
                email: user.email || prev.email
            }));
        }
    }, [isOpen, user]);

    // Fetch Dropoff Points
    useEffect(() => {
        if (isOpen && scheduleId) {
            setLoading(true);
            bookingApi.getDropoffPoints(scheduleId)
                .then(points => {
                    // Sort: Default first, then by Id
                    const sorted = [...points].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
                    setDropoffPoints(sorted);

                    // Auto-select default
                    const def = sorted.find(p => p.isDefault);
                    if (def) setSelectedDropoff(def);
                })
                .catch(() => toast.error("Không tải được điểm trả khách"))
                .finally(() => setLoading(false));
        }
    }, [isOpen, scheduleId]);

    // Calculate Totals
    const DOOR_TO_DOOR_ID = -1;
    const isDoorToDoor = selectedDropoff?.id === DOOR_TO_DOOR_ID;

    // Surcharge Calculation
    let surchargePerSeat = 0;
    if (isDoorToDoor) {
        surchargePerSeat = 150000;
    } else if (selectedDropoff?.surcharge) {
        surchargePerSeat = selectedDropoff.surcharge;
    }

    // Discount Calculation (simplified without schedule time check for now)
    // We assume if priceDifference < 0 it is a discount (handled as negative surcharge in logic or separate)
    // The Flutter logic used 'priceDifference' as discount if < 24h. 
    // Here we will just use 'surcharge' field from API for simplicity unless priceDifference is explicitly needed.
    // If API returns negative surcharge, it effectively acts as discount.

    const totalSurcharge = surchargePerSeat * selectedSeats.length;
    const finalPrice = baseTotalPrice + totalSurcharge;

    const handleConfirm = async () => {
        if (!selectedDropoff) {
            toast.error("Vui lòng chọn điểm trả khách");
            return;
        }
        if (isDoorToDoor && !addressOverride.trim()) {
            toast.error("Vui lòng nhập địa chỉ trả tận nơi");
            return;
        }
        if (!customer.fullName || !customer.phone) {
            toast.error("Vui lòng nhập tên và số điện thoại");
            return;
        }

        // SAVE TO STORE & REDIRECT
        console.log("🚀 [Booking] Proceeding to Checkout");

        // 1. Update Customer
        useBookingStore.getState().updateCustomerInfo({
            name: customer.fullName,
            phone: customer.phone,
            email: customer.email
        });

        // 2. Set Dropoff
        useBookingStore.getState().setDropoff(
            isDoorToDoor ? DOOR_TO_DOOR_ID : selectedDropoff.id,
            isDoorToDoor ? addressOverride : selectedDropoff.address || "",
            selectedDropoff,
            surchargePerSeat
        );

        // 3. Set Session
        useBookingStore.getState().setBookingSession(scheduleId, selectedSeats, baseTotalPrice);

        // 4. Redirect
        router.push('/checkout');
        onClose();
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto flex flex-col p-0 gap-0 rounded-2xl">
                <DialogHeader className="p-6 pb-2 bg-brand-gradient text-white rounded-t-2xl">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <CreditCard className="w-6 h-6" />
                        Xác nhận đặt vé
                    </DialogTitle>
                    <p className="text-blue-100 text-sm opacity-90">
                        Vui lòng kiểm tra kỹ thông tin trước khi thanh toán
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/30 dark:bg-slate-900">

                    {/* 1. DROP-OFF POINTS */}
                    <section>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            Điểm trả khách
                        </h3>

                        {loading ? (
                            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-500" /></div>
                        ) : (
                            <div className="space-y-3">
                                {dropoffPoints.map(point => {
                                    const isSel = selectedDropoff?.id === point.id;
                                    return (
                                        <div
                                            key={point.id}
                                            onClick={() => setSelectedDropoff(point)}
                                            className={cn(
                                                "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between",
                                                isSel ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 hover:border-blue-200 bg-white dark:bg-slate-800 dark:border-slate-700"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", isSel ? "border-blue-500" : "border-slate-300")}>
                                                    {isSel && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700 dark:text-slate-200">{point.name}</p>
                                                    <p className="text-sm text-slate-500">{point.address}</p>
                                                </div>
                                            </div>
                                            {point.surcharge > 0 && <span className="text-orange-500 font-bold text-sm">+{point.surcharge / 1000}k</span>}
                                        </div>
                                    );
                                })}

                                {/* Door-to-door Option */}
                                <div
                                    onClick={() => setSelectedDropoff({
                                        id: DOOR_TO_DOOR_ID,
                                        name: "Trả tận nơi",
                                        address: "",
                                        surcharge: 150000,
                                        priceDifference: 0,
                                        isDefault: false
                                    })}
                                    className={cn(
                                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                                        isDoorToDoor ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 hover:border-blue-200 bg-white dark:bg-slate-800 dark:border-slate-700"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", isDoorToDoor ? "border-blue-600" : "border-slate-300")}>
                                                {isDoorToDoor && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                            </div>
                                            <span className="font-bold text-blue-700 dark:text-blue-400">Trả tận nơi (Xe trung chuyển)</span>
                                        </div>
                                        <span className="text-orange-600 font-bold">+150.000đ</span>
                                    </div>

                                    {isDoorToDoor && (
                                        <Input
                                            value={addressOverride}
                                            onChange={(e) => setAddressOverride(e.target.value)}
                                            placeholder="Nhập địa chỉ nhà cụ thể..."
                                            className="mt-2 bg-white"
                                            autoFocus
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* 2. CUSTOMER INFO */}
                    <section>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            Thông tin khách hàng
                        </h3>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-500 uppercase">Họ và tên</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <Input
                                            value={customer.fullName}
                                            onChange={e => setCustomer({ ...customer, fullName: e.target.value })}
                                            placeholder="VD: Nguyễn Văn A"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-500 uppercase">Số điện thoại</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <Input
                                            value={customer.phone}
                                            onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                                            placeholder="VD: 0912345678"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-500 uppercase">Email (để nhận vé)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <Input
                                        value={customer.email}
                                        onChange={e => setCustomer({ ...customer, email: e.target.value })}
                                        placeholder="VD: email@example.com"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. PRICE SUMMARY */}
                    <section className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="space-y-2">
                            <div className="flex justify-between text-base">
                                <span className="text-slate-600">Giá vé ({selectedSeats.length} ghế)</span>
                                <span className="font-bold font-mono">{formatCurrency(baseTotalPrice)}</span>
                            </div>
                            {totalSurcharge > 0 && (
                                <div className="flex justify-between text-base">
                                    <span className="text-slate-600">Phụ thu điểm trả</span>
                                    <span className="font-bold text-orange-500 font-mono">+{formatCurrency(totalSurcharge)}</span>
                                </div>
                            )}
                            <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-lg text-slate-800 dark:text-slate-200">Tổng thanh toán</span>
                                <span className="font-bold text-2xl text-blue-600">{formatCurrency(finalPrice)}</span>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="p-4 border-t bg-white dark:bg-slate-900 rounded-b-2xl">
                    <Button
                        onClick={handleConfirm}
                        disabled={submitting}
                        className="w-full h-12 text-lg font-bold bg-brand-gradient hover:shadow-lg hover:shadow-blue-500/30 transition-all rounded-xl gap-2"
                    >
                        {submitting && <Loader2 className="animate-spin" />}
                        {submitting ? 'Đang xử lý...' : `Tiếp tục thanh toán • ${formatCurrency(finalPrice)}`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
