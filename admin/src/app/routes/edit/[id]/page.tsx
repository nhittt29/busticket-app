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
import { Map, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IRoute } from "@/interfaces/route";
import { HttpError, useSelect } from "@refinedev/core";
import { IBrand } from "@/interfaces/brand";

const formSchema = z.object({
    startPoint: z.string().min(1, "Vui lòng nhập điểm đi"),
    endPoint: z.string().min(1, "Vui lòng nhập điểm đến"),
    averageDurationMin: z.coerce.number().min(1, "Thời gian phải lớn hơn 0"),
    lowestPrice: z.coerce.number().min(0, "Giá không hợp lệ"),
    distanceKm: z.coerce.number().min(0, "Khoảng cách không hợp lệ").optional(),
    brandId: z.coerce.number().optional(),
});

export default function RouteEditPage() {
    const router = useRouter();
    const form = useForm<IRoute, HttpError, z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            startPoint: "",
            endPoint: "",
            averageDurationMin: 0,
            lowestPrice: 0,
            distanceKm: 0,
        },
    });

    const { onFinish } = form.refineCore;

    const { options: brandOptions } = useSelect<IBrand>({
        resource: "brands",
        optionLabel: (item) => item.name,
        optionValue: (item) => item.id.toString(),
    });

    return (
        <ListLayout
            title="Chỉnh sửa Tuyến đường"
            description="Cập nhật thông tin tuyến đường."
            icon={Map}
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
                                name="startPoint"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Điểm đi</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ví dụ: Hà Nội" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endPoint"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Điểm đến</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ví dụ: Đà Nẵng" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="averageDurationMin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thời gian di chuyển (phút)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Ví dụ: 480" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lowestPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giá vé thấp nhất (VNĐ)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Ví dụ: 300000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="distanceKm"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Khoảng cách (km)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Ví dụ: 700" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="brandId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nhà xe (Tùy chọn)</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value?.toString()}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn nhà xe" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {brandOptions.map((option) => (
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
