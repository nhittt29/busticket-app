"use client";

import { useForm } from "@refinedev/react-hook-form";
import { useSelect, HttpError } from "@refinedev/core";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Save } from "lucide-react";
import { IBus } from "@/interfaces/bus";

const formSchema = z.object({
    name: z.string().min(1, "Tên xe là bắt buộc"),
    licensePlate: z.string().min(1, "Biển số là bắt buộc"),
    seatCount: z.coerce.number().min(1, "Số ghế phải lớn hơn 0"),
    category: z.enum(["MINIVAN", "COACH", "LIMOUSINE", "SLEEPER", "VIP"]),
    seatType: z.enum(["SEAT", "BERTH"]),
    berthType: z.enum(["SINGLE", "DOUBLE"]).optional(),
    brandId: z.coerce.number().min(1, "Vui lòng chọn nhà xe"),
    price: z.coerce.number().min(0, "Giá vé không hợp lệ"),
});

export default function BusCreatePage() {
    const router = useRouter();
    const form = useForm<IBus, HttpError, z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            licensePlate: "",
            seatCount: 0,
            category: "COACH",
            seatType: "SEAT",
            price: 0,
            brandId: 0,
        },
        refineCoreProps: {
            resource: "buses",
            redirect: "list",
            onMutationSuccess: () => {
                toast.success("Tạo xe thành công");
            },
            onMutationError: (error) => {
                toast.error("Tạo xe thất bại", {
                    description: error?.message,
                });
            },
        },
    });

    const { onFinish } = form.refineCore;

    const { options: brandOptions } = useSelect({
        resource: "brands",
        optionLabel: "name",
        optionValue: "id",
    });

    const seatType = form.watch("seatType");

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Thêm xe mới</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Thông tin xe</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onFinish)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tên xe</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ví dụ: Xe 01 - Giường nằm" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="licensePlate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Biển số xe</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ví dụ: 51B-123.45" {...field} />
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
                                            <FormLabel>Nhà xe</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value?.toString()}
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

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Loại xe</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn loại xe" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="MINIVAN">Minivan (Ghế ngồi nhỏ)</SelectItem>
                                                    <SelectItem value="COACH">Coach (Xe khách thường)</SelectItem>
                                                    <SelectItem value="LIMOUSINE">Limousine (Cao cấp)</SelectItem>
                                                    <SelectItem value="SLEEPER">Sleeper (Giường nằm)</SelectItem>
                                                    <SelectItem value="VIP">VIP (Phòng riêng)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="seatCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số lượng ghế/giường</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giá vé mặc định (VNĐ)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Nhập giá vé để khởi tạo ghế" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Giá này sẽ được gán cho tất cả các ghế khi tạo mới.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="seatType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kiểu ghế</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn kiểu ghế" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="SEAT">Ghế ngồi</SelectItem>
                                                    <SelectItem value="BERTH">Giường nằm</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {seatType === "BERTH" && (
                                    <FormField
                                        control={form.control}
                                        name="berthType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Loại giường</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Chọn loại giường" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="SINGLE">Giường đơn</SelectItem>
                                                        <SelectItem value="DOUBLE">Giường đôi</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Hủy bỏ
                                </Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    <Save className="w-4 h-4 mr-2" />
                                    {form.formState.isSubmitting ? "Đang lưu..." : "Lưu thông tin"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
