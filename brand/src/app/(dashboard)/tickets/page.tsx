"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Search, Ticket as TicketIcon, Filter, Eye } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function TicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchTickets = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/tickets/my-brand");
            setTickets(response.data);
        } catch (error) {
            toast.error("Không thể tải danh sách vé");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const filteredTickets = tickets.filter(ticket => 
        ticket.id.toString().includes(searchTerm) ||
        ticket.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user?.phone?.includes(searchTerm) ||
        ticket.schedule?.route?.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.schedule?.route?.destination?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PAID":
                return <Badge className="bg-emerald-100 text-emerald-800 border-none">Đã thanh toán</Badge>;
            case "BOOKED":
                return <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-none">Đã đặt chỗ</Badge>;
            case "CANCELLED":
                return <Badge variant="destructive" className="bg-red-100 text-red-800 border-none">Đã hủy</Badge>;
            case "COMPLETED":
                return <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">Hoàn thành</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border shadow-sm gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Vé Xe</h1>
                    <p className="text-gray-500 mt-1">Theo dõi hành khách và tình trạng vé cho các chuyến đi của nhà xe.</p>
                </div>
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Tìm mã vé, tên, SĐT..." 
                            className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[80px]">Mã Vé</TableHead>
                            <TableHead>Hành khách</TableHead>
                            <TableHead>Chuyến đi</TableHead>
                            <TableHead>Ghế</TableHead>
                            <TableHead>Giá vé</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày đặt</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-48 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin mb-2" />
                                        Đang tải dữ liệu...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredTickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-48 text-center text-gray-500">
                                    {searchTerm ? "Không tìm thấy vé nào khớp với từ khóa" : "Chưa có vé nào được đặt"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTickets.map((ticket) => (
                                <TableRow key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-bold">#{ticket.id}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{ticket.user?.name}</span>
                                            <span className="text-xs text-gray-500">{ticket.user?.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {ticket.schedule?.route?.origin} → {ticket.schedule?.route?.destination}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {ticket.schedule?.departureAt && format(new Date(ticket.schedule.departureAt), "HH:mm, dd/MM/yyyy", { locale: vi })}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-bold text-primary border-primary/20 bg-primary/5">
                                            {ticket.seat?.code}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {(ticket.totalPrice || 0).toLocaleString()}đ
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(ticket.status)}
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500">
                                        {format(new Date(ticket.createdAt), "dd/MM/yyyy")}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
