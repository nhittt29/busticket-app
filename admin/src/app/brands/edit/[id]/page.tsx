"use client";

import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListLayout } from "@/components/common/ListLayout";
import { Save, ArrowLeft, BusFront } from "lucide-react";
import { useRouter } from "next/navigation";

const schema = z.object({
    name: z.string().min(2, "Tên nhà xe phải có ít nhất 2 ký tự"),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    dailyTicketLimit: z.preprocess((val) => Number(val), z.number().min(0).default(100)),
});

export default function BrandEdit() {
    const router = useRouter();
    const {
        saveButtonProps,
        refineCore: { formLoading, query },
        register,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const brandData = query?.data?.data;

    return (
        <ListLayout
            title={`Chỉnh sửa: ${brandData?.name || ''}`}
            description="Cập nhật thông tin chi tiết của Nhà xe."
            icon={BusFront}
            actions={
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            }
        >
            <div className="max-w-2xl mx-auto">
                 <form {...saveButtonProps} onSubmit={(e) => {
                     e.preventDefault();
                     saveButtonProps.onClick(e as any);
                 }} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <FormLabel>Tên Nhà Xe</FormLabel>
                            <Input
                                {...register("name")}
                                placeholder="Nhập tên thương hiệu..."
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && <FormMessage>{errors.name.message as string}</FormMessage>}
                        </div>

                        <div className="space-y-2">
                            <FormLabel>Số điện thoại liên hệ</FormLabel>
                            <Input
                                {...register("phoneNumber")}
                                placeholder="Nhập số điện thoại..."
                            />
                        </div>

                        <div className="space-y-2">
                            <FormLabel>Địa chỉ Trụ sở</FormLabel>
                            <Input
                                {...register("address")}
                                placeholder="Nhập địa chỉ..."
                            />
                        </div>

                        <div className="space-y-2">
                            <FormLabel>Giới hạn vé / ngày (Mặc định: 100)</FormLabel>
                            <Input
                                type="number"
                                {...register("dailyTicketLimit")}
                                placeholder="100"
                            />
                            {errors.dailyTicketLimit && <FormMessage>{errors.dailyTicketLimit.message as string}</FormMessage>}
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Hủy bỏ
                            </Button>
                            <Button type="submit" disabled={formLoading}>
                                {formLoading ? "Đang lưu..." : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Lưu thay đổi
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </ListLayout>
    );
}
