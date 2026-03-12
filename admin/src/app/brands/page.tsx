"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BusFront, Eye, Pencil, Trash2 } from "lucide-react";
import { ListLayout } from "@/components/common/ListLayout";
import { useRouter } from "next/navigation";
import { useDelete, useList } from "@refinedev/core";
import { toast } from "sonner";

export default function BrandList() {
    const router = useRouter();
    const { mutate } = useDelete();
    
    const { data: tableData, isLoading } = useList({
        resource: "brands",
    }) as any;

    const handleDelete = (id: string | number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa nhà xe này?")) {
            mutate({
                resource: "brands",
                id,
                mutationMode: "optimistic",
            }, {
                onSuccess: () => toast.success("Xóa nhà xe thành công"),
                onError: (error) => toast.error("Có lỗi xảy ra: " + error.message)
            });
        }
    }

    return (
        <ListLayout
            title="Quản lý Nhà Xe (Brands)"
            description="Tạo và quản lý danh sách nhà xe đăng nhập trên hệ thống."
            icon={BusFront}
            actions={
                <Button onClick={() => router.push("/brands/create")}>
                    Thêm Nhà Xe
                </Button>
            }
        >
            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Tên Nhà Xe</TableHead>
                            <TableHead>SĐT</TableHead>
                            <TableHead>Địa chỉ</TableHead>
                            <TableHead>Giới hạn vé/ngày</TableHead>
                            <TableHead>Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Đang tải dữ liệu...</TableCell>
                            </TableRow>
                        ) : tableData?.data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Chưa có nhà xe nào.</TableCell>
                            </TableRow>
                        ) : (
                            tableData?.data?.map((brand: any) => (
                                <TableRow key={brand.id}>
                                    <TableCell>{brand.id}</TableCell>
                                    <TableCell><span className="font-semibold text-blue-700">{brand.name}</span></TableCell>
                                    <TableCell>{brand.phoneNumber || "-"}</TableCell>
                                    <TableCell>
                                        <span className="line-clamp-1 truncate max-w-[200px]" title={brand.address}>{brand.address || "-"}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{brand.dailyTicketLimit}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                             <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => router.push(`/brands/show/${brand.id}`)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => router.push(`/brands/edit/${brand.id}`)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleDelete(brand.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </ListLayout>
    );
}
