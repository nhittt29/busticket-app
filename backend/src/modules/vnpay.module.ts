import { Module } from '@nestjs/common';
import { VnPayController } from '../controllers/vnpay.controller';
import { VnPayService } from '../services/vnpay.service';
import { TicketModule } from './ticket.module';
import { forwardRef } from '@nestjs/common';

@Module({
    imports: [
        forwardRef(() => TicketModule), // To avoid circular dependency if VnPayController needs TicketService
    ],
    controllers: [VnPayController],
    providers: [VnPayService],
    exports: [VnPayService],
})
export class VnPayModule { }
