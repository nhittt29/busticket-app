import { Controller, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { StatsService } from './stats.service';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';

@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) { }

    @Get('summary')
    async getSummary() {
        return this.statsService.getSummary();
    }

    @Get('my-brand-summary')
    @UseGuards(FirebaseAuthGuard)
    async getMyBrandSummary(@Req() req: any) {
        const brandId = req.user?.dbUser?.brandId;
        if (!brandId) {
            throw new UnauthorizedException('Người dùng không thuộc nhà xe nào.');
        }
        return this.statsService.getBrandPortalSummary(brandId);
    }

    @Get('revenue-chart')
    async getRevenueChart() {
        return this.statsService.getRevenueChart();
    }

    @Get('top-routes')
    async getTopRoutes() {
        return this.statsService.getTopRoutes();
    }

    @Get('brand-stats')
    async getBrandStats() {
        return this.statsService.getBrandStats();
    }

    @Get('status-stats')
    async getStatusStats() {
        return this.statsService.getStatusStats();
    }

    @Get('ticket-trend')
    async getTicketTrend() {
        return this.statsService.getTicketTrend();
    }

    @Get('route-treemap')
    async getRouteTreeMap() {
        return this.statsService.getRouteTreeMap();
    }

    @Get('occupancy-rate')
    async getOccupancyStats() {
        return this.statsService.getOccupancyStats();
    }

    @Get('payment-method-stats')
    async getPaymentMethodStats() {
        return this.statsService.getPaymentMethodStats();
    }

    @Get('hourly-booking-stats')
    async getHourlyBookingStats() {
        return this.statsService.getHourlyBookingStats();
    }
}
