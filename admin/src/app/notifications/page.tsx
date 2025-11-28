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
import { BellRing, Search, Filter, MoreHorizontal, Send, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notifications = [
    {
        id: 1,
        title: "Bảo trì hệ thống",
        message: "Hệ thống sẽ bảo trì vào lúc 00:00 ngày 25/11/2025.",
        type: "system",
        status: "sent",
        date: "20/11/2025 10:00",
        recipient: "All Users",
    },
    {
        id: 2,
        title: "Khuyến mãi tháng 12",
        message: "Giảm giá 10% cho tất cả các vé đặt trước ngày 01/12.",
        type: "marketing",
        status: "scheduled",
        date: "25/11/2025 08:00",
        recipient: "Customers",
    },
    {
        id: 3,
        title: "Cập nhật chính sách",
        message: "Thay đổi chính sách hoàn hủy vé từ ngày 01/01/2026.",
        type: "policy",
        status: "draft",
        date: "-",
        recipient: "All Users",
    },
];

export default function NotificationsPage() {
    const router = useRouter();
    return (
        <ListLayout
            title="Thông báo"
            description="Quản lý và gửi thông báo đến người dùng."
            icon={BellRing}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                        <Send className="w-4 h-4 mr-2" />
                        Tạo thông báo mới
                    </Button>
                </div>
            }
            filters={
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm tiêu đề thông báo..."
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
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Tiêu đề</TableHead>
                        <TableHead>Nội dung</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Đối tượng</TableHead>
                        <TableHead>Thời gian gửi</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {notifications.map((notification) => (
                        <TableRow key={notification.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">#{notification.id}</TableCell>
                            <TableCell className="font-medium">{notification.title}</TableCell>
                            <TableCell className="max-w-[300px] truncate text-muted-foreground">
                                {notification.message}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">
                                    {notification.type}
                                </Badge>
                            </TableCell>
                            <TableCell>{notification.recipient}</TableCell>
                            <TableCell>{notification.date}</TableCell>
                            <TableCell>
                                <Badge
                                    variant="secondary"
                                    className={
                                        notification.status === "sent"
                                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                                            : notification.status === "scheduled"
                                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                                    }
                                >
                                    {notification.status === "sent"
                                        ? "Đã gửi"
                                        : notification.status === "scheduled"
                                            ? "Đã lên lịch"
                                            : "Nháp"}
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
                                            Xóa
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
