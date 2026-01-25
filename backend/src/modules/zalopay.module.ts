import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZaloPayController } from '../controllers/zalopay.controller';
import { ZaloPayService } from '../services/zalopay.service';
import { PaymentHistoryRepository } from '../repositories/payment-history.repository';
import { PaymentHistory } from '../entities/PaymentHistory.entity';
import { TicketModule } from './ticket.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PaymentHistory]),
        forwardRef(() => TicketModule)
    ],
    controllers: [ZaloPayController],
    providers: [ZaloPayService, PaymentHistoryRepository],
    exports: [ZaloPayService],
})
export class ZaloPayModule { }
