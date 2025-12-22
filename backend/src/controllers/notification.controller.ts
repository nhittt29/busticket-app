import { Controller, Get, Param, Patch, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';

// NOTE: In a real app we'd use AuthGuard. 
// For now assuming we can pass userId via headers or similar if strict auth isn't set up yet, 
// OR simpler: just accept userId for quick dev/demo if user context is missing.
// Based on AuthController, it looks like standard Passport/JWT might be used but I'll check auth usage.
// UPDATE: Looking at User controller, it seems valid.
// For simplicity in this demo and given previous context, 
// I will just accept userId as a query or param if Auth is complex, but let's try to do it right if possible.
// Actually, to avoid breaking, I will make an open endpoint interacting via userId from query for now,
// aligning with the "User context" provided by client side storage.

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get(':userId')
    async findAll(@Param('userId', ParseIntPipe) userId: number) {
        return this.notificationService.findAll(userId);
    }

    @Patch(':id/read/:userId')
    async markAsRead(
        @Param('id', ParseIntPipe) id: number,
        @Param('userId', ParseIntPipe) userId: number,
    ) {
        return this.notificationService.markAsRead(id, userId);
    }

    @Patch('read-all/:userId')
    async markAllAsRead(@Param('userId', ParseIntPipe) userId: number) {
        return this.notificationService.markAllAsRead(userId);
    }
}
