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
import { Star, Search, Filter, MoreHorizontal, Trash2, ArrowLeft, Eye } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IReview } from "@/interfaces/review";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ReviewListPage() {
    const router = useRouter();

    const hookResult = useList<IReview>({
        resource: "reviews",
        sorters: [
            {
                field: "createdAt",
                order: "asc",
            },
        ],
        meta: {
            include: ["user", "bus"],
        },
    });

    const { query, result } = hookResult as any;
    const reviews = result?.data || (hookResult as any).data?.data || [];
    const isLoading = query?.isLoading || (hookResult as any).isLoading;

    const { mutate: deleteReview } = useDelete();

    const handleDelete = (id: number) => {
        if (confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) {
            deleteReview(
                {
                    resource: "reviews",
                    id,
                },
                {
                    onSuccess: () => {
                        toast.success("Xóa đánh giá thành công");
                    },
                    onError: (error) => {
                        toast.error("Xóa đánh giá thất bại", {
                            description: error.message,
                        });
                    },
                }
            );
        }
    };



    return (
        <ListLayout
            title="Quản lý Đánh giá"
            description="Danh sách các đánh giá từ người dùng."
            icon={Star}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                </div>
            }
            filters={
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo nội dung, người dùng..."
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
                        <TableHead>Người dùng</TableHead>
                        <TableHead>Xe khách</TableHead>
                        <TableHead>Đánh giá</TableHead>
                        <TableHead>Nội dung</TableHead>
                        <TableHead>Phản hồi</TableHead>
                        <TableHead>Ngày tạo</TableHead>
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
                    ) : reviews.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                Chưa có đánh giá nào.
                            </TableCell>
                        </TableRow>
                    ) : (
                        reviews.map((review: IReview) => (
                            <TableRow
                                key={review.id}
                                className="hover:bg-muted/50 transition-colors"
                            >
                                <TableCell className="font-medium">#{review.id}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={review.user?.avatar} />
                                            <AvatarFallback>{review.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{review.user?.name || "Unknown"}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{review.bus?.name || `Bus #${review.busId}`}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center text-amber-500 font-bold">
                                        {review.rating} <Star className="w-3 h-3 ml-1 fill-current" />
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate" title={review.comment}>
                                    {review.comment || "—"}
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                    {review.reply ? (
                                        <div className="text-sm text-green-600 truncate" title={review.reply}>
                                            <span className="font-semibold">Admin:</span> {review.reply}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-xs italic">Chưa trả lời</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
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
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => router.push(`/reviews/show/${review.id}`)}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                Xem chi tiết
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(review.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Xóa đánh giá
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
