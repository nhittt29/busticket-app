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
import { BusFront, Search, Filter, MoreHorizontal, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IBus } from "@/interfaces/bus";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function BusListPage() {
    const router = useRouter();

    // Based on TS error, useList returns { query, result }
    const hookResult = useList<IBus>({
        resource: "buses",
    });

    console.log("BusListPage useList result:", hookResult);

    // Safely access data based on the observed type structure
    // We cast to any to avoid TS blocking if the type definition is fluctuating
    const { query, result } = hookResult as any;

    // Fallback: if result is undefined, try standard data property
    const buses = result?.data || (hookResult as any).data?.data || [];
    const isLoading = query?.isLoading || (hookResult as any).isLoading;

    const { mutate: deleteBus } = useDelete();

    const handleDelete = (id: number) => {
        if (confirm("Bạn có chắc chắn muốn xóa xe này không?")) {
            deleteBus(
                {
                    resource: "buses",
                    id,
                },
                {
                    onSuccess: () => {
                        toast.success("Xóa xe thành công");
                    },
                    onError: (error) => {
                        toast.error("Xóa xe thất bại", {
                            description: error.message,
                        });
                    },
                }
            );
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "MINIVAN": return "bg-blue-100 text-blue-700 hover:bg-blue-100";
            case "COACH": return "bg-green-100 text-green-700 hover:bg-green-100";
            case "LIMOUSINE": return "bg-purple-100 text-purple-700 hover:bg-purple-100";
            case "SLEEPER": return "bg-orange-100 text-orange-700 hover:bg-orange-100";
            case "VIP": return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
            default: return "bg-gray-100 text-gray-700 hover:bg-gray-100";
        }
    };

    return (
        <ListLayout
            title="Quản lý Xe khách"
            description="Danh sách các xe đang hoạt động trong hệ thống."
            icon={BusFront}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                    <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        onClick={() => router.push("/buses/create")}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm xe mới
                    </Button>
                </div>
            }
            filters={
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm tên xe, biển số..."
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
                        <TableHead>Tên xe</TableHead>
                        <TableHead>Biển số</TableHead>
                        <TableHead>Nhà xe</TableHead>
                        <TableHead>Loại xe</TableHead>
                        <TableHead>Số ghế</TableHead>
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
                    ) : buses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                Chưa có xe nào trong hệ thống.
                            </TableCell>
                        </TableRow>
                    ) : (
                        buses.map((bus: IBus) => (
                            <TableRow key={bus.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium">#{bus.id}</TableCell>
                                <TableCell className="font-medium">{bus.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-mono">
                                        {bus.licensePlate}
                                    </Badge>
                                </TableCell>
                                <TableCell>{bus.brand?.name || "N/A"}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={getCategoryColor(bus.category)}
                                    >
                                        {bus.category}
                                    </Badge>
                                </TableCell>
                                <TableCell>{bus.seatCount} ghế</TableCell>
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
                                            <DropdownMenuItem onClick={() => router.push(`/buses/edit/${bus.id}`)}>
                                                <Pencil className="w-4 h-4 mr-2" />
                                                Chỉnh sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(bus.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Xóa xe
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