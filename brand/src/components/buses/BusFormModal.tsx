"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Bus, CreateBusDto } from "@/interfaces/bus.interface";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
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
import { useAuthStore } from "@/store/authStore";

const formSchema = z.object({
    plateNumber: z.string().min(1, "Vui lòng nhập Biển số xe"),
    busType: z.enum(["LIMOUSINE", "SLEEPER", "SEAT"]),
    totalSeats: z.number().min(1, "Số ghế phải lớn hơn 0"),
});

interface BusFormModalProps {
    isOpen: boolean;
    onChange: (open: boolean) => void;
    onSave: (data: CreateBusDto) => void;
    initialData: Bus | null;
}

export function BusFormModal({ isOpen, onChange, onSave, initialData }: BusFormModalProps) {
    const { user } = useAuthStore();
    const title = initialData ? "Chỉnh sửa Thông tin xe" : "Thêm Xe mới";
    const description = initialData ? "Cập nhật các thông tin cơ bản của phương tiện." : "Khai báo xe mới vào Đội xe của bạn.";

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            plateNumber: "",
            busType: "SLEEPER",
            totalSeats: 34,
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                plateNumber: initialData.plateNumber,
                busType: initialData.busType,
                totalSeats: initialData.totalSeats,
            });
        } else {
            form.reset({
                plateNumber: "",
                busType: "SLEEPER",
                totalSeats: 34,
            });
        }
    }, [initialData, form, isOpen]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onSave({
            ...values,
            brandId: user?.brand?.id || user?.brandId || 0, // Fallback if relational data is structured differently
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="plateNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Biển số xe</FormLabel>
                                    <FormControl>
                                        <Input placeholder="VD: 51B-123.45" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="busType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Loại Xe</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn loại xe" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="LIMOUSINE">VIP Limousine</SelectItem>
                                                <SelectItem value="SLEEPER">Giường Nằm</SelectItem>
                                                <SelectItem value="SEAT">Ghế Ngồi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="totalSeats"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tổng số ghế</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => onChange(false)}>
                                Hủy bỏ
                            </Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">Lưu thông tin</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
