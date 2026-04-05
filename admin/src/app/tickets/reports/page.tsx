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
import { 
    FileText, 
    Download, 
    RefreshCw, 
    ArrowLeft, 
    ChevronUp, 
    ChevronDown, 
    ChevronsLeft, 
    ChevronsRight, 
    ChevronLeft, 
    ChevronRight,
    ArrowUpDown
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TicketReportPage() {
    const router = useRouter();
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Pagination & Sorting States
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState("MAVE");
    const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tickets/admin/reports`, {
                params: {
                    page,
                    limit,
                    sortBy,
                    sortOrder
                }
            });
            
            const { data, total, totalPages } = response.data;
            setReports(data || []);
            setTotal(total || 0);
            setTotalPages(totalPages || 0);
            
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            toast.error("Không thể tải báo cáo từ Oracle View.");
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, sortBy, sortOrder]);

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
        } else {
            setSortBy(column);
            setSortOrder("ASC");
        }
        setPage(1); // Reset to first page when sorting
    };

    const handleExportExcel = async () => {
        // Xuất tất cả dữ liệu (không phân trang) dành cho báo cáo đầy đủ
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tickets/admin/reports`, {
                params: { page: 1, limit: 10000, sortBy, sortOrder }
            });
            const allData = response.data.data;

            if (!allData || allData.length === 0) {
                toast.warning("Không có dữ liệu để xuất.");
                return;
            }

            const excelData = allData.map((item: any) => ({
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

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo vé");
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const finalData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
            const fileName = `Bao-cao-chi-tiet-ve-${format(new Date(), "dd-MM-yyyy")}.xlsx`;
            saveAs(finalData, fileName);
            toast.success(`Đã xuất ${allData.length} dòng dữ liệu thành công!`);
        } catch (error) {
            toast.error("Lỗi khi xuất file Excel.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

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

    const SortIcon = ({ column }: { column: string }) => {
        if (sortBy !== column) return <ArrowUpDown className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity text-slate-400" />;
        return sortOrder === "ASC" ? 
            <ChevronUp className="w-4 h-4 ml-2 text-blue-600 stroke-[3px]" /> : 
            <ChevronDown className="w-4 h-4 ml-2 text-blue-600 stroke-[3px]" />;
    };

    return (
        <ListLayout
            title="Báo cáo Chi tiết Vé"
            description="Dữ liệu đồng bộ từ Oracle View V_TICKET_DETAILS. Hỗ trợ sắp xếp và phân trang."
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
                        disabled={isLoading}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Xuất Excel
                    </Button>
                </div>
            }
        >
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                            <TableHead 
                                className="w-[100px] font-bold cursor-pointer hover:bg-slate-100 transition-colors group"
                                onClick={() => handleSort("MAVE")}
                            >
                                <div className="flex items-center">Mã Vé <SortIcon column="MAVE" /></div>
                            </TableHead>
                            <TableHead 
                                className="font-bold cursor-pointer hover:bg-slate-100 transition-colors group"
                                onClick={() => handleSort("TENKH")}
                            >
                                <div className="flex items-center">Khách hàng <SortIcon column="TENKH" /></div>
                            </TableHead>
                            <TableHead className="font-bold">Điện thoại</TableHead>
                            <TableHead className="font-bold">Hành trình</TableHead>
                            <TableHead 
                                className="font-bold text-center cursor-pointer hover:bg-slate-100 transition-colors group"
                                onClick={() => handleSort("SOGHE")}
                            >
                                <div className="flex items-center justify-center">Ghế <SortIcon column="SOGHE" /></div>
                            </TableHead>
                            <TableHead 
                                className="font-bold cursor-pointer hover:bg-slate-100 transition-colors group"
                                onClick={() => handleSort("THOIGIANKHOIHANH")}
                            >
                                <div className="flex items-center">Giờ chạy <SortIcon column="THOIGIANKHOIHANH" /></div>
                            </TableHead>
                            <TableHead 
                                className="font-bold cursor-pointer hover:bg-slate-100 transition-colors group"
                                onClick={() => handleSort("TONGTIEN")}
                            >
                                <div className="flex items-center">Tổng tiền <SortIcon column="TONGTIEN" /></div>
                            </TableHead>
                            <TableHead 
                                className="font-bold cursor-pointer hover:bg-slate-100 transition-colors group"
                                onClick={() => handleSort("TRANGTHAI")}
                            >
                                <div className="flex items-center">Trạng thái <SortIcon column="TRANGTHAI" /></div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-40 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <RefreshCw className="w-8 h-8 animate-spin text-primary opacity-20" />
                                        <span className="text-slate-400 font-medium">Đang xử lý dữ liệu Oracle...</span>
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

                {/* Pagination Controls */}
                {!isLoading && reports.length > 0 && (
                    <div className="p-4 border-t bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-500 font-medium">
                            Hiển thị từ <span className="text-slate-900">{(page - 1) * limit + 1}</span> đến <span className="text-slate-900">{Math.min(page * limit, total)}</span> trong tổng số <span className="text-slate-900">{total}</span> bản ghi
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500 font-medium">Số dòng:</span>
                                <Select 
                                    value={String(limit)} 
                                    onValueChange={(val) => { setLimit(Number(val)); setPage(1); }}
                                >
                                    <SelectTrigger className="w-[70px] h-8">
                                        <SelectValue placeholder={limit} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button 
                                    variant="outline" size="icon" className="h-8 w-8" 
                                    onClick={() => setPage(1)} disabled={page === 1}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="outline" size="icon" className="h-8 w-8" 
                                    onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                
                                <div className="flex items-center px-4 h-8 bg-white border rounded-md text-sm font-bold min-w-[80px] justify-center">
                                    Trang {page} / {totalPages}
                                </div>

                                <Button 
                                    variant="outline" size="icon" className="h-8 w-8" 
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="outline" size="icon" className="h-8 w-8" 
                                    onClick={() => setPage(totalPages)} disabled={page === totalPages}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                <strong>Lưu ý:</strong> Chế độ phân trang giúp tối ưu hiệu năng khi dữ liệu lớn. Toàn bộ dữ liệu được sắp xếp từ phía máy chủ Oracle để đảm bảo tính nhất quán.
            </div>
        </ListLayout>
    );
}
