"use client";

import { useForm } from "@refinedev/react-hook-form";
import { useUpdate } from "@refinedev/core";
import { ListLayout } from "@/components/common/ListLayout";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
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
import { Users, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useEffect } from "react";

const formSchema = z.object({
    name: z.string().min(1, "Tên không được để trống"),
    phone: z.string().optional(),
    isActive: z.boolean().default(true),
    roleId: z.string().transform((val) => parseInt(val, 10)),
});

export default function UserEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            phone: "",
            isActive: true,
            roleId: 2, // Default to PASSENGER
        },
        refineCoreProps: {
            resource: "users",
            action: "edit",
            id: params.id,
            redirect: false,
            onMutationSuccess: () => {
                toast.success("Cập nhật người dùng thành công");
                router.push("/users");
            },
            onMutationError: (error) => {
                toast.error("Cập nhật thất bại", {
                    description: error?.message,
                });
            },
        },
    });

    const { queryResult } = form.refineCore as any;
    const userData = queryResult?.data?.data;

    useEffect(() => {
        if (userData) {
            form.setValue("name", userData.name);
            form.setValue("phone", userData.phone || "");
            form.setValue("isActive", userData.isActive);
            form.setValue("roleId", userData.roleId?.toString());
        }
    }, [userData, form]);

    const isLoading = form.formState.isSubmitting || queryResult?.isLoading;

    return (
        <ListLayout
            title="Chỉnh sửa Người dùng"
            description="Cập nhật thông tin và quyền hạn người dùng."
            icon={Users}
            actions={
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            }
        >
            <div className="max-w-2xl mx-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(form.saveButtonProps.onClick as any)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Họ và tên</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập họ tên..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số điện thoại</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập số điện thoại..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="roleId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vai trò</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn vai trò" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1">ADMIN</SelectItem>
                                            <SelectItem value="2">PASSENGER</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Admin có toàn quyền quản lý hệ thống.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Trạng thái hoạt động</FormLabel>
                                        <FormDescription>
                                            Tắt để khóa tài khoản người dùng này.
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

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Hủy bỏ
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Đang lưu..." : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Lưu thay đổi
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </ListLayout>
    );
}
