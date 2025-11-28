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
import { BusFront, Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const buses = [
    {
        id: 1,
        plateNumber: "51B-123.45",
        type: "Limousine 34 phòng",
        brand: "Thaco Mobihome",
        capacity: 34,
        status: "active",
        driver: "Nguyễn Văn A",
    },
    {
        id: 2,
        plateNumber: "29B-987.65",
        type: "Giường nằm 40 chỗ",
        brand: "Hyundai Universe",
        capacity: 40,
        status: "maintenance",
        driver: "Trần Văn B",
    },
    {
        id: 3,
        plateNumber: "43B-567.89",
        type: "Ghế ngồi 29 chỗ",
        brand: "Samco Felix",
        capacity: 29,
        status: "active",
        driver: "Lê Văn C",
    },
    {
        id: 4,
        plateNumber: "65B-321.09",
        type: "Limousine 22 phòng",
        brand: "Thaco Mobihome",
        capacity: 22,
        status: "inactive",
        driver: "Chưa phân công",
    },
];

export default function BusesPage() {
    return (
        <ListLayout
            title="Quản lý Xe khách"
            description="Danh sách các xe khách và tình trạng hoạt động."
            icon={BusFront}
            actions={
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm xe mới
                </Button>
            }
            filters={
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm biển số, tài xế..."
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
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Biển số xe</TableHead>
                        <TableHead>Loại xe</TableHead>
                        <TableHead>Hãng xe</TableHead>
                        <TableHead>Sức chứa</TableHead>
                        <TableHead>Tài xế</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {buses.map((bus) => (
                        <TableRow key={bus.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">#{bus.id}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-mono text-base">
                                    {bus.plateNumber}
                                </Badge>
                            </TableCell>
                            <TableCell>{bus.type}</TableCell>
                            <TableCell>{bus.brand}</TableCell>
                            <TableCell>{bus.capacity} chỗ</TableCell>
                            <TableCell>{bus.driver}</TableCell>
                            <TableCell>
                                <Badge
                                    variant="secondary"
                                    className={
                                        bus.status === "active"
                                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                                            : bus.status === "inactive"
                                                ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
                                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                    }
                                >
                                    {bus.status === "active"
                                        ? "Sẵn sàng"
                                        : bus.status === "inactive"
                                            ? "Ngưng"
                                            : "Bảo trì"}
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
                                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                                        <DropdownMenuItem>Lịch sử bảo trì</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                            Xóa xe
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
