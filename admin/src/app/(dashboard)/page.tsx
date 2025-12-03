"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, BusFront, Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useList, Authenticated } from "@refinedev/core";
import { IBus } from "@/interfaces/bus";
import { ITicket, TicketStatus } from "@/interfaces/ticket";
import { IUser } from "@/interfaces/user";
import { format, subDays, isSameDay, startOfDay, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function Dashboard() {
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(true);

    // Fetch data with safe handling for return structure
    const ticketListResult = useList<ITicket>({
        resource: "tickets",
        pagination: { pageSize: 1000 },
        sorters: [{ field: "createdAt", order: "desc" }],
    }) as any;

    const busListResult = useList<IBus>({
        resource: "buses",
        pagination: { pageSize: 100 },
    }) as any;

    const userListResult = useList<IUser>({
        resource: "users",
        pagination: { pageSize: 100 },
    }) as any;

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data } = await api.get('/tickets/bookings');
                setBookings(data);
            } catch (error) {
                console.error("Failed to fetch bookings:", error);
            } finally {
                setIsLoadingBookings(false);
            }
        };
        fetchBookings();
    }, []);

    // Extract data handling both standard and legacy/custom Refine return structures
    const tickets: ITicket[] = ticketListResult?.data?.data || ticketListResult?.result?.data || [];
    const buses: IBus[] = busListResult?.data?.data || busListResult?.result?.data || [];
    const users: IUser[] = userListResult?.data?.data || userListResult?.result?.data || [];

    const isLoadingTickets = ticketListResult?.isLoading || ticketListResult?.query?.isLoading;
    const isLoadingBuses = busListResult?.isLoading || busListResult?.query?.isLoading;
    const isLoadingUsers = userListResult?.isLoading || userListResult?.query?.isLoading;

    if (isLoadingTickets || isLoadingBuses || isLoadingUsers || isLoadingBookings) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Calculate Stats
    // 1. Total Revenue (Only PAID tickets)
    const paidTickets = tickets.filter(t => t.status === TicketStatus.PAID);
    const totalRevenue = paidTickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0);

    // 2. Total Tickets Sold (Non-cancelled)
    const validTickets = tickets.filter(t => t.status !== TicketStatus.CANCELLED);
    const totalTickets = validTickets.length;

    // 3. Total Active Buses
    const totalBuses = buses.length;

    // 4. Total Customers (Role != ADMIN)
    const totalCustomers = users.filter(u => u.role?.name !== 'ADMIN').length;

    // 5. Chart Data (Last 7 days revenue)
    const chartData = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dayRevenue = paidTickets
            .filter(t => isSameDay(parseISO(t.createdAt), date))
            .reduce((sum, t) => sum + t.totalPrice, 0);

        return {
            name: format(date, "dd/MM", { locale: vi }),
            revenue: dayRevenue,
            fullDate: format(date, "dd/MM/yyyy", { locale: vi }),
        };
    });

    // 6. Recent Transactions (Latest 5 bookings)
    const recentBookings = [...bookings].slice(0, 5);

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

                {/* Stats Grid */}
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
                            <div className="text-2xl font-bold text-[#2c3e50]">{formatCurrency(totalRevenue)}</div>
                            <p className="text-xs text-[#96DFD8] font-semibold flex items-center mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" /> Doanh thu thực tế
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
                            <div className="text-2xl font-bold text-[#2c3e50]">{totalTickets}</div>
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
                            <CardTitle className="text-sm font-medium text-[#2c3e50]">Xe đang hoạt động</CardTitle>
                            <div className="p-2 bg-[#AEE6CB] rounded-full text-white">
                                <BusFront className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#2c3e50]">{totalBuses}</div>
                            <p className="text-xs text-[#AEE6CB] font-semibold flex items-center mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" /> Tổng số xe
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="border-0 shadow-sm bg-[#CDEEF3]/20 hover:bg-[#CDEEF3]/30 transition-colors cursor-pointer"
                        onClick={() => router.push('/users')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-[#2c3e50]">Khách hàng</CardTitle>
                            <div className="p-2 bg-[#CDEEF3] rounded-full text-[#2c3e50]">
                                <Users className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#2c3e50]">{totalCustomers}</div>
                            <p className="text-xs text-[#5faeb6] font-semibold flex items-center mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" /> Người dùng
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts & Activity */}
                <div className="grid gap-6 md:grid-cols-7">
                    {/* Chart */}
                    <Card className="col-span-4 border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-[#2c3e50]">Biểu đồ doanh thu (7 ngày qua)</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#96DFD8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#96DFD8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white p-3 border shadow-lg rounded-lg">
                                                            <p className="text-sm font-medium text-gray-900">{payload[0].payload.fullDate}</p>
                                                            <p className="text-sm text-[#96DFD8] font-bold">
                                                                {formatCurrency(payload[0].value as number)}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#96DFD8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
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
                                {recentBookings.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        Chưa có giao dịch nào.
                                    </div>
                                ) : (
                                    recentBookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                                            onClick={() => router.push(`/tickets/show/${booking.id}`)}
                                        >
                                            <div className="space-y-1 flex-1">
                                                <p className="text-sm font-medium leading-none text-[#2c3e50]">
                                                    {booking.schedule?.route?.startPoint} - {booking.schedule?.route?.endPoint}
                                                </p>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-xs text-muted-foreground flex items-center">
                                                        <Clock className="mr-1 h-3 w-3" /> {formatTimeAgo(booking.createdAt)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {booking.seatCount} vé: {booking.seatList}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {booking.discountAmount > 0 && (
                                                    <div className="text-[10px] text-muted-foreground line-through">
                                                        {formatCurrency(booking.totalPrice + booking.discountAmount)}
                                                    </div>
                                                )}
                                                <div className={`text-sm font-bold ${booking.discountAmount > 0 ? 'text-red-600' : 'text-[#2c3e50]'}`}>
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
            </div>
        </Authenticated>
    );
}
