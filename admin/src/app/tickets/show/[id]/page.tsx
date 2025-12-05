"use client";


import { useUpdate } from "@refinedev/core";
import { ListLayout } from "@/components/common/ListLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Ticket, ArrowLeft, User, MapPin, Calendar, CreditCard, Ban, CheckCircle } from "lucide-react";
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

    const getStatusBadge = (status?: TicketStatus) => {
        switch (status) {
            case TicketStatus.PAID:
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-base px-4 py-1">Đã thanh toán</Badge>;
            case TicketStatus.BOOKED:
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-base px-4 py-1">Chờ thanh toán</Badge>;
            case TicketStatus.CANCELLED:
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-base px-4 py-1">Đã hủy</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
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
                                    <p className="font-medium">{booking.schedule?.bus?.name}</p>
                                    <p className="text-sm text-muted-foreground">{booking.schedule?.bus?.licensePlate}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tổng số ghế</p>
                                    <Badge variant="secondary" className="text-lg px-3">
                                        {booking.seatCount} vé
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Danh sách ghế đã đặt</p>
                                <div className="flex flex-wrap gap-2">
                                    {booking.tickets?.map((t: any) => (
                                        <Badge key={t.id} variant="outline" className="text-base px-3 py-1">
                                            Ghế {t.seat?.seatNumber} ({formatCurrency(t.price)})
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                                {getStatusBadge(booking.status)}
                            </div>
                            <Separator />
<<<<<<< HEAD
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
=======
                            {booking.discountAmount > 0 && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Giá gốc</span>
                                        <span className="text-muted-foreground line-through">{formatCurrency(booking.originalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Giảm giá</span>
                                        <span className="text-red-500 font-medium">-{formatCurrency(booking.discountAmount)}</span>
                                    </div>
                                    <Separator />
                                </>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">Tổng cộng</span>
                                <span className="font-bold text-xl text-primary">{formatCurrency(booking.totalPrice)}</span>
                            </div>
>>>>>>> c9cddcb477d486f593c5a5c3fb56875c99670747
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
