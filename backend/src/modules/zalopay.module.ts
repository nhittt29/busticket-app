import { Module } from '@nestjs/common';
import { ZaloPayController } from '../controllers/zalopay.controller';
import { ZaloPayService } from '../services/zalopay.service';
import { PrismaService } from '../services/prisma.service';

@Module({
    controllers: [ZaloPayController],
    providers: [ZaloPayService, PrismaService],
    exports: [ZaloPayService],
})
export class ZaloPayModule { }
