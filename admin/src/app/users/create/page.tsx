"use client";

import { useForm } from "react-hook-form";
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
import { Users, Save, ArrowLeft } from "lucide-react";
import { useList } from "@refinedev/core";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { useState, useEffect } from "react";

const formSchema = z.object({
    name: z.string().min(1, "Tên không được để trống"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
    phone: z.string().optional(),
    roleId: z.coerce.number(),
    brandId: z.coerce.number().optional().nullable(),
});

export default function UserCreatePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            email: "",
            password: "",
            phone: "",
            roleId: undefined,
            brandId: null,
        },
    });

    // Debug form errors
    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            console.log("Form Errors:", form.formState.errors);
        }
    }, [form.formState.errors]);

    const [brandsData, setBrandsData] = useState<any[]>([]);
    const [isBrandsLoading, setIsBrandsLoading] = useState(true);
    const [rolesData, setRolesData] = useState<any[]>([]);
    const [isRolesLoading, setIsRolesLoading] = useState(true);

    // Fetch brands trực tiếp từ API
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await api.get('/brand');
                const data = res.data?.data || res.data;
                setBrandsData(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch brands", error);
                toast.error("Không thể tải danh sách nhà xe");
            } finally {
                setIsBrandsLoading(false);
            }
        };
        fetchBrands();
    }, []);

    // Fetch roles trực tiếp từ API thay vì dùng qua Refine useList để tránh cache/provider bugs
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await api.get('/roles');
                const data = res.data?.data || res.data; // Xử lý cả 2 trường hợp `{data: []}` hoặc `[]`
                setRolesData(data);
                
                // Set default to PASSENGER if not set
                if (data && !form.getValues("roleId")) {
                    const passengerRole = data.find((r: any) => r.name === "PASSENGER");
                    if (passengerRole) {
                        form.setValue("roleId", passengerRole.id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch roles", error);
                toast.error("Không thể tải danh sách vai trò");
            } finally {
                setIsRolesLoading(false);
            }
        };
        fetchRoles();
    }, [form]);

    const currentRoleId = form.watch("roleId");

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsSubmitting(true);
            await api.post("/auth/admin-register", values);
            toast.success("Tạo người dùng thành công");
            router.push("/users");
        } catch (error: any) {
             toast.error("Tạo người dùng thất bại", {
                 description: error?.response?.data?.message || error.message,
             });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ListLayout
            title="Tạo Người dùng Mới"
            description="Tạo tài khoản (Ví dụ: Hành khách, Quản lý Hệ thống, Quản lý Nhà xe)."
            icon={Users}
            actions={
                <Button variant="outline" onClick={() => router.push("/users")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            }
        >
            <div className="bg-white p-6 rounded-md border max-w-2xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Họ và Tên</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập họ tên" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="example@gmail.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu Khởi tạo</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Nhập mật khẩu" {...field} />
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
                                        <Input placeholder="Nhập số điện thoại" {...field} />
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
                                    <FormLabel>Vai trò (Role)</FormLabel>
                                    <Select 
                                        onValueChange={(val) => field.onChange(Number(val))} 
                                        value={field.value?.toString()}
                                        disabled={isRolesLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn vai trò" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {rolesData?.map((role: any) => (
                                                <SelectItem key={role.id} value={role.id.toString()}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        PASSENGER là khách hàng bình thường, BRAND_MANAGER là quản lý nhà xe, ADMIN là quản trị viên.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {currentRoleId && rolesData?.find((r: any) => Number(r.id) === Number(currentRoleId))?.name === 'BRAND_MANAGER' && (
                            <FormField
                                control={form.control}
                                name="brandId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nhà xe quản lý (Brand)</FormLabel>
                                        <Select 
                                            onValueChange={(val) => field.onChange(Number(val))} 
                                            value={field.value?.toString()}
                                            disabled={isBrandsLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn Nhà xe (Brand) cần gán" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {brandsData?.map((brand: any) => (
                                                    <SelectItem key={brand.id} value={brand.id.toString()}>
                                                        {brand.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Chỉ định tài khoản này thuộc quyền sở hữu của Nhà Xe nào.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="flex justify-end gap-4 border-t pt-4">
                            <Button type="button" variant="outline" onClick={() => router.push("/users")}>
                                Hủy bỏ
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Đang lưu..." : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Tạo Tài khoản
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
