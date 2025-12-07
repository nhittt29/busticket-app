"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, BusFront, Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { useList, Authenticated } from "@refinedev/core";
import { ITicket, TicketStatus } from "@/interfaces/ticket";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface IDashboardStats {
    revenue: number;
    revenueGrowth: number;
    ticketsSold: number;
    newCustomers: number;
    activeTrips: number;
}

interface ITicketTrend {
    date: string;
    success: number;
    cancelled: number;
}

interface IRouteRevenue {
    name: string;
    value: number;
}

interface IOccupancyStats {
    occupancyRate: number;
    totalCapacity: number;
    totalSold: number;
    chartData: { name: string; value: number; fill: string }[];
}

export default function Dashboard() {
    const router = useRouter();
    const [bookings, setBookings] = useState<ITicket[]>([]);
    const [stats, setStats] = useState<IDashboardStats>({
        revenue: 0,
        revenueGrowth: 0,
        ticketsSold: 0,
        newCustomers: 0,
        activeTrips: 0,
    });
    const [ticketTrend, setTicketTrend] = useState<ITicketTrend[]>([]);
    const [routeTreemap, setRouteTreemap] = useState<IRouteRevenue[]>([]);
    const [occupancyStats, setOccupancyStats] = useState<IOccupancyStats | null>(null);

    // Optimized List Fetching: ONLY recent sales (5 items)
    // Removed massive fetching of all tickets/buses/users for client-side stats
    const { result: ticketListResult } = useList<ITicket>({
        resource: "tickets",
        pagination: { pageSize: 5 }, // Only need recent 5 for activity (if not using bookings endpoint)
        sorters: [{ field: "createdAt", order: "desc" }],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch ALL dashboard stats from optimized backend endpoints
                const [summaryRes, trendRes, treemapRes, bookingsRes, occupancyRes] = await Promise.all([
                    api.get('/stats/summary'),
                    api.get('/stats/ticket-trend'),
                    api.get('/stats/route-treemap'),
                    api.get('/tickets/bookings'),
                    api.get('/stats/occupancy-rate'),
                ]);

                setStats(summaryRes.data);
                setTicketTrend(trendRes.data);
                setRouteTreemap(treemapRes.data);
                setBookings(bookingsRes.data);
                setOccupancyStats(occupancyRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            }
        };
        fetchData();
    }, []);

    // Recent transaction list from API (or fallback to useList if needed)
    // We prioritize 'bookings' from API if available, else 'tickets' from useList
    const recentDisplayList = bookings.length > 0 ? bookings.slice(0, 5) : (ticketListResult?.data || []).slice(0, 5);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        return format(date, "dd/MM/yyyy", { locale: vi });
    };

    return (
        <Authenticated key="dashboard">
            <div className="space-y-8 p-2">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-[#2c3e50]">Tổng quan</h2>
                        <p className="text-muted-foreground">Chào mừng quay lại, đây là tình hình kinh doanh hôm nay.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
                        <span className="text-sm font-medium text-muted-foreground px-2">
                            {format(new Date(), "MMMM, yyyy", { locale: vi })}
                        </span>
                    </div>
                </div>

                {/* Stats Grid - Using Backend Data */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card
                        className="border-0 shadow-sm bg-[#96DFD8]/10 hover:bg-[#96DFD8]/20 transition-colors cursor-pointer"
                        onClick={() => router.push('/tickets')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-[#2c3e50]">Tổng doanh thu</CardTitle>
                            <div className="p-2 bg-[#96DFD8] rounded-full text-white">
                                <DollarSign className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#2c3e50]">{formatCurrency(stats.revenue)}</div>
                            <p className="text-xs text-[#96DFD8] font-semibold flex items-center mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" /> {stats.revenueGrowth > 0 ? "+" : ""}{stats.revenueGrowth}% so với tháng trước
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="border-0 shadow-sm bg-[#85D4BE]/10 hover:bg-[#85D4BE]/20 transition-colors cursor-pointer"
                        onClick={() => router.push('/tickets')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-[#2c3e50]">Vé đã bán</CardTitle>
                            <div className="p-2 bg-[#85D4BE] rounded-full text-white">
                                <Ticket className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#2c3e50]">{stats.ticketsSold}</div>
                            <p className="text-xs text-[#85D4BE] font-semibold flex items-center mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" /> Vé hiệu lực
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="border-0 shadow-sm bg-[#AEE6CB]/10 hover:bg-[#AEE6CB]/20 transition-colors cursor-pointer"
                        onClick={() => router.push('/buses')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-[#2c3e50]">Chuyến xe hoạt động</CardTitle>
                            <div className="p-2 bg-[#AEE6CB] rounded-full text-white">
                                <BusFront className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#2c3e50]">{stats.activeTrips}</div>
                            <p className="text-xs text-[#AEE6CB] font-semibold flex items-center mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" /> Chuyến sắp chạy
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="border-0 shadow-sm bg-[#CDEEF3]/20 hover:bg-[#CDEEF3]/30 transition-colors cursor-pointer"
                        onClick={() => router.push('/users')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-[#2c3e50]">Khách hàng mới</CardTitle>
                            <div className="p-2 bg-[#CDEEF3] rounded-full text-[#2c3e50]">
                                <Users className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#2c3e50]">{stats.newCustomers}</div>
                            <p className="text-xs text-[#5faeb6] font-semibold flex items-center mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" /> Trong tháng này
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts & Activity */}
                <div className="grid gap-6 md:grid-cols-7">
                    {/* TICKET TREND (Replacing Revenue Chart because it provides Success vs Cancelled breakdown) */}
                    <Card className="col-span-4 border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-[#2c3e50]">Xu hướng Đặt vé (7 ngày)</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={ticketTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="success" name="Vé thành công" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="cancelled" name="Vé hủy" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="col-span-3 border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-[#2c3e50]">Giao dịch gần đây</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {recentDisplayList.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        Chưa có giao dịch nào.
                                    </div>
                                ) : (
                                    recentDisplayList.map((booking: ITicket) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                                            onClick={() => router.push(`/tickets/show/${booking.id}`)}
                                        >
                                            <div className="space-y-1 flex-1">
                                                <p className="text-sm font-medium leading-none text-[#2c3e50]">
                                                    {booking.schedule?.route?.startPoint || 'N/A'} - {booking.schedule?.route?.endPoint || 'N/A'}
                                                </p>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-xs text-muted-foreground flex items-center">
                                                        <Clock className="mr-1 h-3 w-3" /> {formatTimeAgo(booking.createdAt.toString())}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {booking.seatCount || 1} vé: {booking.seatList || booking.seatNumber}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {(booking.discountAmount || 0) > 0 && (
                                                    <div className="text-[10px] text-muted-foreground line-through">
                                                        {formatCurrency(booking.totalPrice + (booking.discountAmount || 0))}
                                                    </div>
                                                )}
                                                <div className={`text-sm font-bold ${(booking.discountAmount || 0) > 0 ? 'text-red-600' : 'text-[#2c3e50]'}`}>
                                                    {formatCurrency(booking.totalPrice)}
                                                </div>
                                                <div className={`text-xs font-medium ${booking.status === TicketStatus.PAID ? 'text-green-500' :
                                                    booking.status === TicketStatus.BOOKED ? 'text-orange-500' : 'text-red-500'
                                                    }`}>
                                                    {booking.status === TicketStatus.PAID ? 'Thành công' :
                                                        booking.status === TicketStatus.BOOKED ? 'Chờ thanh toán' : 'Đã hủy'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-7">
                    {/* TOP REVENUE ROUTES - Horizontal Bar Chart */}
                    <Card className="col-span-4 border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-[#2c3e50]">Top Tuyến Đường Có Doanh Thu Cao Nhất</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={routeTreemap}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" fontSize={12} tickFormatter={(value) => `${value / 1000}k`} />
                                        <YAxis dataKey="name" type="category" width={150} fontSize={12} />
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Bar dataKey="value" name="Doanh thu" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                            {routeTreemap.map((entry: IRouteRevenue, index: number) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8884d8' : '#82ca9d'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* OCCUPANCY RATE - Donut Chart */}
                    <Card className="col-span-3 border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-[#2c3e50]">Tỷ lệ Lấp đầy (Tháng này)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] flex flex-col justify-center items-center relative">
                                {occupancyStats ? (
                                    <>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={occupancyStats.chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={80}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {occupancyStats.chartData.map((entry: { name: string; value: number; fill: string }, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                            <span className="text-4xl font-bold text-[#2c3e50]">{occupancyStats.occupancyRate}%</span>
                                            <span className="text-sm text-muted-foreground">{occupancyStats.totalSold}/{occupancyStats.totalCapacity} ghế</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full">Đang tải...</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Authenticated>
    );
}
