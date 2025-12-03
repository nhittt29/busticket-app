import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateTicketDto } from '../dtos/ticket.dto';
import { TicketStatus, PaymentMethod } from '../models/Ticket';
import { MomoService } from './momo.service';
import { BulkCreateResponse } from '../dtos/ticket.response.dto';

@Injectable()
export class TicketService {
    constructor(
        private prism: PrismaService,
        private momoService: MomoService,
    ) { }

    async getAllTickets() {
        return this.prism.ticket.findMany({
            include: {
                user: true,
                schedule: {
                    include: {
                        route: true,
                        bus: { include: { brand: true } },
                    },
                },
                seat: true,
            },
        });
    }

    async create(dto: CreateTicketDto) {
        // 1. Kiểm tra ghế đã được đặt chưa
        const existingTicket = await this.prism.ticket.findFirst({
            where: {
                scheduleId: dto.scheduleId,
                seatId: dto.seatId,
                status: { not: TicketStatus.CANCELLED },
            },
        });

        if (existingTicket) {
            throw new Error('Ghế này đã được đặt');
        }

        // 2. Lấy thông tin lịch trình để tính giá
        const schedule = await this.prism.schedule.findUnique({
            where: { id: dto.scheduleId },
            include: { route: true },
        });

        if (!schedule) {
            throw new Error('Lịch trình không tồn tại');
        }

        // 3. Tạo nhóm thanh toán (PaymentHistory)
        const paymentGroup = await this.prism.paymentHistory.create({
            data: {
                method: PaymentMethod.MOMO,
                amount: 0, // Sẽ cập nhật sau
                status: 'PENDING',
                ticketCode: `V${Date.now()}`, // Mã tạm
                seatCount: 1,
                seatList: '', // Sẽ cập nhật
            },
        });

        // 4. Tính phụ thu điểm trả (nếu có)
        let surcharge = 0;
        let dropoffAddress: string | undefined = dto.dropoffAddress;
        let dropoffPointId = dto.dropoffPointId;

        if (dropoffPointId) {
            const point = await this.prism.dropoffPoint.findUnique({ where: { id: dropoffPointId } });
            if (point) {
                surcharge = point.surcharge;
                dropoffAddress = point.address || undefined;
            }
        }

        const totalAmount = schedule.route.lowestPrice + surcharge;

        // 5. Tạo vé
        const ticket = await this.prism.ticket.create({
            data: {
                userId: dto.userId,
                scheduleId: dto.scheduleId,
                seatId: dto.seatId,
                price: schedule.route.lowestPrice,
                surcharge: surcharge,
                totalPrice: totalAmount,
                status: TicketStatus.BOOKED,
                paymentMethod: PaymentMethod.MOMO,
                dropoffPointId: dropoffPointId,
                dropoffAddress: dropoffAddress,
                paymentHistoryId: paymentGroup.id,
            },
            include: { seat: true },
        });

        // 6. Cập nhật PaymentHistory
        await this.prism.paymentHistory.update({
            where: { id: paymentGroup.id },
            data: {
                amount: totalAmount,
                seatList: ticket.seat.seatNumber.toString(),
            },
        });

        // 7. Tạo link thanh toán MoMo
        const momoResponse = await this.momoService.createPayment(
            paymentGroup.id,
            totalAmount,
            `Thanh toán vé xe #${ticket.id}${surcharge > 0 ? ' + trả khách' : ''}`,
        );

        if (momoResponse && momoResponse.payUrl) {
            await this.prism.paymentHistory.update({
                where: { id: paymentGroup.id },
                data: { payUrl: momoResponse.payUrl },
            });
        }

        return {
            ticket,
            payUrl: momoResponse?.payUrl,
        };
    }

