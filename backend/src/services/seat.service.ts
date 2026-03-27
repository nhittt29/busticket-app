import { Injectable, OnModuleInit, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, QueryFailedError } from 'typeorm';
import { SeatRepository } from '../repositories/seat.repository';
import { SeatLock } from '../entities/SeatLock.entity';
import { Subject } from 'rxjs';

@Injectable()
export class SeatService implements OnModuleInit {
    private readonly LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    
    // SSE Stream for real-time updates
    private readonly updates$ = new Subject<{ scheduleId: number; locks: Record<number, { userId: string }> }>();

    constructor(
        private readonly seatRepo: SeatRepository,
        @InjectRepository(SeatLock)
        private readonly seatLockRepo: Repository<SeatLock>,
    ) { }

    private async broadcastUpdate(scheduleId: number) {
        console.log(`[SeatService] Broadcasting locks for schedule: ${scheduleId}`);
        const locks = await this.getLockedSeats(scheduleId);
        this.updates$.next({ scheduleId, locks });
    }

    onModuleInit() {
        // Cleanup expired locks every minute in Database
        setInterval(async () => {
            try {
                const now = new Date();
                // Find schedules that need refresh before deleting
                const expired = await this.seatLockRepo.find({
                    where: { expiresAt: LessThan(now) },
                    select: ['scheduleId']
                });
                
                if (expired.length > 0) {
                    await this.seatLockRepo.delete({ expiresAt: LessThan(now) });
                    // Notify unique schedules
                    const uniqueSchedules = [...new Set(expired.map(e => e.scheduleId))];
                    for (const sId of uniqueSchedules) {
                        await this.broadcastUpdate(sId);
                    }
                }
            } catch (err) {
                console.error("Cleanup error:", err);
            }
        }, 60000);
    }

    async getSeatsBySchedule(scheduleId: number) {
        return this.seatRepo.findSeatsByScheduleId(scheduleId);
    }

    // BROADCAST STREAM FOR SSE
    getUpdates() {
        return this.updates$.asObservable();
    }

    // New Locking Logic (Database Backed)
    async lockSeat(scheduleId: number, seatId: number, deviceId: string) {
        const now = new Date();
        
        const existingLock = await this.seatLockRepo.findOne({
            where: { scheduleId, seatId }
        });

        if (existingLock && existingLock.deviceId !== deviceId && existingLock.expiresAt > now) {
            return { success: false, message: 'Ghế này đang được người khác chọn' };
        }

        const expiresAt = new Date(Date.now() + this.LOCK_TIMEOUT);
        
        if (existingLock) {
            existingLock.deviceId = deviceId;
            existingLock.expiresAt = expiresAt;
            try {
                await this.seatLockRepo.save(existingLock);
            } catch (error) {
                if (error instanceof QueryFailedError) {
                    throw new ConflictException('Ghế này đã có người khác chọn rùi');
                }
                throw error;
            }
        } else {
            try {
                await this.seatLockRepo.save({ scheduleId, seatId, deviceId, expiresAt });
            } catch (error) {
                // Handle race condition: another user created the lock between our findOne and save
                if (error instanceof QueryFailedError) {
                    throw new ConflictException('Ghế này đã có người khác chọn rùi');
                }
                throw error;
            }
        }

        await this.broadcastUpdate(scheduleId);
        return { success: true };
    }

    // Unlock all seats for a specific device (e.g., when leaving the page)
    async unlockAllForDevice(scheduleId: number, deviceId: string) {
        await this.seatLockRepo.delete({ scheduleId, deviceId });
        this.broadcastUpdate(scheduleId);
    }

    async unlockSeat(scheduleId: number, seatId: number, deviceId: string) {
        await this.seatLockRepo.delete({ scheduleId, seatId, deviceId });
        await this.broadcastUpdate(scheduleId);
        return { success: true };
    }

    async getLockedSeats(scheduleId: number) {
        const now = new Date();
        const locks = await this.seatLockRepo.find({
            where: { scheduleId }
        });

        const result: Record<number, { userId: string }> = {};
        for (const lock of locks) {
            if (lock.expiresAt > now) {
                // We use 'userId' key to maintain compatibility with frontend, 
                // but we pass the 'deviceId' as the value.
                result[lock.seatId] = { userId: lock.deviceId };
            }
        }
        return result;
    }
}