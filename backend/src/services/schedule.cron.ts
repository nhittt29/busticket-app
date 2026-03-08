import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduleRepository } from '../repositories/schedule.repository';

@Injectable()
export class ScheduleCronService {
    private readonly logger = new Logger(ScheduleCronService.name);

    constructor(private readonly scheduleRepo: ScheduleRepository) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        const now = new Date();
        // this.logger.debug(`[Schedule CRON] Checking for status updates at ${now.toISOString()}`);

        const result = await this.scheduleRepo.autoUpdateScheduleStatuses(now);

        if (result.started > 0 || result.completed > 0) {
            this.logger.log(
                `[Schedule Status Update] 🚍 ${result.started} ONGOING | 🏁 ${result.completed} COMPLETED.`,
            );
        }
    }
}
