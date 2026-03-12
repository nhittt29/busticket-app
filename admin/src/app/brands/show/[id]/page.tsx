"use client";

import { useShow } from "@refinedev/core";
import { ListLayout } from "@/components/common/ListLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BusFront } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BrandShow() {
    const router = useRouter();
    const { query } = useShow({});
    const { data, isLoading } = query;

    const record = data?.data;

    return (
        <ListLayout
            title="Chi tiết Nhà Xe"
            description="Thông tin chi tiết về đối tác nhà xe."
            icon={BusFront}
            actions={
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            }
        >
            <div className="flex flex-col gap-6 max-w-2xl mt-4 bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex flex-col gap-2 border-b pb-4">
                    <span className="text-sm text-gray-500 font-medium">Tên Nhà Xe</span>
                    <span className="font-semibold text-lg">{record?.name}</span>
                </div>

                <div className="flex flex-col gap-2 border-b pb-4">
                    <span className="text-sm text-gray-500 font-medium">Số Điện Thoại</span>
                    <span>{record?.phoneNumber || "Chưa cập nhật"}</span>
                </div>

                <div className="flex flex-col gap-2 border-b pb-4">
                    <span className="text-sm text-gray-500 font-medium">Địa chỉ Trụ sở</span>
                    <span>{record?.address || "Chưa cập nhật"}</span>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-sm text-gray-500 font-medium">Giới hạn vé mỗi ngày</span>
                    <span className="font-semibold">{record?.dailyTicketLimit || 100}</span>
                </div>
            </div>
        </ListLayout>
    );
}
