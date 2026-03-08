import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, MoreThanOrEqual, LessThanOrEqual, Brackets } from 'typeorm';
import { Schedule } from '../entities/Schedule.entity';

@Injectable()
export class ScheduleRepository {
    constructor(
        @InjectRepository(Schedule)
        private readonly scheduleRepo: Repository<Schedule>,
    ) { }

    async find(options: any) {
        return this.scheduleRepo.find(options);
    }

    async update(criteria: any, data: any) {
        return this.scheduleRepo.update(criteria, data);
    }

    async getSchedulesByDate(date: string) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return this.scheduleRepo.find({
            where: {
                departureAt: Between(startOfDay, endOfDay),
            },
            relations: ['bus', 'bus.brand', 'route'],
            order: { departureAt: 'ASC' },
        });
    }

    async getScheduleById(id: number) {
        return this.scheduleRepo.findOne({
            where: { id },
            relations: ['bus', 'route'],
        });
    }

    async findOne(options: any) {
        return this.scheduleRepo.findOne(options);
    }

    async createSchedule(data: any) {
        const schedule = this.scheduleRepo.create(data);
        return this.scheduleRepo.save(schedule);
    }

    async updateSchedule(id: number, data: any) {
        await this.scheduleRepo.update(id, data);
        return this.getScheduleById(id);
    }

    async deleteSchedule(id: number) {
        await this.scheduleRepo.delete(id);
        return { message: 'Schedule deleted successfully' };
    }

    // MISSING METHODS ADDED
    async getAllSchedules(query: any) {
        const qb = this.scheduleRepo.createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.bus', 'bus')
            .leftJoinAndSelect('bus.brand', 'brand')
            .leftJoinAndSelect('schedule.route', 'route')
            .leftJoinAndSelect('schedule.dropoffPoints', 'dropoff'); // Join dropoff points

        // 1. Where Start Point (Route Start OR Dropoff Point)
        if (query.startPoint) {
            const trimmedStart = query.startPoint.trim().toLowerCase();
            // Search in Route Start OR Dropoff Points (assuming dropoff points can be pick up/intermediate stops)
            // Note: Brackets are crucial for OR conditions
            qb.andWhere(new Brackets(qb => {
                qb.where('LOWER(route.startPoint) LIKE :startPoint', { startPoint: `%${trimmedStart}%` })
                    .orWhere('LOWER(dropoff.name) LIKE :startPoint', { startPoint: `%${trimmedStart}%` })
                    .orWhere('LOWER(dropoff.address) LIKE :startPoint', { startPoint: `%${trimmedStart}%` });
            }));
        }

        // 2. Where End Point (Route End OR Dropoff Point)
        if (query.endPoint) {
            const trimmedEnd = query.endPoint.trim().toLowerCase();
            qb.andWhere(new Brackets(qb => {
                qb.where('LOWER(route.endPoint) LIKE :endPoint', { endPoint: `%${trimmedEnd}%` })
                    .orWhere('LOWER(dropoff.name) LIKE :endPoint', { endPoint: `%${trimmedEnd}%` })
                    .orWhere('LOWER(dropoff.address) LIKE :endPoint', { endPoint: `%${trimmedEnd}%` });
            }));
        }

        // 3. Where Date
        if (query.date) {
            const inputDate = new Date(query.date);
            if (!isNaN(inputDate.getTime())) {
                const startOfDay = new Date(inputDate);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(inputDate);
                endOfDay.setHours(23, 59, 59, 999);

                console.log('Date Range:', startOfDay.toISOString(), 'TO', endOfDay.toISOString());
                qb.andWhere('schedule.departureAt BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay });
            } else {
                console.warn('Invalid Date provided:', query.date);
            }
        }

        // 4. Price Filter
        if (query.minPrice && Number(query.minPrice) > 0) {
            qb.andWhere('route.lowestPrice >= :minPrice', { minPrice: query.minPrice });
        }
        if (query.maxPrice && Number(query.maxPrice) > 0) {
            qb.andWhere('route.lowestPrice <= :maxPrice', { maxPrice: query.maxPrice });
        }

        // 5. Bus Type (Strict check: only if provided and not ALL)
        if (query.busType && query.busType !== 'ALL' && query.busType !== '') {
            qb.andWhere('bus.seatType = :busType', { busType: query.busType });
        }

        // 6. Brand
        if (query.brandId && Number(query.brandId) > 0) {
            qb.andWhere('brand.id = :brandId', { brandId: query.brandId });
        }

        // Sorting
        const sortMap = {
            'price_asc': 'route.lowestPrice ASC',
            'price_desc': 'route.lowestPrice DESC',
            'time_asc': 'schedule.departureAt ASC',
            'time_desc': 'schedule.departureAt DESC'
        };

        const sortStr = sortMap[query.sortBy] || 'schedule.departureAt ASC';
        const [sortCol, sortDir] = sortStr.split(' ');
        qb.orderBy(sortCol, sortDir as 'ASC' | 'DESC');

        try {
            const results = await qb.getMany();
            console.log(`[Search] Query: ${JSON.stringify(query)} | Found: ${results.length} records`);
            return results;
        } catch (err) {
            console.error('Error executing query:', err);
            throw err;
        }
    }

    async getAllSchedulesForAdmin() {
        return this.scheduleRepo.find({
            relations: ['bus', 'bus.brand', 'route'],
            order: { departureAt: 'DESC' }
        });
    }
    async getDropoffPoints(scheduleId: number) {
        const schedule = await this.scheduleRepo.findOne({
            where: { id: scheduleId },
            relations: ['dropoffPoints'],
        });
        return schedule ? schedule.dropoffPoints : [];
    }

    // UPDATE STATUSES AUTOMATICALLY (CRON)
    async autoUpdateScheduleStatuses(currentTime: Date) {
        try {
            // 1. UPCOMING -> ONGOING when departureAt <= currentTime
            const ongoingResult = await this.scheduleRepo.createQueryBuilder()
                .update(Schedule)
                .set({ status: 'ONGOING' })
                .where('status = :status', { status: 'UPCOMING' })
                .andWhere('"departureAt" <= :time', { time: currentTime })
                .execute();

            // 2. ONGOING -> COMPLETED when arrivalAt <= currentTime
            const completedResult = await this.scheduleRepo.createQueryBuilder()
                .update(Schedule)
                .set({ status: 'COMPLETED' })
                .where('status = :status', { status: 'ONGOING' })
                .andWhere('"arrivalAt" <= :time', { time: currentTime })
                .execute();

            return {
                started: ongoingResult.affected || 0,
                completed: completedResult.affected || 0,
            };
        } catch (err) {
            console.error('[CRON Error] Failed to auto-update schedule statuses:', err);
            return { started: 0, completed: 0 };
        }
    }
}