    async createBulk(dtos: CreateTicketDto[], totalAmount: number, promotionId?: number, discountAmount: number = 0): Promise<BulkCreateResponse> {
        if (dtos.length === 0) throw new Error('Danh sách vé trống');

        const scheduleId = dtos[0].scheduleId;
        const userId = dtos[0].userId;

        // 1. Kiểm tra tất cả ghế
        const seatIds = dtos.map(d => d.seatId);
        const existingTickets = await this.prism.ticket.findMany({
            where: {
                scheduleId: scheduleId,
                seatId: { in: seatIds },
                status: { not: TicketStatus.CANCELLED },
            },
        });

        if (existingTickets.length > 0) {
            throw new Error('Một số ghế đã được đặt');
        }

        // 2. Lấy thông tin lịch trình
        const schedule = await this.prism.schedule.findUnique({
            where: { id: scheduleId },
            include: { route: true },
        });

        if (!schedule) throw new Error('Lịch trình không tồn tại');

        // 3. Tạo PaymentHistory group
        const paymentGroup = await this.prism.paymentHistory.create({
            data: {
                method: PaymentMethod.MOMO,
                amount: 0, // Update sau
                status: 'PENDING',
                ticketCode: `GRP${Date.now()}`,
                seatCount: dtos.length,
                seatList: '', // Update sau
            },
        });

        // 4. Tạo từng vé
        let calculatedTotal = 0;
        const createdTickets: any[] = [];
        const seatNumbers: number[] = [];
        let surchargePerTicket = 0;

        for (const dto of dtos) {
            // Xử lý điểm trả khách
            let surcharge = 0;
            let dropoffAddress: string | undefined = dto.dropoffAddress;
            let dropoffPointId = dto.dropoffPointId;

            if (dropoffPointId) {
                const point = await this.prism.dropoffPoint.findUnique({ where: { id: dropoffPointId } });
                if (point) {
                    surcharge = point.surcharge;
                    dropoffAddress = point.address || undefined;
                }
            }
            surchargePerTicket = surcharge; // Giả sử giống nhau

            const ticketPrice = schedule.route.lowestPrice + surcharge;
            calculatedTotal += ticketPrice;

            const seat = await this.prism.seat.findUnique({ where: { id: dto.seatId } });
            if (!seat) throw new Error('Ghế không tồn tại');
            seatNumbers.push(seat.seatNumber);

            const ticket = await this.prism.ticket.create({
                data: {
                    userId: userId,
                    scheduleId: scheduleId,
                    seatId: dto.seatId,
                    price: schedule.route.lowestPrice,
                    surcharge: surcharge,
                    totalPrice: ticketPrice,
                    status: TicketStatus.BOOKED,
                    paymentMethod: PaymentMethod.MOMO,
                    dropoffPointId: dropoffPointId,
                    dropoffAddress: dropoffAddress,
                    paymentHistoryId: paymentGroup.id,
                },
            });
            createdTickets.push(ticket);
        }

        // Áp dụng giảm giá (nếu có)
        if (discountAmount > 0) {
            calculatedTotal = Math.max(0, calculatedTotal - discountAmount);
        }

        // 5. Cập nhật PaymentHistory
        await this.prism.paymentHistory.update({
            where: { id: paymentGroup.id },
            data: {
                amount: calculatedTotal,
                seatList: seatNumbers.join(', '),
            },
        });

        // 6. Tạo link thanh toán MoMo cho cả nhóm
        const momoResponse = await this.momoService.createPayment(
            paymentGroup.id,
            calculatedTotal,
            `Thanh toán ${dtos.length} vé${surchargePerTicket > 0 ? ' + trả khách' : ''} - ${calculatedTotal.toLocaleString('vi-VN')}đ`,
        );

        if (momoResponse && momoResponse.payUrl) {
            await this.prism.paymentHistory.update({
                where: { id: paymentGroup.id },
                data: { payUrl: momoResponse.payUrl },
            });
        }

        return {
            tickets: createdTickets,
            paymentHistoryId: paymentGroup.id,
            payUrl: momoResponse?.payUrl,
        };
    }

    async getTicketById(id: number) {
        const ticket = await this.prism.ticket.findUnique({
            where: { id },
            include: {
                user: true,
                schedule: {
                    include: {
                        route: true,
                        bus: { include: { brand: true } },
                    },
                },
                seat: true,
                dropoffPoint: true,
            },
        });

        if (!ticket) throw new NotFoundException('Vé không tồn tại');
        return ticket;
    }

