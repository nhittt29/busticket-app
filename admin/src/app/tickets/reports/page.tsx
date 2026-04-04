"use client";

import { ListLayout } from "@/components/common/ListLayout";
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
import { FileText, Download, RefreshCw, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function TicketReportPage() {
    const router = useRouter();
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tickets/admin/reports`);
            setReports(response.data);
            if (!isLoading) {
                toast.success("Dữ liệu báo cáo đã được cập nhật mới nhất!");
            }
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            toast.error("Không thể tải báo cáo từ Oracle View.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (reports.length === 0) {
            toast.warning("Không có dữ liệu để xuất.");
            return;
        }

        try {
            // Chuẩn bị dữ liệu cho Excel (đổi tên cột Tiếng Việt)
            const excelData = reports.map(item => ({
                "Mã Vé": `#${item.MAVE}`,
                "Họ tên Khách": item.TENKH,
                "Điện thoại": item.DIENTHOAI,
                "Điểm đi": item.DIEMDI,
                "Điểm đến": item.DIEMDEN,
                "Số Ghế": item.SOGHE,
                "Giờ khởi hành": formatDateTime(item.THOIGIANKHOIHANH),
                "Tổng tiền (VNĐ)": item.TONGTIEN,
                "Trạng thái": item.TRANGTHAI === 'PAID' ? 'Đã thanh toán' : 
                             item.TRANGTHAI === 'CANCELLED' ? 'Đã hủy' : 'Chờ xử lý'
            }));

            // Tạo Workbook
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo vé");

            // Xuất file
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
            
            const fileName = `Bao-cao-chi-tiet-ve-${format(new Date(), "dd-MM-yyyy")}.xlsx`;
            saveAs(data, fileName);
            toast.success("Đã xuất file Excel thành công!");
        } catch (error) {
            console.error("Export Excel error:", error);
            toast.error("Lỗi khi xuất file Excel.");
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount || 0);
    };

    const formatDateTime = (dateString: string) => {
        try {
            if (!dateString) return "N/A";
            return format(new Date(dateString), "HH:mm dd/MM/yyyy", { locale: vi });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <ListLayout
            title="Báo cáo Chi tiết Vé"
            description="Dữ liệu được trích xuất trực tiếp từ Oracle View V_TICKET_DETAILS cho mục đích kiểm toán."
            icon={FileText}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push("/")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                    <Button variant="outline" size="sm" onClick={fetchReports} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                    <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleExportExcel}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Xuất Excel
                    </Button>
                </div>
            }
        >
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                            <TableHead className="w-[80px] font-bold">Mã Vé</TableHead>
                            <TableHead className="font-bold">Họ tên Khách</TableHead>
                            <TableHead className="font-bold">Điện thoại</TableHead>
                            <TableHead className="font-bold">Hành trình</TableHead>
                            <TableHead className="font-bold text-center">Ghế</TableHead>
                            <TableHead className="font-bold">Giờ khởi hành</TableHead>
                            <TableHead className="font-bold">Tổng tiền</TableHead>
                            <TableHead className="font-bold">Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-40 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <RefreshCw className="w-8 h-8 animate-spin text-primary opacity-20" />
                                        <span className="text-slate-400">Đang truy vấn Oracle View...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-40 text-center text-slate-400">
                                    Không có dữ liệu báo cáo nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((item: any, index) => (
                                <TableRow key={index} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-mono text-primary font-bold">#{item.MAVE}</TableCell>
                                    <TableCell className="font-medium">{item.TENKH}</TableCell>
                                    <TableCell className="text-slate-500">{item.DIENTHOAI}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-xs uppercase text-slate-400 font-bold">Từ: {item.DIEMDI}</span>
                                            <span className="text-xs uppercase text-slate-400 font-bold">Đến: {item.DIEMDEN}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-blue-600">{item.SOGHE}</TableCell>
                                    <TableCell className="text-sm">
                                        {formatDateTime(item.THOIGIANKHOIHANH)}
                                    </TableCell>
                                    <TableCell className="font-bold text-primary">
                                        {formatCurrency(item.TONGTIEN)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${
                                            item.TRANGTHAI === 'PAID' ? 'bg-green-100 text-green-700' : 
                                            item.TRANGTHAI === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {item.TRANGTHAI === 'PAID' ? 'Đã thanh toán' : 
                                             item.TRANGTHAI === 'CANCELLED' ? 'Đã hủy' : 'Chờ xử lý'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                <strong>Lưu ý kỹ thuật:</strong> Toàn bộ dữ liệu trên bảng này được lấy ra từ **Oracle View V_TICKET_DETAILS**. Đây là cách tối ưu để gom dữ liệu từ 5 bảng (User, Ticket, Seat, Schedule, Route) giúp báo cáo đạt tốc độ cao nhất.
            </div>
        </ListLayout>
    );
}
