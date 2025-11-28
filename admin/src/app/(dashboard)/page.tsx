"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, BusFront, Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'T2', revenue: 4000 },
  { name: 'T3', revenue: 3000 },
  { name: 'T4', revenue: 2000 },
  { name: 'T5', revenue: 2780 },
  { name: 'T6', revenue: 1890 },
  { name: 'T7', revenue: 2390 },
  { name: 'CN', revenue: 3490 },
];

const recentTickets = [
  { id: "VN-1234", route: "Sài Gòn - Đà Lạt", time: "10 phút trước", status: "Thành công", price: "350.000đ" },
  { id: "VN-1235", route: "Hà Nội - Sapa", time: "15 phút trước", status: "Chờ thanh toán", price: "450.000đ" },
  { id: "VN-1236", route: "Đà Nẵng - Huế", time: "32 phút trước", status: "Thành công", price: "180.000đ" },
  { id: "VN-1237", route: "Cần Thơ - Cà Mau", time: "1 giờ trước", status: "Hủy", price: "160.000đ" },
];

import { Authenticated } from "@refinedev/core";

export default function Dashboard() {
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
            <span className="text-sm font-medium text-muted-foreground px-2">Tháng 11, 2025</span>
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
              <div className="text-2xl font-bold text-[#2c3e50]">1.248 tỷ</div>
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
              <div className="text-2xl font-bold text-[#2c3e50]">48.592</div>
              <p className="text-xs text-[#85D4BE] font-semibold flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" /> +12% so với hôm qua
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-[#AEE6CB]/10 hover:bg-[#AEE6CB]/20 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#2c3e50]">Chuyến xe</CardTitle>
              <div className="p-2 bg-[#AEE6CB] rounded-full text-white">
                <BusFront className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c3e50]">127</div>
              <p className="text-xs text-[#AEE6CB] font-semibold flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" /> +5 chuyến đang chạy
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
              <div className="text-2xl font-bold text-[#2c3e50]">+2.843</div>
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
                {recentTickets.map((ticket, index) => (
                  <div key={index} className="flex items-center">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none text-[#2c3e50]">{ticket.route}</p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-3 w-3" /> {ticket.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#2c3e50]">{ticket.price}</div>
                      <div className={`text-xs font-medium ${ticket.status === 'Thành công' ? 'text-green-500' :
                        ticket.status === 'Chờ thanh toán' ? 'text-orange-500' : 'text-red-500'
                        }`}>
                        {ticket.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Authenticated>
  );
}