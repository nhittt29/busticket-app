"use client";

import { ListLayout } from "@/components/common/ListLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Ticket, BusFront, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React from "react";

export default function StatsPage() {
    const router = useRouter();
    const [stats, setStats] = React.useState({
        revenue: 0,
        revenueGrowth: 0,
        ticketsSold: 0,
        newCustomers: 0,
        activeTrips: 0,
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/stats/summary");
                const data = await response.json();
                setStats(data);
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
            description="Tổng hợp số liệu kinh doanh và hiệu quả hoạt động."
            icon={BarChart3}
            actions={
                <Button variant="outline" onClick={() => router.push("/")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            }
        >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? "..." : formatCurrency(stats.revenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.revenueGrowth > 0 ? "+" : ""}{stats.revenueGrowth}% so với tháng trước
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vé đã bán</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? "..." : stats.ticketsSold}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Vé đã thanh toán & đặt chỗ
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Khách hàng mới</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? "..." : stats.newCustomers}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Trong tháng này
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chuyến xe</CardTitle>
                        <BusFront className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? "..." : stats.activeTrips}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Đang hoạt động & Sắp chạy
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="p-6 pt-0">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center justify-center min-h-[400px] text-muted-foreground bg-muted/10 border-dashed">
                    Biểu đồ chi tiết sẽ được cập nhật sau
                </div>
            </div>
        </ListLayout>
    );
}
