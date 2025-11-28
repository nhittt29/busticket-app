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
import { Route, Plus, Search, Filter, MoreHorizontal, MapPin } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for demonstration
const routes = [
    {
        id: 1,
        origin: "Sài Gòn",
        destination: "Đà Lạt",
        distance: "300km",
        duration: "6h 30m",
        price: "350.000đ",
        status: "active",
    },
    {
        id: 2,
        origin: "Hà Nội",
        destination: "Sapa",
        distance: "320km",
        duration: "5h 45m",
        price: "450.000đ",
        status: "active",
    },
    {
        id: 3,
        origin: "Đà Nẵng",
        destination: "Huế",
        distance: "100km",
        duration: "2h 15m",
        price: "180.000đ",
        status: "inactive",
    },
    {
        id: 4,
        origin: "Cần Thơ",
        destination: "Cà Mau",
        distance: "150km",
        duration: "3h 00m",
        price: "160.000đ",
        status: "active",
    },
    {
        id: 5,
        origin: "Nha Trang",
        destination: "Đà Lạt",
        distance: "140km",
        duration: "3h 30m",
        price: "220.000đ",
        status: "maintenance",
    },
];

export default function RoutesPage() {
    return (
        <ListLayout
            title="Quản lý Tuyến đường"
            description="Xem và quản lý tất cả các tuyến đường xe chạy hiện có."
            icon={Route}
            actions={
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm tuyến mới
                </Button>
            }
            filters={
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm điểm đi, điểm đến..."
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
                        <TableHead>Điểm đi</TableHead>
                        <TableHead>Điểm đến</TableHead>
                        <TableHead>Khoảng cách</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Giá vé cơ bản</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {routes.map((route) => (
                        <TableRow key={route.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">#{route.id}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{route.origin}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{route.destination}</span>
                                </div>
                            </TableCell>
                            <TableCell>{route.distance}</TableCell>
                            <TableCell>{route.duration}</TableCell>
                            <TableCell className="font-semibold text-primary">
                                {route.price}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="secondary"
                                    className={
                                        route.status === "active"
                                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                                            : route.status === "inactive"
                                                ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
                                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                    }
                                >
                                    {route.status === "active"
                                        ? "Hoạt động"
                                        : route.status === "inactive"
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
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                            Xóa tuyến
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
