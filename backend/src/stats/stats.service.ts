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
}
