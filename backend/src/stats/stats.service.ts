import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, MoreThanOrEqual, LessThanOrEqual, Not } from 'typeorm';
import { Ticket } from '../entities/Ticket.entity';
import { Schedule } from '../entities/Schedule.entity';
import { User } from '../entities/User.entity';
import { TicketStatus, ScheduleStatus } from '../models/Ticket';
// Removed Prisma imports entirely

@Injectable()
export class StatsService {
    constructor(
        @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
        @InjectRepository(Schedule) private scheduleRepo: Repository<Schedule>,
        @InjectRepository(User) private userRepo: Repository<User>,
    ) { }

    async getSummary() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // 1. Total Revenue (Paid Tickets)
        const revenueResult = await this.ticketRepo
            .createQueryBuilder('ticket')
            .select('SUM(ticket.totalPrice)', 'total')
            .where('ticket.status = :status', { status: 'PAID' })
            .getRawOne();
        const currentRevenue = parseFloat(revenueResult.total) || 0;

        // 2. Tickets Sold (Paid + Booked)
        const ticketsSold = await this.ticketRepo.count({
            where: { status: In(['PAID', 'BOOKED']) }
        });

        // 3. New Customers (This Month)
        // Assume 'role' is relation. Need to join.
        const newCustomers = await this.userRepo.count({
            where: {
                createdAt: MoreThanOrEqual(startOfMonth),
                role: { name: 'PASSENGER' }
            }
        });

        // 4. Active Trips (Upcoming + Ongoing)
        const activeTrips = await this.scheduleRepo.count({
            where: { status: In(['UPCOMING', 'ONGOING']) }
        });

        // --- Growth Calculation ---
        const lastMonthRevenueResult = await this.ticketRepo
            .createQueryBuilder('ticket')
            .select('SUM(ticket.totalPrice)', 'total')
            .where('ticket.status = :status', { status: 'PAID' })
            .andWhere('ticket.updatedAt BETWEEN :start AND :end', { start: startOfLastMonth, end: endOfLastMonth })
            .getRawOne();
        const lastMonthRevenue = parseFloat(lastMonthRevenueResult.total) || 0;

