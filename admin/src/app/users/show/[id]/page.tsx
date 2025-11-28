"use client";

import { useOne } from "@refinedev/core";
import { ListLayout } from "@/components/common/ListLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, ArrowLeft, Mail, Phone, Calendar, User as UserIcon, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { IUser } from "@/interfaces/user";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserShowPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { data, isLoading } = useOne<IUser>({
        resource: "users",
        id: params.id,
    }) as any;

    const user = data?.data;

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return "N/A";
        try {
            return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
        } catch (e) {
            return dateString;
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Đang tải thông tin người dùng...</div>;
    }

    if (!user) {
        return <div className="p-8 text-center">Không tìm thấy người dùng.</div>;
    }

    return (
        <ListLayout
            title={`Chi tiết Người dùng #${user.id}`}
            description="Thông tin cá nhân và lịch sử hoạt động."
            icon={Users}
            actions={
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-primary" />
                                Thông tin Cá nhân
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="w-24 h-24 border-4 border-muted">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-2xl font-bold">{user.name}</h3>
                                    <p className="text-muted-foreground">UID: {user.uid}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant={user.isActive ? "outline" : "destructive"} className={user.isActive ? "text-green-600 border-green-600 bg-green-50" : ""}>
                                            {user.isActive ? "Hoạt động" : "Đã khóa"}
                                        </Badge>
                                        <Badge variant="secondary">{user.role?.name}</Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <div className="flex items-center text-muted-foreground text-sm gap-2">
                                        <Mail className="w-4 h-4" /> Email
                                    </div>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center text-muted-foreground text-sm gap-2">
                                        <Phone className="w-4 h-4" /> Số điện thoại
                                    </div>
                                    <p className="font-medium">{user.phone || "Chưa cập nhật"}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center text-muted-foreground text-sm gap-2">
                                        <UserIcon className="w-4 h-4" /> Giới tính
                                    </div>
                                    <p className="font-medium">{user.gender || "Chưa cập nhật"}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center text-muted-foreground text-sm gap-2">
                                        <Calendar className="w-4 h-4" /> Ngày sinh
                                    </div>
                                    <p className="font-medium">{formatDateTime(user.dob)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ticket History Placeholder - Can be expanded later */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lịch sử Đặt vé</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-center py-8">
                                Chức năng xem lịch sử vé đang được phát triển.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Bảo mật & Quyền
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Vai trò hiện tại</p>
                                <p className="font-medium">{user.role?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Ngày tạo tài khoản</p>
                                <p className="font-medium">{formatDateTime(user.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Cập nhật lần cuối</p>
                                <p className="font-medium">{formatDateTime(user.updatedAt)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ListLayout>
    );
}
