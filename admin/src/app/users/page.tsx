"use client";

import { useList, useUpdate } from "@refinedev/core";
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
import { Users, Search, Filter, Eye, Edit, Lock, Unlock, MoreHorizontal, ArrowLeft } from "lucide-react";
import { IUser } from "@/interfaces/user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserListPage() {
    const router = useRouter();
    const { query, result } = useList<IUser>({
        resource: "users",
        sorters: [
            {
                field: "createdAt",
                order: "desc",
            },
        ],
    }) as any;

    const users = result?.data || [];
    const isLoading = query?.isLoading;

    const { mutate: updateUser } = useUpdate();

    const handleToggleStatus = (id: number, currentStatus: boolean) => {
        updateUser(
            {
                resource: "users",
                id,
                values: {
                    isActive: !currentStatus,
                },
            },
            {
                onSuccess: () => {
                    toast.success(`Đã ${!currentStatus ? "mở khóa" : "khóa"} tài khoản thành công`);
                },
                onError: (error) => {
                    toast.error("Cập nhật trạng thái thất bại", {
                        description: error.message,
                    });
                },
            }
        );
    };

    const formatDateTime = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <ListLayout
            title="Quản lý Người dùng"
            description="Danh sách tài khoản người dùng và quản trị viên."
            icon={Users}
            actions={
                <Button variant="outline" onClick={() => router.push("/")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            }
            filters={
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo tên, email, số điện thoại..."
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
                        <TableHead>Ngày tham gia</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                Đang tải dữ liệu...
                            </TableCell>
                        </TableRow>
                    ) : users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                Chưa có người dùng nào.
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user: IUser) => (
                            <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium">#{user.id}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.name}</span>
                                            <span className="text-xs text-muted-foreground">{user.gender || "N/A"}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm">{user.email}</span>
                                        <span className="text-xs text-muted-foreground">{user.phone || "Chưa có SĐT"}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role?.name === "ADMIN" ? "default" : "secondary"}>
                                        {user.role?.name || "N/A"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.isActive ? "outline" : "destructive"} className={user.isActive ? "text-green-600 border-green-600 bg-green-50" : ""}>
                                        {user.isActive ? "Hoạt động" : "Đã khóa"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {formatDateTime(user.createdAt)}
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
                                            <DropdownMenuItem onClick={() => router.push(`/users/show/${user.id}`)}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                Xem chi tiết
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push(`/users/edit/${user.id}`)}>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Chỉnh sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.isActive)}>
                                                {user.isActive ? (
                                                    <>
                                                        <Lock className="w-4 h-4 mr-2 text-red-500" />
                                                        <span className="text-red-500">Khóa tài khoản</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Unlock className="w-4 h-4 mr-2 text-green-500" />
                                                        <span className="text-green-500">Mở khóa</span>
                                                    </>
                                                )}
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
