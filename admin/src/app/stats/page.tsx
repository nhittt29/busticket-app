"use client";

import { ListLayout } from "@/components/common/ListLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Ticket, BusFront, ArrowLeft, Trophy, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React from "react";
import api from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

export default function StatsPage() {
    const router = useRouter();
    const [topRoutes, setTopRoutes] = React.useState([]);
    const [brandStats, setBrandStats] = React.useState([]);
    const [statusStats, setStatusStats] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                // Parallel fetch for better performance
                const [topRoutesRes, brandRes, statusRes] = await Promise.all([
                    api.get("/stats/top-routes"),
                    api.get("/stats/brand-stats"),
                    api.get("/stats/status-stats")
                ]);

                setTopRoutes(topRoutesRes.data);
                setBrandStats(brandRes.data);
                setStatusStats(statusRes.data);
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <ListLayout
            title="Thống kê & Báo cáo"
            description="Phân tích chi tiết hiệu quả hoạt động theo các tiêu chí."
            icon={BarChart3}
            actions={
                <Button variant="outline" onClick={() => router.push("/")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            }
        >
            <div className="grid gap-6 md:grid-cols-2 p-6">
                {/* DOANH THU THEO HÃNG XE */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Doanh thu theo Nhà xe</CardTitle>
                        <CardDescription>So sánh hiệu quả kinh doanh các nhà xe</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px] w-full">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground">Đang tải...</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={brandStats} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                                        <XAxis type="number" fontSize={12} tickFormatter={(val) => `${val / 1000000}M`} />
                                        <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Bar dataKey="revenue" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                            {brandStats.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8884d8' : '#82ca9d'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* TRẠNG THÁI VÉ */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Tỷ lệ Trạng thái Vé</CardTitle>
                        <CardDescription>Phân bố các trạng thái đặt vé hiện tại</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground">Đang tải...</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {statusStats.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-1 p-6 pt-0">
                {/* TOP ROUTE - Full width now */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Top Tuyến Đường
                        </CardTitle>
                        <CardDescription>5 tuyến xe có doanh thu cao nhất</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {loading ? (
                                <div>Đang tải...</div>
                            ) : topRoutes.length === 0 ? (
                                <div className="text-muted-foreground text-center py-8">Chưa có dữ liệu</div>
                            ) : (
                                topRoutes.map((route: any, index) => (
                                    <div key={route.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                flex items-center justify-center w-8 h-8 rounded-full font-bold
                                                ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    index === 1 ? 'bg-gray-100 text-gray-700' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'}
                                            `}>
                                                {index + 1}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {route.startPoint} ➝ {route.endPoint}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Đã bán: {route.ticketsSold} vé
                                                </p>
                                            </div>
                                        </div>
                                        <div className="font-bold text-sm text-green-600">
                                            {formatCurrency(route.revenue)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ListLayout>
    );
}