        let revenueGrowth = 0;
        if (lastMonthRevenue > 0) {
            revenueGrowth = ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        } else if (currentRevenue > 0) {
            revenueGrowth = 100;
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
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Oracle Date Format: TO_CHAR(updatedAt, 'YYYY-MM-DD')
        // Using queryBuilder to be safer or raw sql.
        // Assuming Oracle
        const result = await this.ticketRepo.query(`
            SELECT TO_CHAR("updatedAt", 'YYYY-MM-DD') as "date", SUM("totalPrice") as "revenue"
            FROM "Ticket"
            WHERE "status" = 'PAID' 
            AND "updatedAt" >= :startDate
            GROUP BY TO_CHAR("updatedAt", 'YYYY-MM-DD')
            ORDER BY "date" ASC
        `, [startDate]);

        const chartData: any[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

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
        // Oracle compatible query likely
        const result = await this.ticketRepo.query(`
            SELECT r."id", r."startPoint", r."endPoint", COUNT(t."id") as "ticketsSold", SUM(t."totalPrice") as "revenue"
            FROM "Ticket" t
            JOIN "Schedule" s ON t."scheduleId" = s."id"
            JOIN "Route" r ON s."routeId" = r."id"
            WHERE t."status" = 'PAID'
            GROUP BY r."id", r."startPoint", r."endPoint"
            ORDER BY "revenue" DESC
            FETCH FIRST 5 ROWS ONLY
        `);
        // FETCH FIRST 5 ROWS ONLY is Oracle 12c+ standard. LIMIT 5 is Postgres/MySQL.
        // Assuming Oracle 12c+.

        return result.map((item: any) => ({
            ...item,
            ticketsSold: Number(item.ticketsSold),
            revenue: Number(item.revenue)
        }));
    }

    async getBrandStats() {
        const result = await this.ticketRepo.query(`
            SELECT b."name", SUM(t."totalPrice") as "revenue"
            FROM "Ticket" t
            JOIN "Schedule" s ON t."scheduleId" = s."id"
            JOIN "Bus" bus ON s."busId" = bus."id"
            JOIN "Brand" b ON bus."brandId" = b."id"
            WHERE t."status" = 'PAID'
            GROUP BY b."name"
            ORDER BY "revenue" DESC
        `);

        return result.map((item: any) => ({
            name: item.name,
            revenue: Number(item.revenue)
        }));
    }

    async getStatusStats() {
        const result = await this.ticketRepo
            .createQueryBuilder('ticket')
            .select('ticket.status', 'status')
            .addSelect('COUNT(ticket.id)', 'count')
            .groupBy('ticket.status')
            .getRawMany();

        return result.map(item => {
            let label = '';
            let color = '';
            switch (item.status) {
                case 'PAID': label = 'Đã thanh toán'; color = '#22c55e'; break;
                case 'BOOKED': label = 'Chờ thanh toán'; color = '#eab308'; break;
                case 'CANCELLED': label = 'Đã hủy'; color = '#ef4444'; break;
                default: label = item.status; color = '#94a3b8';
            }
            return {
                name: label,
                value: Number(item.count),
                color: color,
                rawStatus: item.status
            };
        });
    }

    async getTicketTrend(days: number = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const result = await this.ticketRepo.query(`
            SELECT TO_CHAR("updatedAt", 'YYYY-MM-DD') as "date", "status", COUNT("id") as "count"
            FROM "Ticket"
            WHERE "status" IN ('PAID', 'CANCELLED')
            AND "updatedAt" >= :startDate
            GROUP BY TO_CHAR("updatedAt", 'YYYY-MM-DD'), "status"
            ORDER BY "date" ASC
        `, [startDate]);

        const chartData: any[] = [];
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
        // Oracle string concat is ||
        const result = await this.ticketRepo.query(`
            SELECT r."startPoint" || ' - ' || r."endPoint" as "name", SUM(t."totalPrice") as "value"
            FROM "Ticket" t
            JOIN "Schedule" s ON t."scheduleId" = s."id"
            JOIN "Route" r ON s."routeId" = r."id"
            WHERE t."status" = 'PAID'
            GROUP BY r."startPoint", r."endPoint"
            HAVING SUM(t."totalPrice") > 0
            ORDER BY "value" DESC
        `);

        return result.map((item: any) => ({
            name: item.name,
            value: Number(item.value)
        }));
    }

    async getOccupancyStats() {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        // Complex calculation. Can use QueryBuilder or find with relations.
        // Using find with relations as in original code logic, cleaner than huge SQL.
        // TypeORM find...
        const schedules = await this.scheduleRepo.find({
            where: {
                departureAt: Between(startDate, new Date()),
                status: Not('CANCELLED') // Assuming not cancelled
            },
            relations: ['bus', 'tickets'] // Loading all tickets? Too heavy.
        });

        // If loading all tickets is too heavy, we should use grouping query.
        // BUT strict replication of original logic is: fetch and JS loop.
        // Original logic: _count tickets.
        // TypeORM doesn't support _count in simple find easily.
        // Let's use QueryBuilder to get count.
        // Or Raw Query.

        // Simplified approach: Aggregate query.
        const totalCapacityResult = await this.scheduleRepo
            .createQueryBuilder('schedule')
            .leftJoin('schedule.bus', 'bus')
            .select('SUM(bus.seatCount)', 'total')
            .where('schedule.departureAt BETWEEN :start AND :end', { start: startDate, end: new Date() })
            .andWhere("schedule.status != 'CANCELLED'")
            .getRawOne();

        const totalSoldResult = await this.ticketRepo
            .createQueryBuilder('ticket')
            .leftJoin('ticket.schedule', 'schedule')
            .select('COUNT(ticket.id)', 'count')
            .where('schedule.departureAt BETWEEN :start AND :end', { start: startDate, end: new Date() })
            .andWhere("schedule.status != 'CANCELLED'")
            .andWhere("ticket.status IN (:...statuses)", { statuses: ['PAID', 'BOOKED'] })
            .getRawOne();

        const totalCapacity = Number(totalCapacityResult.total) || 0;
        const totalSold = Number(totalSoldResult.count) || 0;
        const occupancyRate = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;

        return {
            occupancyRate: Math.round(occupancyRate * 10) / 10,
            totalCapacity,
            totalSold,
            chartData: [
                { name: 'Ghế đã bán', value: totalSold, fill: '#22c55e' },
                { name: 'Ghế trống', value: totalCapacity - totalSold, fill: '#e5e7eb' },
            ]
        };
    }

    async getPaymentMethodStats() {
        const result = await this.ticketRepo
            .createQueryBuilder('ticket')
            .select('ticket.paymentMethod', 'method')
            .addSelect('COUNT(ticket.id)', 'count')
            .where('ticket.status = :status', { status: 'PAID' })
            .groupBy('ticket.paymentMethod')
            .getRawMany();

        const colors: any = {
            'MOMO': '#A50064',
            'ZALOPAY': '#0068FF',
            'CASH': '#22c55e',
            'VNPAY': '#ED1C24',
            'BANK_TRANSFER': '#64748b'
        };

        return result.map(item => ({
            name: item.method || 'Khác',
            value: Number(item.count),
            fill: colors[item.method || ''] || '#94a3b8'
        }));
    }

    async getHourlyBookingStats() {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        // Oracle: EXTRACT(HOUR FROM "createdAt")
        const result = await this.ticketRepo.query(`
            SELECT EXTRACT(HOUR FROM "createdAt") as "hour", COUNT("id") as "count"
            FROM "Ticket"
            WHERE "createdAt" >= :startDate
            GROUP BY EXTRACT(HOUR FROM "createdAt")
            ORDER BY "hour" ASC
        `, [startDate]);

        const chartData: any[] = [];
        for (let i = 0; i < 24; i++) {
            const found = result.find((r: any) => Number(r.hour) === i);
            chartData.push({
                hour: `${i}:00`,
                count: found ? Number(found.count) : 0
            });
        }
        return chartData;
    }
}
