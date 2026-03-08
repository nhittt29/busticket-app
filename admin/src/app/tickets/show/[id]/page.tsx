"use client";


import { useUpdate } from "@refinedev/core";
import { ListLayout } from "@/components/common/ListLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Ticket, ArrowLeft, User, MapPin, Calendar, CreditCard, Ban, CheckCircle, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { ITicket, TicketStatus } from "@/interfaces/ticket";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

import { useParams } from "next/navigation";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function TicketShowPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const [booking, setBooking] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        if (params?.id) {
            setIsLoading(true);
            api.get(`/tickets/bookings/${params.id}`)
                .then((res) => {
                    setBooking(res.data);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.error("Error fetching booking:", err);
                    setError(err);
                    setIsLoading(false);
                });
        }
    }, [params?.id]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return "N/A";
        try {
            return format(new Date(dateString), "HH:mm dd/MM/yyyy", { locale: vi });
        } catch (e) {
            return dateString;
        }
    };

    const getStatusBadge = (status?: TicketStatus, refundAmount?: number, isRefunded?: boolean) => {
        switch (status) {
            case TicketStatus.PAID:
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-base px-4 py-1">Đã thanh toán</Badge>;
            case TicketStatus.BOOKED:
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-base px-4 py-1">Chờ thanh toán</Badge>;
            case TicketStatus.CANCELLED:
                if (refundAmount && refundAmount > 0) {
                    if (isRefunded) {
                        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-base px-4 py-1">Đã hoàn tiền</Badge>;
                    } else {
                        return <Badge className="bg-red-500 text-white animate-pulse hover:bg-red-600 text-base px-4 py-1">Cần hoàn tiền</Badge>;
                    }
                }
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-base px-4 py-1">Đã hủy</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleConfirmRefund = async () => {
        try {
            await api.post(`/tickets/${params.id}/refund`);
            toast.success("Xác nhận hoàn tiền thành công!");
            setBooking((prev: any) => ({ ...prev, isRefunded: true }));
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi xác nhận hoàn tiền.");
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Đang tải thông tin đặt vé...</div>;
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Đã xảy ra lỗi khi tải thông tin đặt vé.</p>
                <p className="text-sm text-muted-foreground">{error?.message || JSON.stringify(error)}</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-4">
                    Quay lại
                </Button>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="p-8 text-center">
                <p>Không tìm thấy mã đặt vé #{params?.id}.</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-4">
                    Quay lại
                </Button>
            </div>
        );
    }

    return (
        <ListLayout
            title={`Chi tiết Đặt Vé #${booking.id}`}
            description={`Thông tin chi tiết nhóm vé và thanh toán.`}
            icon={Ticket}
            actions={
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Thông tin Khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Họ và tên</p>
                                    <p className="font-medium text-lg">{booking.user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                                    <p className="font-medium text-lg">{booking.user?.phone || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{booking.user?.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Thông tin Chuyến đi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-primary">{booking.schedule?.route?.startPoint}</p>
                                    <p className="text-sm text-muted-foreground">{formatDateTime(booking.schedule?.departureAt)}</p>
                                </div>
                                <div className="flex-1 px-4 flex flex-col items-center">
                                    <div className="w-full h-[2px] bg-border relative">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-2">
                                        {booking.schedule?.route?.averageDurationMin} phút
                                    </span>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-primary">{booking.schedule?.route?.endPoint}</p>
                                    <p className="text-sm text-muted-foreground">{formatDateTime(booking.schedule?.arrivalAt)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nhà xe</p>
                                    <p className="font-medium text-lg">{booking.bus?.name || booking.schedule?.bus?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tổng số ghế</p>
                                    <Badge variant="secondary" className="text-lg px-3">
                                        1 vé
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Thông tin ghế</p>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="text-base px-3 py-1">
                                        {booking.seat?.seatNumber ? `Ghế ${booking.seat?.seatNumber}` : "N/A"} ({formatCurrency(booking.price)})
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Refund Info Card for Cancelled Tickets */}
                    {booking.status === TicketStatus.CANCELLED && booking.refundAmount > 0 && (
                        <Card className="border-red-200 bg-red-50/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-700">
                                    <RefreshCcw className="w-5 h-5" />
                                    Thông tin Hoàn tiền (Refund)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border shadow-sm">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tổng tiền vé Khách trả</p>
                                        <p className="font-medium">{formatCurrency(booking.totalPrice)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phí phạt (% hủy chuyến)</p>
                                        <p className="font-medium text-red-600">{formatCurrency(booking.cancellationFee || 0)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Số tiền Kế toán cần Hoàn</p>
                                        <p className="font-bold text-lg text-primary">{formatCurrency(booking.refundAmount)}</p>
                                    </div>
                                </div>

                                <Separator className="bg-red-100" />

                                <div className="flex items-center justify-between pt-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Trạng thái xử lý Kế toán</p>
                                        {booking.isRefunded ? (
                                            <span className="flex items-center text-sm font-medium text-blue-600">
                                                <CheckCircle className="w-4 h-4 mr-1" /> Kế toán đã hoàn tất lệnh chuyển khoản trả khách.
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-sm font-medium text-red-600">
                                                <Ban className="w-4 h-4 mr-1" /> Chờ kế toán đối soát & xác nhận chuyển tiền.
                                            </span>
                                        )}
                                    </div>

                                    {!booking.isRefunded && (
                                        <Button onClick={handleConfirmRefund} className="bg-red-600 hover:bg-red-700">
                                            Xác nhận Kế Toán Đã Hoàn Tiền
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Trạng thái</span>
                                {getStatusBadge(booking.status, booking.refundAmount, booking.isRefunded)}
                            </div>
                            <Separator />
                            {booking.discountAmount > 0 ? (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Tạm tính</span>
                                        <span className="font-medium text-muted-foreground line-through">
                                            {formatCurrency(booking.totalPrice + booking.discountAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-red-500">
                                        <span>Giảm giá</span>
                                        <span>- {formatCurrency(booking.discountAmount)}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-lg">Tổng cộng</span>
                                        <span className="font-bold text-xl text-primary">{formatCurrency(booking.totalPrice)}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg">Tổng cộng</span>
                                    <span className="font-bold text-xl text-primary">{formatCurrency(booking.totalPrice)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Phương thức</span>
                                <span className="font-medium">{booking.paymentMethod || "Chưa chọn"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Ngày tạo</span>
                                <span className="font-medium text-sm">{formatDateTime(booking.createdAt)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ListLayout>
    );
}
