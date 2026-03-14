"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Bus, CreateBusDto } from "@/interfaces/bus.interface";
import { toast } from "sonner";
import { Loader2, Plus, PenSquare, Trash2 } from "lucide-react";

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
import { BusFormModal } from "@/components/buses/BusFormModal";

export default function BusesPage() {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBus, setEditingBus] = useState<Bus | null>(null);

    const fetchBuses = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/buses/my-brand"); // Custom endpoint
            setBuses(response.data);
        } catch (error) {
            toast.error("Không thể tải danh sách xe");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBuses();
    }, []);

    const handleCreate = () => {
        setEditingBus(null);
        setIsModalOpen(true);
    };

    const handleEdit = (bus: Bus) => {
        setEditingBus(bus);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa xe này? Tất cả sơ đồ ghế sẽ bị xóa theo.")) return;
        try {
            await api.delete(`/buses/${id}`);
            toast.success("Đã xóa xe thành công");
            fetchBuses();
        } catch (error) {
            toast.error("Xóa xe thất bại");
        }
    };

    const handleSave = async (data: CreateBusDto) => {
        try {
            if (editingBus) {
                await api.put(`/buses/${editingBus.id}`, data);
                toast.success("Cập nhật thông tin xe thành công");
            } else {
                await api.post("/buses", data);
                toast.success("Thêm xe mới thành công");
            }
            setIsModalOpen(false);
            fetchBuses();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Đội Xe</h1>
                    <p className="text-gray-500 mt-1">Quản lý danh sách các phương tiện và cấu hình sơ đồ ghế.</p>
                </div>
                <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> Thêm xe mới
                </Button>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Biển số xe</TableHead>
                            <TableHead>Loại xe</TableHead>
                            <TableHead>Số lượng ghế</TableHead>
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
                        ) : buses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-gray-500">
                                    Chưa có xe nào trong hệ thống
                                </TableCell>
                            </TableRow>
                        ) : (
                            buses.map((bus) => (
                                <TableRow key={bus.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-medium">#{bus.id}</TableCell>
                                    <TableCell className="font-bold text-primary">{bus.plateNumber}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            bus.busType === 'LIMOUSINE' ? "text-purple-700 border-purple-200 bg-purple-50" :
                                                bus.busType === 'SLEEPER' ? "text-blue-700 border-blue-200 bg-blue-50" :
                                                    "text-emerald-700 border-emerald-200 bg-emerald-50"
                                        }>
                                            {bus.busType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{bus.totalSeats} ghế</TableCell>
                                    <TableCell>
                                        {bus.isActive ? (
                                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">Hoạt động</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-800">Bảo trì</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(bus)} className="text-primary hover:text-primary/80 hover:bg-primary/10">
                                            <PenSquare className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(bus.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <BusFormModal
                isOpen={isModalOpen}
                onChange={setIsModalOpen}
                onSave={handleSave}
                initialData={editingBus}
            />
        </div>
    );
}
