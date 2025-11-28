"use client";

import { useOne, useUpdate } from "@refinedev/core";
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

export default function TicketShowPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { data, isLoading } = useOne<ITicket>({
        resource: "tickets",
        id: params.id,
    }) as any;

    const ticket = data?.data;

    const { mutate: updateTicket } = useUpdate();

    const handleCancel = () => {
        if (confirm("Bạn có chắc chắn muốn hủy vé này không?")) {
            updateTicket(
                {
                    resource: "tickets",
                    id: params.id,
                    values: {
                        status: TicketStatus.CANCELLED,
                    },
                },
                {
                    onSuccess: () => {
                        toast.success("Hủy vé thành công");
                    },
                    onError: (error) => {
                        toast.error("Hủy vé thất bại", {
                            description: error.message,
                        });
                    },
                }
            );
        }
    };

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
        return <div className="p-8 text-center">Đang tải thông tin vé...</div>;
    }

    if (!ticket) {
        return <div className="p-8 text-center">Không tìm thấy vé.</div>;
    }

    return (
        <ListLayout
            title={`Chi tiết Vé #${ticket.id}`}
            description={`Thông tin chi tiết vé và lịch sử thanh toán.`}
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
                                    <p className="font-medium text-lg">{ticket.user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                                    <p className="font-medium text-lg">{ticket.user?.phone || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{ticket.user?.email}</p>
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
                                    <p className="text-2xl font-bold text-primary">{ticket.schedule?.route?.startPoint}</p>
                                    <p className="text-sm text-muted-foreground">{formatDateTime(ticket.schedule?.departureAt)}</p>
                                </div>
                                <div className="flex-1 px-4 flex flex-col items-center">
                                    <div className="w-full h-[2px] bg-border relative">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-2">
                                        {ticket.schedule?.route?.averageDurationMin} phút
                                    </span>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-primary">{ticket.schedule?.route?.endPoint}</p>
                                    <p className="text-sm text-muted-foreground">{formatDateTime(ticket.schedule?.arrivalAt)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nhà xe</p>
                                    <p className="font-medium">{ticket.schedule?.bus?.name}</p>
                                    <p className="text-sm text-muted-foreground">{ticket.schedule?.bus?.licensePlate}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Ghế</p>
                                    <Badge variant="secondary" className="text-lg px-3">
                                        {ticket.seat?.seatNumber} ({ticket.seat?.code})
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Điểm trả khách</p>
                                <div className="p-3 bg-muted/50 rounded-md border">
                                    <p className="font-medium">{ticket.dropoffAddress || "Bến xe đích"}</p>
                                    {ticket.dropoffAddress && (
                                        <Badge variant="outline" className="mt-1 text-xs">Trả tận nơi</Badge>
                                    )}
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
                                {getStatusBadge(ticket.status)}
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Giá vé</span>
                                <span className="font-medium">{formatCurrency(ticket.price)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Phụ thu</span>
                                <span className="font-medium">{formatCurrency(ticket.surcharge)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">Tổng cộng</span>
                                <span className="font-bold text-xl text-primary">{formatCurrency(ticket.totalPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Phương thức</span>
                                <span className="font-medium">{ticket.paymentMethod || "Chưa chọn"}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Hành động</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {ticket.status === TicketStatus.BOOKED && (
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={handleCancel}
                                >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Hủy vé
                                </Button>
                            )}
                            {ticket.status === TicketStatus.PAID && (
                                <div className="p-3 bg-green-50 text-green-700 rounded-md flex items-center justify-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Vé đã hoàn tất
                                </div>
                            )}
                            {ticket.status === TicketStatus.CANCELLED && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center justify-center gap-2">
                                    <Ban className="w-5 h-5" />
                                    Vé đã bị hủy
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ListLayout>
    );
}
