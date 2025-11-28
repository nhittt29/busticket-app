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
import { Calendar, Search, Filter, MoreHorizontal, Plus, Pencil, Trash2, Clock, MapPin, Bus, ArrowLeft } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ISchedule, ScheduleStatus } from "@/interfaces/schedule";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function ScheduleListPage() {
    const router = useRouter();
    // useList returns { query, result } in this version
    const hookResult = useList<ISchedule>({
        resource: "schedules",
        sorters: [
            {
                field: "departureAt",
                order: "desc",
            },
        ],
    });

    // Safely access data
    const { query, result } = hookResult as any;
    const schedules = result?.data || (hookResult as any).data?.data || [];
    const isLoading = query?.isLoading || (hookResult as any).isLoading;

    const { mutate: deleteSchedule } = useDelete();

    const handleDelete = (id: number) => {
        if (confirm("Bạn có chắc chắn muốn xóa chuyến xe này không?")) {
            deleteSchedule(
                {
                    resource: "schedules",
                    id,
                },
                {
                    onSuccess: () => {
                        toast.success("Xóa chuyến xe thành công");
                    },
                    onError: (error) => {
                        toast.error("Xóa chuyến xe thất bại", {
                            description: error.message,
                        });
                    },
                }
            );
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
            return format(new Date(dateString), "HH:mm dd/MM/yyyy", { locale: vi });
        } catch (e) {
            return dateString;
        }
    };

    const getStatusBadge = (status: ScheduleStatus) => {
        switch (status) {
            case ScheduleStatus.UPCOMING:
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Sắp chạy</Badge>;
            case ScheduleStatus.ONGOING:
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Đang chạy</Badge>;
            case ScheduleStatus.COMPLETED:
                return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Hoàn thành</Badge>;
            case ScheduleStatus.CANCELLED:
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Đã hủy</Badge>;
            case ScheduleStatus.FULL:
                return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Hết vé</Badge>;
            case ScheduleStatus.FEW_SEATS:
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Sắp hết</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <ListLayout
            title="Quản lý Chuyến xe"
            description="Danh sách các chuyến xe và lịch trình."
            icon={Calendar}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                    <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        onClick={() => router.push("/schedules/create")}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm chuyến mới
                    </Button>
                </div>
            }
            filters={
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo tuyến đường..."
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
                        <TableHead>Tuyến đường</TableHead>
                        <TableHead>Xe</TableHead>
                        <TableHead>Khởi hành</TableHead>
                        <TableHead>Đến nơi</TableHead>
                        <TableHead>Trạng thái</TableHead>
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
                    ) : schedules.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                Chưa có chuyến xe nào.
                            </TableCell>
                        </TableRow>
                    ) : (
                        schedules.map((schedule: ISchedule) => (
                            <TableRow key={schedule.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium">#{schedule.id}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <MapPin className="w-3 h-3 text-green-500" />
                                            {schedule.route?.startPoint}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="w-3 h-3 text-red-500" />
                                            {schedule.route?.endPoint}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Bus className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium">{schedule.bus?.name}</span>
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {schedule.bus?.licensePlate}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        {formatDateTime(schedule.departureAt)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        {formatDateTime(schedule.arrivalAt)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(schedule.status)}
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
                                            <DropdownMenuItem onClick={() => router.push(`/schedules/edit/${schedule.id}`)}>
                                                <Pencil className="w-4 h-4 mr-2" />
                                                Chỉnh sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(schedule.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Xóa chuyến
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
