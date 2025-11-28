"use client";

import { useForm } from "@refinedev/react-hook-form";
import { ListLayout } from "@/components/common/ListLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ISchedule, IScheduleCreate, ScheduleStatus } from "@/interfaces/schedule";
import { HttpError, useSelect } from "@refinedev/core";
import { IBus } from "@/interfaces/bus";
import { IRoute } from "@/interfaces/route";

const formSchema = z.object({
    routeId: z.coerce.number().min(1, "Vui lòng chọn tuyến đường"),
    busId: z.coerce.number().min(1, "Vui lòng chọn xe"),
    departureAt: z.string().min(1, "Vui lòng chọn thời gian khởi hành"),
    arrivalAt: z.string().min(1, "Vui lòng chọn thời gian đến"),
    status: z.nativeEnum(ScheduleStatus),
});

export default function ScheduleCreatePage() {
    const router = useRouter();
    const form = useForm<ISchedule, HttpError, z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            routeId: 0,
            busId: 0,
            departureAt: "",
            arrivalAt: "",
            status: ScheduleStatus.UPCOMING,
        },
    });

    const { onFinish } = form.refineCore;

    const { options: routeOptions } = useSelect<IRoute>({
        resource: "routes",
        optionLabel: (item) => `${item.startPoint} - ${item.endPoint}`,
        optionValue: (item) => item.id.toString(),
    });

    const { options: busOptions } = useSelect<IBus>({
        resource: "buses",
        optionLabel: (item) => `${item.name} (${item.licensePlate})`,
        optionValue: (item) => item.id.toString(),
    });

    return (
        <ListLayout
            title="Thêm Chuyến xe mới"
            description="Tạo lịch trình chạy xe mới."
            icon={Calendar}
            actions={
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            }
        >
            <div className="max-w-2xl mx-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onFinish)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="routeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tuyến đường</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn tuyến đường" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {routeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value.toString()}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="busId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Xe</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn xe" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {busOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value.toString()}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="departureAt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thời gian khởi hành</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="arrivalAt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thời gian đến</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Trạng thái</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn trạng thái" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={ScheduleStatus.UPCOMING}>Sắp chạy</SelectItem>
                                                <SelectItem value={ScheduleStatus.ONGOING}>Đang chạy</SelectItem>
                                                <SelectItem value={ScheduleStatus.COMPLETED}>Hoàn thành</SelectItem>
                                                <SelectItem value={ScheduleStatus.CANCELLED}>Đã hủy</SelectItem>
                                                <SelectItem value={ScheduleStatus.FULL}>Hết vé</SelectItem>
                                                <SelectItem value={ScheduleStatus.FEW_SEATS}>Sắp hết</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" className="bg-primary hover:bg-primary/90">
                                <Save className="w-4 h-4 mr-2" />
                                Lưu chuyến xe
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </ListLayout>
    );
}
