import { Controller, Get, Post, Body, Param, ParseIntPipe, Sse, MessageEvent } from '@nestjs/common';
import { SeatService } from '../services/seat.service';
import { Observable, filter, map, interval, merge, startWith } from 'rxjs';

@Controller('seats')
export class SeatController {
  constructor(private readonly seatService: SeatService) { }

  @Get('by-schedule/:scheduleId')
  async getSeatsBySchedule(@Param('scheduleId', ParseIntPipe) scheduleId: number) {
    return this.seatService.getSeatsBySchedule(scheduleId);
  }

  // SSE (Server-Sent Events) for real-time seat sync
  @Sse('sse/:scheduleId')
  sse(@Param('scheduleId', ParseIntPipe) scheduleId: number): Observable<MessageEvent> {
    console.log(`[SSE] New connection request for schedule: ${scheduleId}`);
    // 1. Welcome & Initial data push
    const welcome$ = new Observable<MessageEvent>(subscriber => {
      subscriber.next({ data: { type: 'CONNECTED', scheduleId } });
      subscriber.complete();
    });

    // 2. Real-time updates push
    const updates$ = this.seatService.getUpdates().pipe(
      filter(update => update.scheduleId === scheduleId),
      map(update => ({ data: { type: 'UPDATE_LOCKS', locks: update.locks } }))
    );

    // 3. Keep-alive heartbeat every 20 seconds
    const heartbeat$ = interval(20000).pipe(
      map(() => ({ data: { type: 'HEARTBEAT' } }))
    );

    return merge(welcome$, updates$, heartbeat$);
  }

  @Post('lock')
  async lockSeat(
    @Body() body: { scheduleId: number; seatId: number; deviceId: string }
  ) {
    return this.seatService.lockSeat(body.scheduleId, body.seatId, body.deviceId);
  }

  @Post('unlock-all')
  async unlockAll(@Body() body: { scheduleId: number; deviceId: string }) {
    return this.seatService.unlockAllForDevice(body.scheduleId, body.deviceId);
  }

  @Post('unlock')
  async unlockSeat(
    @Body() body: { scheduleId: number; seatId: number; deviceId: string }
  ) {
    return this.seatService.unlockSeat(body.scheduleId, body.seatId, body.deviceId);
  }

  @Get('locks/:scheduleId')
  async getLocks(@Param('scheduleId', ParseIntPipe) scheduleId: number) {
    return this.seatService.getLockedSeats(scheduleId);
  }
}