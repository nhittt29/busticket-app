"use client";

import { useList, useUpdate, useDelete } from "@refinedev/core";
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
import { Users, Search, Filter, Eye, Edit, Lock, Unlock, MoreHorizontal, ArrowLeft, Trash2 } from "lucide-react";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function UserListPage() {
    const router = useRouter();
    const { query, result } = useList<IUser>({
        resource: "users",
        sorters: [
            {
                field: "id",
                order: "asc",
            },
        ],
    }) as any;

    const users = result?.data || [];
    const isLoading = query?.isLoading;

    const { mutate: updateUser } = useUpdate();
    const { mutate: deleteUser } = useDelete();

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

    const handleDelete = (id: number) => {
        deleteUser(
            {
                resource: "users",
                id,
            },
            {
                onSuccess: () => {
                    toast.success("Xóa tài khoản thành công");
                    setIsDeleteDialogOpen(false);
                },
                onError: (error) => {
                    toast.error("Xóa tài khoản thất bại", {
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
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                    <Button onClick={() => router.push("/users/create")}>
                        Thêm Người dùng
                    </Button>
                </div>
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
                            <TableRow
                                key={user.id}
                                className="hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/users/show/${user.id}`)}
                            >
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
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/users/show/${user.id}`); }}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                Xem chi tiết
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/users/edit/${user.id}`); }}>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Chỉnh sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleStatus(user.id, user.isActive); }}>
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
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteId(user.id);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Xóa tài khoản
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Tài khoản sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && handleDelete(deleteId)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xác nhận xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ListLayout>
    );
}
