import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) { }

    @Get('summary')
    async getSummary() {
        return this.statsService.getSummary();
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
}
