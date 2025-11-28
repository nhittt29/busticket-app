"use client";

import { useList, useUpdate } from "@refinedev/core";
import { ListLayout } from "@/components/common/ListLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Ticket, Search, Filter, Eye, Ban, CheckCircle, ArrowLeft } from "lucide-react";
import { ITicket, TicketStatus, PaymentMethod } from "@/interfaces/ticket";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function TicketListPage() {
    const router = useRouter();
    const { query, result } = useList<ITicket>({
        resource: "tickets",
        sorters: [
            {
                field: "createdAt",
                order: "desc",
            },
        ],
    }) as any; // Casting to any to avoid type issues with useList return

    const tickets = result?.data || [];
    const isLoading = query?.isLoading;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDateTime = (dateString: string) => {
        try {
            return format(new Date(dateString), "HH:mm dd/MM/yyyy", { locale: vi });
        } catch (e) {
            return dateString;
        }
    };

    const getStatusBadge = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.PAID:
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Đã thanh toán</Badge>;
            case TicketStatus.BOOKED:
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Chờ thanh toán</Badge>;
            case TicketStatus.CANCELLED:
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Đã hủy</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <ListLayout
            title="Quản lý Vé"
            description="Danh sách vé đã đặt và trạng thái."
            icon={Ticket}
            actions={
                <Button variant="outline" onClick={() => router.push("/")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            }
            filters={
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo mã vé, tên khách..."
                            className="pl-9 bg-background"
                        />
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Bộ lọc
                    </Button>
                </div>
            }
        >
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Chuyến xe</TableHead>
                        <TableHead>Ghế</TableHead>
                        <TableHead>Tổng tiền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày đặt</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                Đang tải dữ liệu...
                            </TableCell>
                        </TableRow>
                    ) : tickets.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                Chưa có vé nào.
                            </TableCell>
                        </TableRow>
                    ) : (
                        tickets.map((ticket: ITicket) => (
                            <TableRow key={ticket.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium">#{ticket.id}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{ticket.user?.name || "Khách vãng lai"}</span>
                                        <span className="text-xs text-muted-foreground">{ticket.user?.phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col max-w-[200px]">
                                        <span className="truncate font-medium">
                                            {ticket.schedule?.route?.startPoint} - {ticket.schedule?.route?.endPoint}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDateTime(ticket.schedule?.departureAt || "")}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-mono">
                                        {ticket.seat?.seatNumber}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-primary">
                                    {formatCurrency(ticket.totalPrice)}
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(ticket.status)}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {formatDateTime(ticket.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => router.push(`/tickets/show/${ticket.id}`)}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                Xem chi tiết
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </ListLayout>
    );
}
