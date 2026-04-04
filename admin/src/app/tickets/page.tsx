"use client";

import { useList } from "@refinedev/core";
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
import { Ticket, Search, Filter, Eye, ArrowLeft, CheckCircle, MapPin, XCircle } from "lucide-react";
import { TicketStatus } from "@/interfaces/ticket";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { useState, useEffect } from "react";
import axios from "axios";

export default function TicketListPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isProcedureMode, setIsProcedureMode] = useState(false);
    const [searchDate, setSearchDate] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [fromPoint, setFromPoint] = useState("");
    const [toPoint, setToPoint] = useState("");

    const { query, result } = useList<any>({
        resource: "bookings",
        sorters: [
            {
                field: "createdAt",
                order: "desc",
            },
        ],
        queryOptions: {
            enabled: !isProcedureMode, // Disable default list if searching by date 
        }
    }) as any;

    const refineBookings = result?.data || [];

    // Sync Refine data to local bookings state when not in Procedure mode
    useEffect(() => {
        if (!isProcedureMode && refineBookings.length > 0) {
            setBookings(refineBookings);
        }
    }, [refineBookings, isProcedureMode]);

    const isLoading = query?.isLoading || isSearching;

    // Local filter function
    const filteredBookings = bookings.filter((booking) => {
        const searchLower = searchText.toLowerCase();
        const bookingId = String(booking.id).toLowerCase();
        const customerName = (booking.user?.name || "").toLowerCase();
        const customerPhone = (booking.user?.phone || "").toLowerCase();
        const routeStart = (booking.schedule?.route?.startPoint || "").toLowerCase();
        const routeEnd = (booking.schedule?.route?.endPoint || "").toLowerCase();

        const matchFrom = !fromPoint || routeStart.includes(fromPoint.toLowerCase());
        const matchTo = !toPoint || routeEnd.includes(toPoint.toLowerCase());

        const matchText = !searchText || (
            bookingId.includes(searchLower) ||
            customerName.includes(searchLower) ||
            customerPhone.includes(searchLower)
        );

        return matchFrom && matchTo && matchText;
    });

    const handleSearchByDate = async (date: string) => {
        setSearchDate(date);
        if (!date) {
            setIsProcedureMode(false);
            if (result?.data) setBookings(result.data);
            return;
        }

        setIsSearching(true);
        setIsProcedureMode(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tickets/search-by-date?date=${date}`);
            const mappedData = response.data.map((item: any, index: number) => {
                return {
                    id: item.MAVE || item.ID || item.mave || item.id || `proc-${index}`,
                    user: { 
                        name: item.TENKH || item.tenkh || "Khách hàng", 
                        phone: item.DIENTHOAI || item.dienthoai || "N/A" 
                    },
                    schedule: { 
                        route: { 
                            startPoint: item.DIEMDI || item.diemdi || "N/A", 
                            endPoint: item.DIEMDEN || item.diemden || "N/A" 
                        },
                        departureAt: item.NGAYDI || item.ngaydi || item.THOIGIANKHOIHANH || item.thoigiankhoihanh 
                    },
                    seat: { seatNumber: item.SOGHE || item.soghe },
                    totalPrice: item.TONGTIEN || item.tongtien || 0,
                    status: item.TRANGTHAI || item.trangthai || "PAID",
                    createdAt: item.THOIGIANDAT || item.thoigiandat || item.NGAYDI || item.ngaydi,
                    ticketCount: item.SO_VE || 1,
                    discountAmount: item.DIEM_TL || 0
                };
            });
            setBookings(mappedData);

            // Tự động điền giá trị Nơi đi/Nơi đến để người dùng đỡ phải nhập lại
            if (mappedData.length > 0) {
                 if (!fromPoint) setFromPoint(mappedData[0].schedule.route.startPoint);
                 if (!toPoint) setToPoint(mappedData[0].schedule.route.endPoint);
            }

        } catch (error) {
            console.error("Procedure search failed:", error);
            toast.error("Không thể tra cứu dữ liệu từ Oracle Procedure.");
        } finally {
            setIsSearching(false);
        }
    };

    const resetFilters = () => {
        setSearchText("");
        setFromPoint("");
        setToPoint("");
        setSearchDate("");
        setIsProcedureMode(false);
        if (result?.data) setBookings(result.data);
    };

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

    const getStatusBadge = (status: TicketStatus, refundAmount?: number, isRefunded?: boolean) => {
        switch (status) {
            case TicketStatus.PAID:
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Đã thanh toán</Badge>;
            case TicketStatus.BOOKED:
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">Chờ thanh toán</Badge>;
            case TicketStatus.CANCELLED:
                if (refundAmount && refundAmount > 0) {
                    if (isRefunded) {
                        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Đã hoàn tiền</Badge>;
                    } else {
                        return <Badge className="bg-red-500 text-white animate-pulse hover:bg-red-600">Cần hoàn tiền</Badge>;
                    }
                }
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Đã hủy</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <ListLayout
            title="Quản lý Đặt Vé"
            description="Danh sách các giao dịch đặt vé (nhóm theo mã đặt chỗ)."
            icon={Ticket}
            actions={
                <Button variant="outline" onClick={() => router.push("/")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            }
            filters={
                <div className="flex flex-col gap-3 w-full">
                    {/* Filter row 1 */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder="Tìm theo mã vé, tên khách..."
                                className="pl-10 h-10 w-full outline-none focus-visible:ring-1 focus-visible:ring-blue-500 border-slate-200"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className="relative w-full sm:w-auto min-w-[300px] flex items-center gap-2 bg-green-50 border border-green-200 rounded-md px-3">
                            <span className="text-[11px] font-bold text-green-700 whitespace-nowrap uppercase">Tra cứu Procedure:</span>
                            <Input
                                type="date"
                                className="border-none bg-transparent shadow-none focus-visible:ring-0 p-0 text-green-800 font-semibold cursor-pointer h-10 w-full"
                                value={searchDate}
                                onChange={(e) => handleSearchByDate(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-10 border-slate-200" onClick={resetFilters}>
                            <Filter className="w-4 h-4 mr-2 text-slate-500" />
                            Bộ lọc
                        </Button>
                    </div>
                </div>
            }
        >

            {isProcedureMode && (
                <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center text-blue-700 text-sm font-medium">
                        <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                        Đang hiển thị kết quả trích xuất từ <strong><span className="mx-1 uppercase tracking-wide">Oracle Procedure P_TICKETS_BY_DATE</span></strong>.
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100/50 font-semibold" onClick={resetFilters}>
                        Thoát chế độ tra cứu
                    </Button>
                </div>
            )}

            <div className="border border-slate-200 shadow-sm rounded-md bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[80px] font-semibold text-slate-700">Mã Đặt</TableHead>
                            <TableHead className="font-semibold text-slate-700">Khách hàng</TableHead>
                            <TableHead className="font-semibold text-slate-700">Chuyến xe</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-center">Số ghế</TableHead>
                            <TableHead className="font-semibold text-slate-700">Danh sách ghế</TableHead>
                            <TableHead className="font-semibold text-slate-700">Tổng tiền</TableHead>
                            <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                            <TableHead className="font-semibold text-slate-700">Ngày đặt</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-500 gap-3">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <span className="font-medium text-sm">Đang tải dữ liệu...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredBookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-40 text-center">
                                     <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                                        <Search className="w-8 h-8 text-slate-300" />
                                        <span className="font-medium">Không tìm thấy giao dịch nào.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBookings.map((booking: any, index: number) => (
                                <TableRow
                                    key={booking.id || index}
                                    className="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 last:border-0"
                                    onClick={() => router.push(`/tickets/show/${booking.id}`)}
                                >
                                    <TableCell className="font-bold text-slate-900">#{booking.id}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800">{booking.user?.name || "Khách vãng lai"}</span>
                                            <span className="text-xs font-medium text-slate-500">{booking.user?.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800">
                                                {booking.schedule?.route?.startPoint} - {booking.schedule?.route?.endPoint}
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium">
                                                {formatDateTime(booking.schedule?.departureAt || "")}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full items-center justify-center text-xs font-bold">
                                            {booking.ticketCount || 1}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                                            {booking.seat?.seatNumber ? `Ghế ${booking.seat?.seatNumber}` : "N/A"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col items-start">
                                            {booking.discountAmount > 0 && (
                                                <span className="text-xs text-slate-400 line-through font-medium">
                                                    {formatCurrency(booking.totalPrice + booking.discountAmount)}
                                                </span>
                                            )}
                                            <span className={booking.discountAmount > 0 ? "font-bold text-rose-600" : "font-bold text-emerald-600"}>
                                                {formatCurrency(booking.totalPrice)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(booking.status, booking.refundAmount, booking.isRefunded)}
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-xs font-medium">
                                        {formatDateTime(booking.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                            onClick={(e) => { e.stopPropagation(); router.push(`/tickets/show/${booking.id}`); }}
                                            title="Xem chi tiết"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </ListLayout>
    );
}
