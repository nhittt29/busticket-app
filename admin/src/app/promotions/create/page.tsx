"use client";

import { useForm } from "@refinedev/react-hook-form";
import { useNavigation } from "@refinedev/core";
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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Ticket, Percent, Calendar, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-time-picker";

const formSchema = z.object({
    code: z.string().min(1, "Vui lòng nhập mã code"),
    description: z.string().min(1, "Vui lòng nhập mô tả"),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.coerce.number().min(0, "Giá trị phải lớn hơn 0"),
    minOrderValue: z.coerce.number().min(0).default(0),
    maxDiscount: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
    ),
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
    usageLimit: z.coerce.number().min(0).default(0),
    isActive: z.boolean().default(true),
});

export default function PromotionCreatePage() {
    const { list } = useNavigation();
    const form = useForm({
        resource: "promotions",
        action: "create",
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            code: "",
            description: "",
            discountType: "PERCENTAGE",
            discountValue: 0,
            maxDiscount: "",
            minOrderValue: 0,
            startDate: "",
            endDate: "",
            usageLimit: 0,
            isActive: true,
        },
        redirect: "list",
        mutationOptions: {
            onError: (error: any) => {
                console.error("❌ [Server Error] Lỗi khi lưu khuyến mãi:", error);
                alert(`Lỗi hệ thống: ${error?.message || JSON.stringify(error)}`);
            },
        },
    } as any) as any;

    const { onFinish, handleSubmit, control, setValue, reset, refineCore } = form;
    // Fallback if onFinish is not at top level (sometimes it's in refineCore)
    const submitHandler = onFinish || refineCore?.onFinish;

    const onInvalid = (errors: any) => {
        console.group("❌ [Validation Error] Lỗi kiểm tra dữ liệu:");
        Object.entries(errors).forEach(([key, value]: [string, any]) => {
            console.error(`- Trường '${key}':`, value?.message);
        });
        console.groupEnd();
        alert("Vui lòng kiểm tra lại các trường báo đỏ!");
    };

    const fillSampleData = () => {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        reset({
            code: "CHAOHE2025",
            description: "Giảm 15% cho tất cả chuyến xe mùa hè",
            isActive: true,
            discountType: "PERCENTAGE",
            discountValue: 15,
            maxDiscount: 50000,
            minOrderValue: 100000,
            usageLimit: 500,
            startDate: today.toISOString(),
            endDate: nextWeek.toISOString(),
        });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => list("promotions")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tạo khuyến mãi mới</h1>
                        <p className="text-muted-foreground text-sm">Thiết lập chương trình khuyến mãi cho khách hàng</p>
                    </div>
                </div>
                <Button variant="outline" onClick={fillSampleData}>
                    Điền dữ liệu mẫu
                </Button>
            </div>

            <Form {...form}>
                <form onSubmit={(e) => {
                    console.log("🚀 [DEBUG] Form submitting...");
                    handleSubmit((values: any) => {
                        console.log("✅ [DEBUG] Validated Values:", values);
                        submitHandler(values);
                    }, (errors: any) => {
                        console.error("❌ [DEBUG] Validation Failed:", errors);
                        onInvalid(errors);
                    })(e);
                }} className="space-y-8">

                    {/* 1. Thông tin chung */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Ticket className="w-5 h-5 text-primary" />
                                Thông tin cơ bản
                            </CardTitle>
                            <CardDescription>
                                Tên mã, mô tả và trạng thái hoạt động
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mã khuyến mãi (Code) <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="VD: TET2025" {...field} className="uppercase font-medium" />
                                            </FormControl>
                                            <FormDescription>Mã khách hàng sẽ nhập khi thanh toán.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Kích hoạt ngay</FormLabel>
                                                <FormDescription>
                                                    Mã sẽ có hiệu lực ngay sau khi tạo.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mô tả chương trình <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: Giảm giá 10% cho khách hàng mới..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* 2. Mức giảm giá */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Percent className="w-5 h-5 text-primary" />
                                Mức giảm giá
                            </CardTitle>
                            <CardDescription>
                                Cấu hình số tiền hoặc phần trăm được giảm
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid md:grid-cols-3 gap-6">
                                <FormField
                                    control={control}
                                    name="discountType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Loại giảm giá</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn loại" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="PERCENTAGE">Theo phần trăm (%)</SelectItem>
                                                    <SelectItem value="FIXED">Số tiền cố định (VNĐ)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="discountValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giá trị giảm <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormDescription>Nhập số % hoặc số tiền VNĐ.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="maxDiscount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giảm tối đa (VNĐ)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Không giới hạn" {...field} />
                                            </FormControl>
                                            <FormDescription>Chỉ áp dụng cho loại giảm theo %.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Điều kiện & Thời gian */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Settings className="w-5 h-5 text-primary" />
                                Điều kiện & Thời gian
                            </CardTitle>
                            <CardDescription>
                                Thiết lập các ràng buộc áp dụng mã
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={control}
                                    name="minOrderValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Đơn hàng tối thiểu (VNĐ)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormDescription>Giá trị đơn hàng tối thiểu để dùng mã.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="usageLimit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giới hạn lượt dùng</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormDescription>Nhập 0 nếu không giới hạn số lượng.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Ngày bắt đầu <span className="text-red-500">*</span></FormLabel>
                                            <DateTimePicker
                                                value={field.value}
                                                onChange={(date) => field.onChange(date.toISOString())}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Ngày kết thúc <span className="text-red-500">*</span></FormLabel>
                                            <DateTimePicker
                                                value={field.value}
                                                onChange={(date) => field.onChange(date.toISOString())}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" size="lg" onClick={() => list("promotions")}>
                            Hủy bỏ
                        </Button>
                        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Đang lưu..." : "Lưu khuyến mãi"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
