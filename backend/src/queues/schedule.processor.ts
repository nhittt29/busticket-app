// src/queues/schedule.processor.ts
import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { ScheduleStatus } from '@prisma/client';
import { SCHEDULE_QUEUE, UPDATE_STATUS_JOB } from './schedule.queue'; // ĐÃ IMPORT ĐÚNG

@Processor(SCHEDULE_QUEUE)
export class ScheduleProcessor {
  private readonly logger = new Logger(ScheduleProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process(UPDATE_STATUS_JOB)
  async handleUpdateStatus(job: Job<unknown>) {
    const now = new Date();

    const [upcomingToOngoing, ongoingToCompleted] = await Promise.all([
      this.prisma.schedule.updateMany({
        where: {
          status: ScheduleStatus.UPCOMING,
          departureAt: { lte: now },
        },
        data: { status: ScheduleStatus.ONGOING },
      }),
      this.prisma.schedule.updateMany({
        where: {
          status: ScheduleStatus.ONGOING,
          arrivalAt: { lte: now },
        },
        data: { status: ScheduleStatus.COMPLETED },
      }),
    ]);

    if (upcomingToOngoing.count > 0 || ongoingToCompleted.count > 0) {
      this.logger.log(
        `Schedule status updated: ${upcomingToOngoing.count} → ONGOING | ${ongoingToCompleted.count} → COMPLETED`,
      );
    }
  }
}