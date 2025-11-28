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
import { ISchedule, ScheduleStatus } from "@/interfaces/schedule";
import { HttpError, useSelect } from "@refinedev/core";
import { IBus } from "@/interfaces/bus";
import { IRoute } from "@/interfaces/route";
import { useEffect } from "react";

const formSchema = z.object({
    routeId: z.coerce.number().min(1, "Vui lòng chọn tuyến đường"),
    busId: z.coerce.number().min(1, "Vui lòng chọn xe"),
    departureAt: z.string().min(1, "Vui lòng chọn thời gian khởi hành"),
    arrivalAt: z.string().min(1, "Vui lòng chọn thời gian đến"),
    status: z.nativeEnum(ScheduleStatus),
});

export default function ScheduleEditPage() {
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

    const { onFinish, queryResult } = form.refineCore as any;
    const scheduleData = queryResult?.data?.data;

    // Format datetime for input when data is loaded
    useEffect(() => {
        if (scheduleData) {
            const formatForInput = (dateString: string) => {
                if (!dateString) return "";
                const date = new Date(dateString);
                // Adjust to local ISO string for datetime-local input
                const offset = date.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
                return localISOTime;
            };

            form.setValue("departureAt", formatForInput(scheduleData.departureAt));
            form.setValue("arrivalAt", formatForInput(scheduleData.arrivalAt));
        }
    }, [scheduleData, form]);

    const { options: routeOptions } = useSelect<IRoute>({
        resource: "routes",
        optionLabel: (item) => `${item.startPoint} - ${item.endPoint}`,
        optionValue: (item) => item.id.toString(),
        defaultValue: scheduleData?.routeId,
    });

    const { options: busOptions } = useSelect<IBus>({
        resource: "buses",
        optionLabel: (item) => `${item.name} (${item.licensePlate})`,
        optionValue: (item) => item.id.toString(),
        defaultValue: scheduleData?.busId,
    });

    return (
        <ListLayout
            title="Chỉnh sửa Chuyến xe"
            description="Cập nhật thông tin lịch trình."
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
                                            value={field.value?.toString()}
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
                                            value={field.value?.toString()}
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
                                            value={field.value}
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
                                Lưu thay đổi
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </ListLayout>
    );
}
