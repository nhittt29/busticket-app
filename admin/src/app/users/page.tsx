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
import { Users, Search, Filter, MoreHorizontal, Mail, Phone } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const users = [
    {
        id: 1,
        name: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        phone: "0901234567",
        role: "customer",
        status: "active",
        lastLogin: "20/11/2025 10:30",
    },
    {
        id: 2,
        name: "Trần Thị B",
        email: "tranthib@example.com",
        phone: "0912345678",
        role: "customer",
        status: "active",
        lastLogin: "19/11/2025 15:45",
    },
    {
        id: 3,
        name: "Admin User",
        email: "admin@busticket.com",
        phone: "0987654321",
        role: "admin",
        status: "active",
        lastLogin: "Just now",
    },
    {
        id: 4,
        name: "Lê Văn C",
        email: "levanc@example.com",
        phone: "0933445566",
        role: "customer",
        status: "blocked",
        lastLogin: "10/10/2025 08:00",
    },
];

export default function UsersPage() {
    return (
        <ListLayout
            title="Quản lý Khách hàng"
            description="Danh sách người dùng và phân quyền hệ thống."
            icon={Users}
            actions={
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Gửi thông báo
                </Button>
            }
            filters={
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm tên, email, số điện thoại..."
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
                        <TableHead>Người dùng</TableHead>
                        <TableHead>Liên hệ</TableHead>
                        <TableHead>Vai trò</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Đăng nhập cuối</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">#{user.id}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-3 h-3 text-muted-foreground" />
                                    {user.phone}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={user.role === "admin" ? "border-primary text-primary" : ""}>
                                    {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="secondary"
                                    className={
                                        user.status === "active"
                                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                                            : "bg-red-100 text-red-700 hover:bg-red-100"
                                    }
                                >
                                    {user.status === "active" ? "Hoạt động" : "Đã khóa"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {user.lastLogin}
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
                                        <DropdownMenuItem>Xem hồ sơ</DropdownMenuItem>
                                        <DropdownMenuItem>Lịch sử đặt vé</DropdownMenuItem>
                                        <DropdownMenuItem>Reset mật khẩu</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                            {user.status === "active" ? "Khóa tài khoản" : "Mở khóa"}
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
