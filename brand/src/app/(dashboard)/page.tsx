"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TicketIcon, PercentSquare, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get("/stats/my-brand-summary");
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch brand stats", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
            </div>
        );
    }

    if (!stats) {
        return <div className="text-center p-10 text-gray-500">Không thể tải dữ liệu thống kê.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tổng quan Hệ Thống</h1>
                <p className="text-gray-500 mt-1">Xin chào Quản lý, đây là các chỉ số vận hành dành riêng cho hãng của bạn.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng Doanh Thu Hôm Nay</CardTitle>
                        <PercentSquare className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.dayRevenue.toLocaleString()} đ</div>
                        <p className={`text-xs mt-1 flex items-center ${stats.revenueGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {stats.revenueGrowth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                            {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth}% so với hôm qua
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng Số Vé Đã Bán Hôm Nay</CardTitle>
                        <TicketIcon className="h-4 w-4 text-primary/80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.ticketsSoldToday} vé</div>
                        <p className={`text-xs mt-1 flex items-center ${stats.ticketsSoldGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {stats.ticketsSoldGrowth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                            {stats.ticketsSoldGrowth > 0 ? '+' : ''}{stats.ticketsSoldGrowth}% so với hôm qua
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tỷ lệ lấp đầy TB (chuyến bay đi hôm nay)</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Trên tổng {stats.totalSchedulesToday} chuyến xuất phát hôm nay
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-8">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Biểu đồ doanh thu 7 ngày qua</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.weeklyRevenueChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickFormatter={(value) => `${value / 1000}k`} tickLine={false} axisLine={false} tickMargin={8} />
                                <Tooltip
                                    formatter={(value: any) => [`${value.toLocaleString()} ₫`, "Doanh thu"]}
                                    labelFormatter={(label) => `Ngày ${label}`}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Chuyến đi sắp khởi hành</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.upcomingTrips && stats.upcomingTrips.length > 0 ? (
                            <div className="space-y-4">
                                {stats.upcomingTrips.map((trip: any) => (
                                    <div key={trip.id} className="flex items-center p-3 border rounded-lg hover:shadow-sm transition-shadow">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                                            {trip.busPlate?.substring(0, 4) || 'BUS'}
                                        </div>
                                        <div className="ml-4 flex-1 overflow-hidden">
                                            <p className="text-sm font-medium truncate">{trip.route}</p>
                                            <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                                                <span>{format(new Date(trip.departureAt), "HH:mm, dd/MM", { locale: vi })}</span>
                                                <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">Sắp chạy</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg bg-gray-50">
                                <p className="text-gray-500 text-sm">Không có chuyến xe nào sắp chạy.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
