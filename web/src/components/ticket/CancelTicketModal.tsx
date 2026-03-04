"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Info } from "lucide-react";
import { bookingApi } from "@/lib/api/booking";

interface CancelTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticketId: number;
    onSuccess: () => void;
}

export function CancelTicketModal({ isOpen, onClose, ticketId, onSuccess }: CancelTicketModalProps) {
    const [loadingInfo, setLoadingInfo] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [info, setInfo] = useState<any>(null);

    useEffect(() => {
        if (isOpen && ticketId) {
            setLoadingInfo(true);
            setInfo(null);
            bookingApi.getCancellationInfo(ticketId)
                .then(data => setInfo(data))
                .catch(err => {
                    toast.error(err.response?.data?.message || "Không thể tải thông tin hủy vé");
                    onClose();
                })
                .finally(() => setLoadingInfo(false));
        }
    }, [isOpen, ticketId, onClose]);

    const handleConfirmCancel = async () => {
        setCancelling(true);
        try {
            await bookingApi.cancelTicket(ticketId);
            toast.success("Hủy vé thành công");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Hủy vé thất bại");
        } finally {
            setCancelling(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-b border-red-100 dark:border-red-900/30">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        Xác nhận hủy vé #{ticketId}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {loadingInfo ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-4" />
                            <p className="text-slate-500">Đang tính toán mức phí hủy vé...</p>
                        </div>
                    ) : info ? (
                        <>
                            {!info.isCancelable ? (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex gap-3 items-start">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold mb-1">Không thể hủy vé</p>
                                        <p className="text-sm">{info.message}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-xl text-orange-800 dark:text-orange-200">
                                        <div className="flex gap-2 mb-2">
                                            <Info className="w-5 h-5 flex-shrink-0" />
                                            <p className="font-semibold">{info.message}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-3 border border-slate-100 dark:border-slate-800">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Trạng thái vé:</span>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                                {info.status === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Phí hủy vé:</span>
                                            <span className="font-bold text-red-500">
                                                {formatCurrency(info.cancellationFee)}
                                            </span>
                                        </div>
                                        {info.status === 'PAID' && (
                                            <>
                                                <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                                                <div className="flex justify-between items-center pt-1">
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Số tiền hoàn lại:</span>
                                                    <span className="text-lg font-bold text-green-600">
                                                        {formatCurrency(info.refundAmount)}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {info.status === 'PAID' && (
                                        <p className="text-xs text-slate-500 italic text-center">
                                            * Hệ thống chỉ ghi nhận để đối soát. Thủ tục tiền mặt sẽ được xử lý riêng.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={onClose}
                                    disabled={cancelling}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 transition-colors disabled:opacity-50"
                                >
                                    Đóng
                                </button>

                                {info.isCancelable && (
                                    <button
                                        onClick={handleConfirmCancel}
                                        disabled={cancelling}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors disabled:opacity-50 shadow-lg shadow-red-500/30 flex justify-center items-center gap-2"
                                    >
                                        {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Xác nhận hủy
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4 text-red-500">
                            Đã xảy ra lỗi, vui lòng thử lại sau.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
