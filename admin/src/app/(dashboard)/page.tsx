"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, BusFront, Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useList, Authenticated } from "@refinedev/core";
import { IBus } from "@/interfaces/bus";
import { ITicket } from "@/interfaces/ticket";
import { IUser } from "@/interfaces/user";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const data = [
    { name: 'T2', revenue: 4000 },
    { name: 'T3', revenue: 3000 },
    { name: 'T4', revenue: 2000 },
    { name: 'T5', revenue: 2780 },
    { name: 'T6', revenue: 1890 },
    { name: 'T7', revenue: 2390 },
    { name: 'CN', revenue: 3490 },
];

export default function Dashboard() {
    // Fetch data
    const { data: ticketData, isLoading: isLoadingTickets, isError: isTicketError } = useList<ITicket>({
        resource: "tickets",
        pagination: { pageSize: 1000 }, // Fetch enough to calculate stats
    }) as any;

    const { data: busData, isLoading: isLoadingBuses } = useList<IBus>({
        resource: "buses",
        pagination: { pageSize: 100 },
    }) as any;

    const { data: userData, isLoading: isLoadingUsers } = useList<IUser>({
        resource: "users",
        pagination: { pageSize: 100 },
    }) as any;

    console.log("Dashboard Debug:", {
        ticketData,
        busData,
        userData,
        isLoadingTickets,
        isTicketError
    });

    if (isLoadingTickets || isLoadingBuses || isLoadingUsers) {
        return <div className="p-8">Đang tải dữ liệu...</div>;
    }

    // Calculate Stats
    const tickets = ticketData?.data || [];
    const buses = busData?.data || [];
    const users = userData?.data || [];

    const totalRevenue = tickets.reduce((sum: number, ticket: ITicket) => sum + ticket.totalPrice, 0);
    const totalTickets = tickets.length;
    const totalBuses = buses.length;
    const totalCustomers = users.filter((u: IUser) => u.role?.name === 'PASSENGER').length;

    // Recent Transactions (Last 5 tickets)
    const recentTickets = [...tickets]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

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
                    <Card className="border-0 shadow-sm bg-[#96DFD8]/10 hover:bg-[#96DFD8]/20 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-[#2c3e50]">Tổng doanh thu</CardTitle>
                            <div className="p-2 bg-[#96DFD8] rounded-full text-white">
                                <DollarSign className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#2c3e50]">{formatCurrency(totalRevenue)}</div>
                            <p className="text-xs text-[#96DFD8] font-semibold flex items-center mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" /> +20.1% so với tháng trước
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-[#85D4BE]/10 hover:bg-[#85D4BE]/20 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-[#2c3e50]">Vé đã bán</CardTitle>
                            <div className="p-2 bg-[#85D4BE] rounded-full text-white">
                                <Ticket className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#2c3e50]">{totalTickets}</div>
                            <p className="text-xs text-[#85D4BE] font-semibold flex items-center mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" /> +12% so với hôm qua
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-[#AEE6CB]/10 hover:bg-[#AEE6CB]/20 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-[#2c3e50]">Xe đang hoạt động</CardTitle>
                            <div className="p-2 bg-[#AEE6CB] rounded-full text-white">
                                <BusFront className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#2c3e50]">{totalBuses}</div>
                            <p className="text-xs text-[#AEE6CB] font-semibold flex items-center mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" /> +5 xe mới
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-[#CDEEF3]/20 hover:bg-[#CDEEF3]/30 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-[#2c3e50]">Khách hàng</CardTitle>
                            <div className="p-2 bg-[#CDEEF3] rounded-full text-[#2c3e50]">
                                <Users className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#2c3e50]">{totalCustomers}</div>
                            <p className="text-xs text-[#5faeb6] font-semibold flex items-center mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" /> +180 trong 24h qua
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts & Activity */}
                <div className="grid gap-6 md:grid-cols-7">
                    {/* Chart */}
                    <Card className="col-span-4 border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-[#2c3e50]">Biểu đồ doanh thu</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#96DFD8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#96DFD8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            itemStyle={{ color: '#2c3e50' }}
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
                                {recentTickets.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        Chưa có giao dịch nào.
                                    </div>
                                ) : (
                                    recentTickets.map((ticket) => (
                                        <div key={ticket.id} className="flex items-center">
                                            <div className="space-y-1 flex-1">
                                                <p className="text-sm font-medium leading-none text-[#2c3e50]">
                                                    {ticket.schedule?.route?.name || "Chuyến xe không xác định"}
                                                </p>
                                                <p className="text-xs text-muted-foreground flex items-center">
                                                    <Clock className="mr-1 h-3 w-3" /> {formatTimeAgo(ticket.createdAt)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-[#2c3e50]">
                                                    {formatCurrency(ticket.totalPrice)}
                                                </div>
                                                <div className={`text-xs font-medium ${ticket.status === 'PAID' ? 'text-green-500' :
                                                    ticket.status === 'PENDING' ? 'text-orange-500' : 'text-red-500'
                                                    }`}>
                                                    {ticket.status === 'PAID' ? 'Thành công' :
                                                        ticket.status === 'PENDING' ? 'Chờ thanh toán' : 'Đã hủy'}
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
