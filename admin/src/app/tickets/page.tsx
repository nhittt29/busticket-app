"use client";

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
import { Ticket, Search, Filter, MoreHorizontal, Download } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tickets = [
    {
        id: "T-1001",
        customer: "Nguyễn Văn A",
        route: "Sài Gòn - Đà Lạt",
        departure: "22:00 - 20/11/2025",
        seat: "A01",
        price: "350.000đ",
        status: "paid",
        paymentMethod: "Momo",
    },
    {
        id: "T-1002",
        customer: "Trần Thị B",
        route: "Hà Nội - Sapa",
        departure: "21:30 - 20/11/2025",
        seat: "B05",
        price: "450.000đ",
        status: "pending",
        paymentMethod: "Chuyển khoản",
    },
    {
        id: "T-1003",
        customer: "Lê Văn C",
        route: "Đà Nẵng - Huế",
        departure: "08:00 - 21/11/2025",
        seat: "C12",
        price: "180.000đ",
        status: "cancelled",
        paymentMethod: "Tiền mặt",
    },
    {
        id: "T-1004",
        customer: "Phạm Thị D",
        route: "Cần Thơ - Cà Mau",
        departure: "07:00 - 21/11/2025",
        seat: "D02",
        price: "160.000đ",
        status: "paid",
        paymentMethod: "ZaloPay",
    },
];

export default function TicketsPage() {
    return (
        <ListLayout
            title="Quản lý Vé xe"
            description="Danh sách vé đã đặt và trạng thái thanh toán."
            icon={Ticket}
            actions={
                <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Xuất Excel
                </Button>
            }
            filters={
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm mã vé, tên khách, SĐT..."
                            className="pl-9 bg-background"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Input type="date" className="w-auto bg-background" />
                        <Button variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Bộ lọc
                        </Button>
                    </div>
                </div>
            }
        >
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[100px]">Mã vé</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Chuyến xe</TableHead>
                        <TableHead>Ghế</TableHead>
                        <TableHead>Giá vé</TableHead>
                        <TableHead>Thanh toán</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.map((ticket) => (
                        <TableRow key={ticket.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium font-mono">{ticket.id}</TableCell>
                            <TableCell>
                                <div className="font-medium">{ticket.customer}</div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{ticket.route}</span>
                                    <span className="text-xs text-muted-foreground">{ticket.departure}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-mono">
                                    {ticket.seat}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-primary">
                                {ticket.price}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {ticket.paymentMethod}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="secondary"
                                    className={
                                        ticket.status === "paid"
                                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                                            : ticket.status === "pending"
                                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                                : "bg-red-100 text-red-700 hover:bg-red-100"
                                    }
                                >
                                    {ticket.status === "paid"
                                        ? "Đã thanh toán"
                                        : ticket.status === "pending"
                                            ? "Chờ thanh toán"
                                            : "Đã hủy"}
                                </Badge>
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
                                        <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                                        <DropdownMenuItem>In vé</DropdownMenuItem>
                                        <DropdownMenuItem>Gửi email xác nhận</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                            Hủy vé
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ListLayout>
    );
}
