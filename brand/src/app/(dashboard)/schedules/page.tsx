"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Schedule } from "@/interfaces/schedule.interface";
import { toast } from "sonner";
import { Loader2, Plus, PenSquare, Trash2, Route } from "lucide-react";
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

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSchedules = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/schedules/my-brand"); // Custom endpoint
            setSchedules(response.data);
        } catch (error) {
            toast.error("Không thể tải danh sách chuyến đi");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Hủy bỏ chuyến đi này? Khách hàng đã đặt vé sẽ bị ảnh hưởng.")) return;
        try {
            await api.delete(`/schedules/${id}`);
            toast.success("Hủy chuyến thành công");
            fetchSchedules();
        } catch (error) {
            toast.error("Thao tác thất bại");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'UPCOMING': return <Badge className="bg-amber-100 text-amber-800 border-none">Sắp chạy</Badge>;
            case 'ONGOING': return <Badge className="bg-blue-100 text-blue-800 border-none">Đang chạy</Badge>;
            case 'COMPLETED': return <Badge className="bg-emerald-100 text-emerald-800 border-none">Hoàn thành</Badge>;
            case 'CANCELLED': return <Badge variant="destructive">Đã hủy</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Lịch Trình</h1>
                    <p className="text-gray-500 mt-1">Sắp xếp các chuyến đi, gán xe và thiết lập giờ xuất phát.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> Tạo chuyến mới
                </Button>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead>Tuyến Xe</TableHead>
                            <TableHead>Biển số (Loại xe)</TableHead>
                            <TableHead>Khởi hành</TableHead>
                            <TableHead>Giá vé</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin mb-2" />
                                        Đang tải dữ liệu...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : schedules.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-gray-500">
                                    Chưa có chuyến đi nào được thiết lập.
                                </TableCell>
                            </TableRow>
                        ) : (
                            schedules.map((schedule) => (
                                <TableRow key={schedule.id} className="hover:bg-gray-50/50">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">
                                                {schedule.route?.origin} → {schedule.route?.destination}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-primary">{schedule.bus?.plateNumber}</span>
                                            <span className="text-xs text-gray-500">{schedule.bus?.busType} ({schedule.bus?.totalSeats} ghế)</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium whitespace-nowrap">
                                            {format(new Date(schedule.departureAt), "HH:mm, dd/MM", { locale: vi })}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium text-emerald-600">
                                        {(schedule.price ?? 0).toLocaleString()} ₫
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(schedule.status)}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                            <PenSquare className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(schedule.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