    async handleMomoRedirect(query: any) {
        // query: { partnerCode, orderId, requestId, amount, orderInfo, orderType, transId, resultCode, message, payType, responseTime, extraData, signature }
        const paymentHistoryId = Number(query.orderId.split('_')[0]); // orderId format: ID_timestamp
        const resultCode = Number(query.resultCode);

        if (resultCode === 0) {
            // Thành công
            await this.prism.paymentHistory.update({
                where: { id: paymentHistoryId },
                data: {
                    status: 'SUCCESS',
                    transactionId: query.transId,
                    paidAt: new Date(),
                },
            });

            // Cập nhật trạng thái các vé con
            await this.prism.ticket.updateMany({
                where: { paymentHistoryId: paymentHistoryId },
                data: { status: TicketStatus.PAID },
            });

            return { success: true, paymentHistoryId };
        } else {
            // Thất bại
            await this.prism.paymentHistory.update({
                where: { id: paymentHistoryId },
                data: { status: 'FAILED' },
            });
            return { success: false };
        }
    }

    async handleMomoCallback(data: any) {
        // Xử lý IPN từ MoMo (tương tự redirect nhưng bảo mật hơn)
        console.log('Momo Callback:', data);
        // Cần verify signature ở đây (bỏ qua cho demo)
        const paymentHistoryId = Number(data.orderId.split('_')[0]);
        const resultCode = Number(data.resultCode);

        if (resultCode === 0) {
            await this.prism.paymentHistory.update({
                where: { id: paymentHistoryId },
                data: {
                    status: 'SUCCESS',
                    transactionId: data.transId,
                    paidAt: new Date(),
                },
            });

            await this.prism.ticket.updateMany({
                where: { paymentHistoryId: paymentHistoryId },
                data: { status: TicketStatus.PAID },
            });
        }
        return { message: 'Received' };
    }

    async cancel(id: number) {
        return this.prism.ticket.update({
            where: { id },
            data: { status: TicketStatus.CANCELLED },
        });
    }

    async payTicket(id: number, method: PaymentMethod) {
        return this.prism.ticket.update({
            where: { id },
            data: {
                status: TicketStatus.PAID,
                paymentMethod: method,
            },
        });
    }

