import { Controller, Get, Query, Param, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { OracleAdvancedService } from '../services/oracle-advanced.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';


@ApiTags('Oracle DB Nâng Cao')
@Controller('oracle-advanced')
export class OracleAdvancedController {
  constructor(private readonly oracleAdvancedService: OracleAdvancedService) {}

  @Get('ticket-details-view')
  @ApiOperation({ summary: '1. Gọi VIEW: Xem chi tiết vé tổng hợp' })
  async getTicketDetailsView() {
    return this.oracleAdvancedService.getTicketDetailsView();
  }

  @Get('revenue-by-user/:id')
  @ApiOperation({ summary: '2. Gọi FUNCTION: Tính doanh thu theo khách hàng' })
  async getRevenueByUser(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new HttpException('ID khách hàng không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    const revenue = await this.oracleAdvancedService.getRevenueByUser(userId);
    return { userId, totalRevenue: revenue };
  }

  @Get('tickets-by-date')
  @ApiOperation({ summary: '3. Gọi PROCEDURE: Lấy danh sách vé theo ngày' })
  async getTicketsByDate(@Query('date') date: string) {
    if (!date) {
      throw new HttpException('Thiếu tham số định dạng ngày (YYYY-MM-DD)', HttpStatus.BAD_REQUEST);
    }
    return this.oracleAdvancedService.getTicketsByDate(date);
  }

  @Get('trigger-simulate')
  @ApiOperation({ summary: '4. Gọi TRIGGER: Sinh lỗi tranh chấp vé để lấy lỗi 20001 (Nếu chưa bắt ngoài luồng)' })
  async simulateTrigger() {
     // Optional endpoint to simulate testing if Needed.
     // In an actual flow, if someone books, the existing Ticket Booking catches the trigger.
     return { message: 'Trigger được tự động kích hoạt khi 2 giao dịch tạo vé (Insert Ticket) trùng Seat và Schedule cùng lúc.' };
  }

  @Get('recent-bookings')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '5. Gọi PACKAGE: Lấy danh sách vé gần đây nhất' })
  async getRecentBookings(@Query('limit') limit: string, @Req() req: any) {
    const l = parseInt(limit, 10) || 5;
    const userId = req.user?.dbUser?.id || null;
    return this.oracleAdvancedService.getRecentBookings(l, userId);
  }

  @Get('action-logs')
  @ApiOperation({ summary: '5. Lấy SEQUENCE & TABLE: Nhật ký hành động do Package tự sinh' })
  async getActionLogs() {
    return this.oracleAdvancedService.getActionLogs();
  }
}
