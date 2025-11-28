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
import { CalendarClock, Plus, Search, Filter, MoreHorizontal, ArrowRight } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const schedules = [
    {
        id: 1,
        route: "Sài Gòn - Đà Lạt",
        departureTime: "22:00 - 20/11/2025",
        arrivalTime: "04:30 - 21/11/2025",
        bus: "51B-123.45",
        price: "350.000đ",
        seats: "30/34",
        status: "scheduled",
    },
    {
        id: 2,
        route: "Hà Nội - Sapa",
        departureTime: "21:30 - 20/11/2025",
        arrivalTime: "03:15 - 21/11/2025",
        bus: "29B-987.65",
        price: "450.000đ",
        seats: "38/40",
        status: "departed",
    },
    {
        id: 3,
        route: "Đà Nẵng - Huế",
        departureTime: "08:00 - 21/11/2025",
        arrivalTime: "10:15 - 21/11/2025",
        bus: "43B-567.89",
        price: "180.000đ",
        seats: "15/29",
        status: "scheduled",
    },
    {
        id: 4,
        route: "Cần Thơ - Cà Mau",
        departureTime: "07:00 - 21/11/2025",
        arrivalTime: "10:00 - 21/11/2025",
        bus: "65B-321.09",
        price: "160.000đ",
        seats: "22/22",
        status: "completed",
    },
];

export default function SchedulesPage() {
    return (
        <ListLayout
            title="Quản lý Chuyến xe"
            description="Lên lịch và quản lý các chuyến xe khởi hành."
            icon={CalendarClock}
            actions={
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo chuyến mới
                </Button>
            }
            filters={
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo tuyến, biển số..."
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
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Tuyến đường</TableHead>
                        <TableHead>Khởi hành</TableHead>
                        <TableHead>Dự kiến đến</TableHead>
                        <TableHead>Xe</TableHead>
                        <TableHead>Giá vé</TableHead>
                        <TableHead>Chỗ ngồi</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schedules.map((schedule) => (
                        <TableRow key={schedule.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">#{schedule.id}</TableCell>
                            <TableCell>
                                <div className="font-medium flex items-center gap-1">
                                    {schedule.route.split(" - ")[0]}
                                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                    {schedule.route.split(" - ")[1]}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{schedule.departureTime.split(" - ")[0]}</span>
                                    <span className="text-xs text-muted-foreground">{schedule.departureTime.split(" - ")[1]}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{schedule.arrivalTime.split(" - ")[0]}</span>
                                    <span className="text-xs text-muted-foreground">{schedule.arrivalTime.split(" - ")[1]}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-mono text-xs">
                                    {schedule.bus}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-primary">
                                {schedule.price}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                                    {schedule.seats}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="secondary"
                                    className={
                                        schedule.status === "scheduled"
                                            ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                            : schedule.status === "departed"
                                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                                : "bg-green-100 text-green-700 hover:bg-green-100"
                                    }
                                >
                                    {schedule.status === "scheduled"
                                        ? "Sắp chạy"
                                        : schedule.status === "departed"
                                            ? "Đang chạy"
                                            : "Hoàn thành"}
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
                                        <DropdownMenuItem>Xem danh sách khách</DropdownMenuItem>
                                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                            Hủy chuyến
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
