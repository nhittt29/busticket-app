"use client";

import { useList, useDelete } from "@refinedev/core";
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
import { Map, Search, Filter, MoreHorizontal, Plus, Pencil, Trash2, Clock, MapPin, ArrowLeft } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IRoute } from "@/interfaces/route";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RouteListPage() {
    const router = useRouter();
    // useList returns { query, result } in this version
    const hookResult = useList<IRoute>({
        resource: "routes",
        sorters: [
            {
                field: "id",
                order: "asc",
            },
        ],
    });

    // Safely access data
    const { query, result } = hookResult as any;
    const routes = result?.data || (hookResult as any).data?.data || [];
    const isLoading = query?.isLoading || (hookResult as any).isLoading;

    const { mutate: deleteRoute } = useDelete();

    const handleDelete = (id: number) => {
        if (confirm("Bạn có chắc chắn muốn xóa tuyến đường này không?")) {
            deleteRoute(
                {
                    resource: "routes",
                    id,
                },
                {
                    onSuccess: () => {
                        toast.success("Xóa tuyến đường thành công");
                    },
                    onError: (error) => {
                        toast.error("Xóa tuyến đường thất bại", {
                            description: error.message,
                        });
                    },
                }
            );
        }
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}p`;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <ListLayout
            title="Quản lý Tuyến đường"
            description="Danh sách các tuyến đường vận hành."
            icon={Map}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                    <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        onClick={() => router.push("/routes/create")}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm tuyến mới
                    </Button>
                </div>
            }
            filters={
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm điểm đi, điểm đến..."
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
                        <TableHead className="w-[60px]">ID</TableHead>
                        <TableHead>Điểm đi</TableHead>
                        <TableHead>Điểm đến</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Giá thấp nhất</TableHead>
                        <TableHead>Khoảng cách</TableHead>
                        <TableHead>Nhà xe</TableHead>
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
                    ) : routes.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                Chưa có tuyến đường nào.
                            </TableCell>
                        </TableRow>
                    ) : (
                        routes.map((route: IRoute) => (
                            <TableRow
                                key={route.id}
                                className="hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/routes/edit/${route.id}`)}
                            >
                                <TableCell className="font-medium">#{route.id}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-green-500" />
                                        {route.startPoint}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-500" />
                                        {route.endPoint}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDuration(route.averageDurationMin)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-green-600">
                                    {formatCurrency(route.lowestPrice)}
                                </TableCell>
                                <TableCell>{route.distanceKm ? `${route.distanceKm} km` : "N/A"}</TableCell>
                                <TableCell>{route.brand?.name || "N/A"}</TableCell>
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
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/routes/edit/${route.id}`); }}>
                                                <Pencil className="w-4 h-4 mr-2" />
                                                Chỉnh sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(route.id); }}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Xóa tuyến
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
