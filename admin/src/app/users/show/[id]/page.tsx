"use client";

import { useOne } from "@refinedev/core";
import { ListLayout } from "@/components/common/ListLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, ArrowLeft, Mail, Phone, Calendar, User as UserIcon, Shield, BusFront, MapPin, Ticket, ShieldCheck, Activity } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { IUser } from "@/interfaces/user";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserShowPage() {
    const router = useRouter();
    const { id } = useParams();
    
    const { query } = useOne<IUser>({
        resource: "users",
        id: id as string,
    });

    const { data, isLoading } = query;

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
                    {user.role?.name === "BRAND_MANAGER" && user.brand && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BusFront className="w-5 h-5 text-primary" />
                                    Nhà xe Quản lý
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16 border bg-muted">
                                        <AvatarImage src={user.brand.image} alt={user.brand.name} className="object-cover" />
                                        <AvatarFallback><BusFront className="w-6 h-6 text-muted-foreground" /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-bold text-lg">{user.brand.name}</h4>
                                        <Badge variant="secondary">ID: #{user.brand.id}</Badge>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    {user.brand.phoneNumber && (
                                        <div className="flex items-start text-sm gap-2">
                                            <Phone className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                                            <span>{user.brand.phoneNumber}</span>
                                        </div>
                                    )}
                                    {user.brand.address && (
                                        <div className="flex items-start text-sm gap-2">
                                            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                                            <span className="line-clamp-2">{user.brand.address}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {user.role?.name === "PASSENGER" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Hoạt động Hành khách
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Ticket className="w-4 h-4" />
                                        <span className="text-sm">Tổng vé đã đặt</span>
                                    </div>
                                    <Badge variant="secondary" className="text-base font-bold">
                                        {user.tickets?.length || 0} vé
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    Số liệu dựa trên lịch sử giao dịch.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {user.role?.name === "ADMIN" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    Quyền Quản trị
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 bg-primary/10 rounded-lg flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-sm">Toàn quyền hệ thống</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Quản trị viên có quyền truy cập, chỉnh sửa và quản lý mọi module trên hệ thống BusTicket.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

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
