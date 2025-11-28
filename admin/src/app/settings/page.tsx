"use client";

import { ListLayout } from "@/components/common/ListLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, User, Lock, Bell, Globe } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

export default function SettingsPage() {
    return (
        <ListLayout
            title="Cài đặt"
            description="Quản lý cấu hình hệ thống và tài khoản."
            icon={Settings}
        >
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                    <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
                    <TabsTrigger value="account">Tài khoản</TabsTrigger>
                    <TabsTrigger value="notifications">Thông báo</TabsTrigger>
                    <TabsTrigger value="system">Hệ thống</TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-6">
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin cá nhân</CardTitle>
                                <CardDescription>
                                    Cập nhật thông tin hiển thị của bạn trên hệ thống.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Họ và tên</Label>
                                    <Input id="name" defaultValue="Admin User" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" defaultValue="admin@busticket.com" disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input id="phone" defaultValue="0987654321" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>
                                    <Save className="w-4 h-4 mr-2" />
                                    Lưu thay đổi
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="account">
                        <Card>
                            <CardHeader>
                                <CardTitle>Bảo mật tài khoản</CardTitle>
                                <CardDescription>
                                    Đổi mật khẩu và quản lý các phiên đăng nhập.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                                    <Input id="current-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">Mật khẩu mới</Label>
                                    <Input id="new-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                                    <Input id="confirm-password" type="password" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Đổi mật khẩu
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cấu hình thông báo</CardTitle>
                                <CardDescription>
                                    Chọn loại thông báo bạn muốn nhận qua email.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Đặt vé mới</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Nhận email khi có khách hàng đặt vé mới.
                                        </p>
                                    </div>
                                    {/* Switch component would go here */}
                                    <Button variant="outline" size="sm">Bật</Button>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Hủy vé</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Nhận email khi có khách hàng hủy vé.
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">Bật</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="system">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cấu hình hệ thống</CardTitle>
                                <CardDescription>
                                    Các thiết lập chung cho toàn bộ hệ thống đặt vé.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="site-name">Tên website</Label>
                                    <Input id="site-name" defaultValue="BusTicket App" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                                    <Input id="currency" defaultValue="VND" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="destructive">
                                    Bảo trì hệ thống
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </ListLayout>
    );
}