    async getTicketsByUser(userId: number) {
        return this.prism.ticket.findMany({
            where: { userId },
            include: {
                schedule: {
                    include: {
                        route: true,
                        bus: { include: { brand: true } },
                    },
                },
                seat: true,
                dropoffPoint: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getStatus(id: number) {
        const ticket = await this.prism.ticket.findUnique({
            where: { id },
            select: { status: true },
        });
        return { status: ticket?.status };
    }

    async getPaymentHistory(ticketId: number) {
        const ticket = await this.prism.ticket.findUnique({
            where: { id: ticketId },
        });

        if (!ticket || !ticket.paymentHistoryId) return null;

        const payment = await this.prism.paymentHistory.findUnique({
            where: { id: ticket.paymentHistoryId },
            include: {
                tickets: {
                    include: { seat: true }
                }
            }
        });

        if (!payment) return null;

        // Tính toán thông tin khuyến mãi
        const ticketsInGroup = payment.tickets;
        const originalPrice = ticketsInGroup.reduce((sum, t) => sum + t.totalPrice, 0);
        const discountAmount = Math.max(0, originalPrice - payment.amount);

        return {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            qrCode: payment.qrCode,
            ticketCode: payment.ticketCode,
            seatList: payment.seatList,
            createdAt: payment.createdAt,
            method: payment.method,
            originalPrice: originalPrice, // Giá gốc
            discountAmount: discountAmount, // Số tiền giảm
            tickets: payment.tickets.map(t => ({
                id: t.id,
                seatNumber: t.seat.seatNumber,
                price: t.totalPrice,
            })),
        };
    }

    async getPaymentDetailByHistoryId(id: number) {
        const payment = await this.prism.paymentHistory.findUnique({
            where: { id },
            include: {
                tickets: {
                    include: {
                        seat: true,
                        schedule: {
                            include: {
                                route: true,
                                bus: { include: { brand: true } }
                            }
                        },
                        dropoffPoint: true,
                    }
                }
            }
        });

        if (!payment) throw new NotFoundException('Payment not found');

        // Tính toán thông tin khuyến mãi
        const ticketsInGroup = payment.tickets;
        const originalPrice = ticketsInGroup.reduce((sum, t) => sum + t.totalPrice, 0);
        const discountAmount = Math.max(0, originalPrice - payment.amount);

        return {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            qrCode: payment.qrCode,
            ticketCode: payment.ticketCode,
            seatList: payment.seatList,
            createdAt: payment.createdAt,
            method: payment.method,
            payUrl: payment.payUrl,
            originalPrice: originalPrice, // Giá gốc
            discountAmount: discountAmount, // Số tiền giảm
            tickets: payment.tickets.map(t => ({
                id: t.id,
                seatNumber: t.seat.seatNumber,
                price: t.totalPrice,
                schedule: t.schedule,
                dropoffPoint: t.dropoffPoint,
                dropoffAddress: t.dropoffAddress,
                surcharge: t.surcharge,
            })),
        };
    }

    // LẤY DANH SÁCH BOOKING CHO ADMIN – HIỂN THỊ THEO NHÓM THANH TOÁN
    async getAllBookingsForAdmin() {
        const bookings = await this.prism.paymentHistory.findMany({
            include: {
                tickets: {
                    include: {
                        user: true,
                        schedule: {
                            include: {
                                route: true,
                                bus: { include: { brand: true } },
                                dropoffPoints: true,
                            },
                        },
                        seat: true,
                        dropoffPoint: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return bookings.map(booking => {
            const firstTicket = booking.tickets[0];
            if (!firstTicket) return null;

            const originalPrice = booking.tickets.reduce((sum, t) => sum + t.totalPrice, 0);
            const discountAmount = Math.max(0, originalPrice - booking.amount);

            return {
                id: booking.id,
                ticketCode: `V${String(booking.id).padStart(6, '0')}`,
                user: firstTicket.user,
                schedule: firstTicket.schedule,
                seatCount: booking.tickets.length,
                seatList: booking.tickets.map(t => t.seat.seatNumber).sort((a, b) => a - b).join(', '),
                totalPrice: booking.amount,
                originalPrice: originalPrice,
                discountAmount: discountAmount,
                status: booking.status === 'SUCCESS' ? TicketStatus.PAID : (booking.status === 'PENDING' ? TicketStatus.BOOKED : TicketStatus.CANCELLED),
                createdAt: booking.createdAt,
                paymentMethod: booking.method,
                tickets: booking.tickets,
            };
        }).filter(Boolean);
    }

    // LẤY CHI TIẾT MỘT BOOKING THEO ID – DÀNH CHO ADMIN XEM ĐƠN
    async getBookingById(id: number) {
        const booking = await this.prism.paymentHistory.findUnique({
            where: { id },
            include: {
                tickets: {
                    include: {
                        user: true,
                        schedule: {
                            include: {
                                route: true,
                                bus: { include: { brand: true } },
                                dropoffPoints: true,
                            },
                        },
                        seat: true,
                        dropoffPoint: true,
                    },
                },
            },
        });

        if (!booking) throw new NotFoundException('Booking not found');

        const firstTicket = booking.tickets[0];
        if (!firstTicket) throw new NotFoundException('Booking has no tickets');

        const originalPrice = booking.tickets.reduce((sum, t) => sum + t.totalPrice, 0);
        const discountAmount = Math.max(0, originalPrice - booking.amount);

        return {
            id: booking.id,
            ticketCode: `V${String(booking.id).padStart(6, '0')}`,
            user: firstTicket.user,
            schedule: firstTicket.schedule,
            seatCount: booking.tickets.length,
            seatList: booking.tickets.map(t => t.seat.seatNumber).sort((a, b) => a - b).join(', '),
            totalPrice: booking.amount,
            originalPrice: originalPrice,
            discountAmount: discountAmount,
            status: booking.status === 'SUCCESS' ? TicketStatus.PAID : (booking.status === 'PENDING' ? TicketStatus.BOOKED : TicketStatus.CANCELLED),
            createdAt: booking.createdAt,
            paymentMethod: booking.method,
            tickets: booking.tickets,
        };
    }
}