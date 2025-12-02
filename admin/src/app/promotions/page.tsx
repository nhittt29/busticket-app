"use client";

import { useList, useDelete, useNavigation } from "@refinedev/core";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, ArrowLeft, Ticket } from "lucide-react";
import { IPromotion } from "@/interfaces/promotion";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ListLayout } from "@/components/common/ListLayout";
import { useRouter } from "next/navigation";

export default function PromotionListPage() {
    const router = useRouter();
    const { query, result } = useList<IPromotion>({
        resource: "promotions",
        meta: {
            resource: "promotions/admin",
        },
    });
    const { mutate: deleteMutation } = useDelete();
    const { edit, create } = useNavigation();

    const isLoading = query?.isLoading;
    const promotions = result?.data || [];

    const handleDelete = (id: number) => {
        deleteMutation({
            resource: "promotions",
            id,
        });
    };

    return (
        <ListLayout
            title="Quản lý Khuyến mãi"
            description="Danh sách các chương trình khuyến mãi và mã giảm giá."
            icon={Ticket}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                    <Button onClick={() => router.push("/promotions/create")}>
                        <Plus className="mr-2 h-4 w-4" /> Thêm mới
                    </Button>
                </div>
            }
        >
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Mã Code</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Loại giảm</TableHead>
                        <TableHead>Giá trị</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                Đang tải...
                            </TableCell>
                        </TableRow>
                    ) : promotions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                Chưa có khuyến mãi nào.
                            </TableCell>
                        </TableRow>
                    ) : (
                        promotions.map((item: IPromotion) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell className="font-medium">{item.code}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {item.discountType === "PERCENTAGE" ? "%" : "VNĐ"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {item.discountType === "PERCENTAGE"
                                        ? `${item.discountValue}%`
                                        : `${item.discountValue.toLocaleString("vi-VN")}đ`}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={item.isActive ? "default" : "destructive"}>
                                        {item.isActive ? "Hoạt động" : "Vô hiệu"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="text-xs text-muted-foreground">
                                        {dayjs(item.startDate).format("DD/MM/YYYY")} -{" "}
                                        {dayjs(item.endDate).format("DD/MM/YYYY")}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => edit("promotions", item.id)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Hành động này không thể hoàn tác. Khuyến mãi này sẽ bị xóa vĩnh viễn.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(item.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Xóa
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </ListLayout>
    );
}
