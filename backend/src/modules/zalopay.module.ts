import { Module, forwardRef } from '@nestjs/common';
import { ZaloPayController } from '../controllers/zalopay.controller';
import { ZaloPayService } from '../services/zalopay.service';
import { PrismaService } from '../services/prisma.service';
import { TicketModule } from './ticket.module';

@Module({
    imports: [forwardRef(() => TicketModule)], // Import TicketModule
    controllers: [ZaloPayController],
    providers: [ZaloPayService, PrismaService],
    exports: [ZaloPayService],
})
export class ZaloPayModule { }
