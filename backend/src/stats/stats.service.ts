import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { TicketStatus, ScheduleStatus } from '@prisma/client';

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService) { }

    async getSummary() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // 1. Total Revenue (Paid Tickets)
        const revenue = await this.prisma.ticket.aggregate({
            _sum: {
                totalPrice: true,
            },
            where: {
                status: TicketStatus.PAID,
            },
        });

        // 2. Tickets Sold (Paid + Booked)
        const ticketsSold = await this.prisma.ticket.count({
            where: {
                status: {
                    in: [TicketStatus.PAID, TicketStatus.BOOKED],
                },
            },
        });

        // 3. New Customers (This Month)
        const newCustomers = await this.prisma.user.count({
            where: {
                role: {
                    name: 'PASSENGER',
                },
                createdAt: {
                    gte: startOfMonth,
                },
            },
        });

        // 4. Active Trips (Upcoming + Ongoing)
        const activeTrips = await this.prisma.schedule.count({
            where: {
                status: {
                    in: [ScheduleStatus.UPCOMING, ScheduleStatus.ONGOING],
                },
            },
        });

        // --- Growth Calculation (Simple comparison with last month for Revenue) ---
        // Revenue Last Month
        const revenueLastMonth = await this.prisma.ticket.aggregate({
            _sum: {
                totalPrice: true,
            },
            where: {
                status: TicketStatus.PAID,
                updatedAt: {
                    gte: startOfLastMonth,
                    lte: endOfLastMonth,
                },
            },
        });

        const currentRevenue = revenue._sum.totalPrice || 0;
        const lastMonthRevenue = revenueLastMonth._sum.totalPrice || 0;
        let revenueGrowth = 0;
        if (lastMonthRevenue > 0) {
            revenueGrowth = ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        } else if (currentRevenue > 0) {
            revenueGrowth = 100; // 100% growth if last month was 0
        }

        return {
            revenue: currentRevenue,
            revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
            ticketsSold,
            newCustomers,
            activeTrips,
        };
    }

    async getRevenueChart(days: number = 7) {
        // Lấy doanh thu theo ngày trong khoảng thời gian
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Prisma Raw Query để group by date
        // Lưu ý: Tùy database (Postgres/MySQL) cú pháp Date format khác nhau.
        // Dưới đây là cú pháp cho Postgres: TO_CHAR(ts, 'YsYY-MM-DD')
        const result = await this.prisma.$queryRaw<{ date: string; revenue: number }[]>`
            SELECT TO_CHAR("updatedAt"::date, 'YYYY-MM-DD') as date, SUM("totalPrice") as revenue
            FROM "Ticket"
            WHERE status = 'PAID' 
            AND "updatedAt" >= ${startDate}
            GROUP BY date
            ORDER BY date ASC
        `;

        // Fill các ngày thiếu bằng 0
        const chartData: { date: string; fullDate: string; revenue: number }[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            // Convert result item revenue to Number because BigInt or Decimal might be returned
            const found = result.find((r: any) => r.date === dateStr);
            chartData.push({
                date: `${d.getDate()}/${d.getMonth() + 1}`,
                fullDate: dateStr,
                revenue: found ? Number(found.revenue) : 0
            });
        }

        return chartData;
    }

    async getTopRoutes() {
        // Top 5 tuyến đường có doanh thu cao nhất
        const result = await this.prisma.$queryRaw<any[]>`
            SELECT r."id", r."startPoint", r."endPoint", COUNT(t.id) as "ticketsSold", SUM(t."totalPrice") as revenue
            FROM "Ticket" t
            JOIN "Schedule" s ON t."scheduleId" = s.id
            JOIN "Route" r ON s."routeId" = r.id
            WHERE t.status = 'PAID'
            GROUP BY r.id, r."startPoint", r."endPoint"
            ORDER BY revenue DESC
            LIMIT 5
        `;

        // Serialize BigInt if necessary (Prisma returns BigInt for aggregations usually)
        return result.map(item => ({
            ...item,
            ticketsSold: Number(item.ticketsSold),
            revenue: Number(item.revenue)
        }));
    }

    async getBrandStats() {
        // Doanh thu theo Hãng xe
        const result = await this.prisma.$queryRaw<any[]>`
            SELECT b.name, SUM(t."totalPrice") as revenue
            FROM "Ticket" t
            JOIN "Schedule" s ON t."scheduleId" = s.id
            JOIN "Bus" bus ON s."busId" = bus.id
            JOIN "Brand" b ON bus."brandId" = b.id
            WHERE t.status = 'PAID'
            GROUP BY b.name
            ORDER BY revenue DESC
        `;

        return result.map(item => ({
            name: item.name,
            revenue: Number(item.revenue)
        }));
    }

    async getStatusStats() {
        // Tỷ lệ trạng thái vé
        const result = await this.prisma.ticket.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        });

        // Map sang format dễ dùng: { name: 'Đã thanh toán', value: 10, color: '#...' }
        return result.map(item => {
            let label = '';
            let color = '';

            switch (item.status) {
                case 'PAID':
                    label = 'Đã thanh toán';
                    color = '#22c55e'; // Green-500
                    break;
                case 'BOOKED':
                    label = 'Chờ thanh toán';
                    color = '#eab308'; // Yellow-500
                    break;
                case 'CANCELLED':
                    label = 'Đã hủy';
                    color = '#ef4444'; // Red-500
                    break;
                default:
                    label = item.status;
                    color = '#94a3b8';
            }

            return {
                name: label,
                value: item._count.id,
                color: color,
                rawStatus: item.status
            };
        });
    }

    async getTicketTrend(days: number = 7) {
        // Multi-line chart: So sánh vé Success (PAID) vs Cancelled theo ngày
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Lấy dữ liệu raw
        const result = await this.prisma.$queryRaw<{ date: string; status: string; count: number }[]>`
            SELECT TO_CHAR("updatedAt"::date, 'YYYY-MM-DD') as date, status, COUNT(id) as count
            FROM "Ticket"
            WHERE status IN ('PAID', 'CANCELLED')
            AND "updatedAt" >= ${startDate}
            GROUP BY date, status
            ORDER BY date ASC
        `;

        // Format lại dữ liệu cho Recharts:
        // [ { date: '01/12', success: 10, cancelled: 2 }, ... ]
        const chartData: { date: string; fullDate: string; success: number; cancelled: number }[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const shortDate = `${d.getDate()}/${d.getMonth() + 1}`;

            const successItem = result.find((r: any) => r.date === dateStr && r.status === 'PAID');
            const cancelledItem = result.find((r: any) => r.date === dateStr && r.status === 'CANCELLED');

            chartData.push({
                date: shortDate,
                fullDate: dateStr,
                success: successItem ? Number(successItem.count) : 0,
                cancelled: cancelledItem ? Number(cancelledItem.count) : 0,
            });
        }

        return chartData;
    }

    async getRouteTreeMap() {
        // Treemap: Doanh thu theo tuyến (Size = Revenue)
        const result = await this.prisma.$queryRaw<any[]>`
            SELECT r."startPoint" || ' - ' || r."endPoint" as name, SUM(t."totalPrice") as value
            FROM "Ticket" t
            JOIN "Schedule" s ON t."scheduleId" = s.id
            JOIN "Route" r ON s."routeId" = r.id
            WHERE t.status = 'PAID'
            GROUP BY r."startPoint", r."endPoint"
            HAVING SUM(t."totalPrice") > 0
            ORDER BY value DESC
        `;

        return result.map(item => ({
            name: item.name,
            value: Number(item.value) // Treemap cần key 'value' để tính size
        }));
    }

    async getOccupancyStats() {
        // Calculate Occupancy Rate (Tỷ lệ lấp đầy) for trips in the last 30 days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        // Fetch schedules that departed in the last 30 days and are not cancelled
        const schedules = await this.prisma.schedule.findMany({
            where: {
                departureAt: {
                    gte: startDate,
                    lte: new Date(), // Only past/ongoing trips
                },
                status: {
                    not: ScheduleStatus.CANCELLED
                }
            },
            include: {
                bus: true,
                _count: {
                    select: {
                        tickets: {
                            where: {
                                status: { in: [TicketStatus.PAID, TicketStatus.BOOKED] }
                            }
                        }
                    }
                }
            }
        });

        let totalCapacity = 0;
        let totalSold = 0;

        schedules.forEach((schedule: any) => {
            totalCapacity += schedule.bus.seatCount;
            totalSold += schedule._count.tickets;
        });

        const occupancyRate = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;

        return {
            occupancyRate: Math.round(occupancyRate * 10) / 10,
            totalCapacity,
            totalSold,
            chartData: [
                { name: 'Ghế đã bán', value: totalSold, fill: '#22c55e' }, // Green
                { name: 'Ghế trống', value: totalCapacity - totalSold, fill: '#e5e7eb' }, // Gray
            ]
        };
    }

    async getPaymentMethodStats() {
        // Thống kê phương thức thanh toán
        const result = await this.prisma.ticket.groupBy({
            by: ['paymentMethod'],
            _count: {
                id: true
            },
            where: {
                status: TicketStatus.PAID
            }
        });

        // Map colors suitable for charts
        const colors: Record<string, string> = {
            'MOMO': '#A50064', // Momo Pink
            'ZALOPAY': '#0068FF', // Zalo Blue
            'CASH': '#22c55e', // Green
            'VNPAY': '#ED1C24', // VNPay Red
            'BANK_TRANSFER': '#64748b' // Slate
        };

        return result.map(item => ({
            name: item.paymentMethod || 'Khác',
            value: item._count.id,
            fill: colors[item.paymentMethod || ''] || '#94a3b8'
        }));
    }

    async getHourlyBookingStats() {
        // Thống kê khung giờ đặt vé (0h - 23h) trong 30 ngày qua
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        // Prisma Query Raw to extract Hour from createdAt
        // Postgres: EXTRACT(HOUR FROM "createdAt")
        const result = await this.prisma.$queryRaw<{ hour: number; count: number }[]>`
            SELECT EXTRACT(HOUR FROM "createdAt") as hour, COUNT(id) as count
            FROM "Ticket"
            WHERE "createdAt" >= ${startDate}
            GROUP BY hour
            ORDER BY hour ASC
        `;

        // Fill missing hours with 0
        const chartData: { hour: string; count: number }[] = [];
        for (let i = 0; i < 24; i++) {
            // Convert hour to Number because BigInt or Decimal
            const found = result.find((r: any) => Number(r.hour) === i);
            chartData.push({
                hour: `${i}:00`,
                count: found ? Number(found.count) : 0
            });
        }

        return chartData;
    }
}
