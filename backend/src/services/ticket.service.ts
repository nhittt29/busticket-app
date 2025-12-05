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

<<<<<<< HEAD
  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly prism: PrismaService,
    private readonly momoService: MomoService,
    private readonly emailService: EmailService,
    private readonly qrService: QrService,
    @InjectQueue('ticket') private readonly ticketQueue: Queue,
  ) { }

  // ĐẶT VÉ LẺ – KIỂM TRA TOÀN DIỆN: GIỜ KHỞI HÀNH, GHẾ TRÙNG, GIỚI HẠN NGÀY, PHỤ THU TRẢ KHÁCH
  async create(dto: CreateTicketDto): Promise<CreateResponse> {
    const { userId, scheduleId, seatId, price, paymentMethod, dropoffPointId, dropoffAddress } = dto;

    const schedule = await this.prism.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        bus: { include: { brand: true } },
        dropoffPoints: { orderBy: { order: 'asc' } },
      },
    });
    if (!schedule) throw new NotFoundException('Lịch trình không tồn tại');

    const diffHours = (new Date(schedule.departureAt).getTime() - Date.now()) / 3600000;
    if (diffHours < 1) throw new BadRequestException('Chỉ được đặt vé trước 1 giờ khởi hành');

    const seat = await this.prism.seat.findUnique({ where: { id: seatId } });
    if (!seat || seat.busId !== schedule.busId)
      throw new BadRequestException('Ghế không thuộc xe của lịch trình này');

    const seatBooked = await this.ticketRepo.checkSeatBooked(scheduleId, seatId);
    if (seatBooked) throw new BadRequestException('Ghế đã được đặt');

    const userTickets = await this.ticketRepo.findUserBookedToday(userId);
    if (userTickets >= 8) throw new BadRequestException('Chỉ được đặt tối đa 8 vé/ngày');

    const brandTickets = await this.ticketRepo.countBrandSoldToday(schedule.bus.brandId);
    if (brandTickets >= schedule.bus.brand.dailyTicketLimit)
      throw new BadRequestException('Hãng xe đã đạt giới hạn vé trong ngày');

    // XỬ LÝ ĐIỂM TRẢ + PHỤ THU
    let surcharge = 0;
    let finalDropoffPointId: number | null = null;
    let finalDropoffAddress: string | null = null;

    if (dropoffPointId != null) {
      const point = schedule.dropoffPoints.find(p => p.id === dropoffPointId);
      if (!point) throw new BadRequestException('Điểm trả không hợp lệ');
      surcharge = point.surcharge;
      finalDropoffPointId = point.id;
    } else if (dropoffAddress && dropoffAddress.trim() !== '') {
      surcharge = 150000;
      finalDropoffAddress = dropoffAddress.trim();
    } else {
      const defaultPoint = schedule.dropoffPoints.find(p => p.isDefault);
      finalDropoffPointId = defaultPoint?.id ?? null;
    }

    const totalAmount = price + surcharge;

    const paymentGroup = await this.prism.paymentHistory.create({
      data: {
        method: paymentMethod || AppPaymentMethod.MOMO,
        amount: totalAmount,
        status: 'PENDING',
      },
    });

    const ticket = await this.prism.ticket.create({
      data: {
        userId,
        scheduleId,
        seatId,
        price,
        surcharge,
        totalPrice: totalAmount,
        status: TicketStatus.BOOKED,
        paymentMethod: paymentMethod || AppPaymentMethod.MOMO,
        dropoffPointId: finalDropoffPointId,
        dropoffAddress: finalDropoffAddress,
        paymentHistoryId: paymentGroup.id,
      },
    });

    await this.prism.ticketPayment.create({
      data: { ticketId: ticket.id, paymentId: paymentGroup.id },
    });

    await this.ticketQueue.add(
      'hold-expire',
      { ticketId: ticket.id },
      { delay: 15 * 60 * 1000 },
    );

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
      message: 'Đặt vé thành công. Vui lòng thanh toán trong 15 phút.',
      ticket,
      payment: momoResponse,
    };
  }

  // ĐẶT NHIỀU VÉ CÙNG LÚC (CHỌN NHIỀU GHẾ) – TỐI ƯU CHO ĐẶT VÉ ONLINE
  async createBulk(
    dtos: CreateTicketDto[],
    totalAmountFromClient: number,
    promotionId?: number,
    discountAmount?: number,
  ): Promise<BulkCreateResponse> {
    if (dtos.length === 0) throw new BadRequestException('Danh sách vé trống');

    const firstDto = dtos[0];
    const schedule = await this.prism.schedule.findUnique({
      where: { id: firstDto.scheduleId },
      include: {
        bus: { include: { brand: true } },
        dropoffPoints: { orderBy: { order: 'asc' } },
      },
    });
    if (!schedule) throw new NotFoundException('Lịch trình không tồn tại');

    const dropoffPointId = firstDto.dropoffPointId;
    const dropoffAddress = firstDto.dropoffAddress?.trim();

    let surchargePerTicket = 0;
    let finalDropoffPointId: number | null = null;
    let finalDropoffAddress: string | null = null;

    if (dropoffPointId != null) {
      const point = schedule.dropoffPoints.find(p => p.id === dropoffPointId);
      if (!point) throw new BadRequestException('Điểm trả không hợp lệ');
      surchargePerTicket = point.surcharge;
      finalDropoffPointId = point.id;
    } else if (dropoffAddress && dropoffAddress !== '') {
      surchargePerTicket = 150000;
      finalDropoffAddress = dropoffAddress;
    } else {
      const defaultPoint = schedule.dropoffPoints.find(p => p.isDefault);
      finalDropoffPointId = defaultPoint?.id ?? null;
    }

    let calculatedTotal = dtos.reduce((sum, d) => sum + d.price, 0) + (surchargePerTicket * dtos.length);

    // Áp dụng giảm giá nếu có
    if (discountAmount && discountAmount > 0) {
      calculatedTotal -= discountAmount;
      if (calculatedTotal < 0) calculatedTotal = 0;
    }

    const paymentGroup = await this.prism.paymentHistory.create({
      data: {
        method: firstDto.paymentMethod || AppPaymentMethod.MOMO,
        amount: calculatedTotal,
        status: 'PENDING',
        promotionId: promotionId || null,
        discountAmount: discountAmount || 0,
      },
    });

    const createdTickets: any[] = [];

    for (const dto of dtos) {
      const diffHours = (new Date(schedule.departureAt).getTime() - Date.now()) / 3600000;
      if (diffHours < 1) throw new BadRequestException('Chỉ được đặt vé trước 1 giờ khởi hành');

      const seat = await this.prism.seat.findUnique({ where: { id: dto.seatId } });
      if (!seat || seat.busId !== schedule.busId)
        throw new BadRequestException('Ghế không thuộc xe');

      const seatBooked = await this.ticketRepo.checkSeatBooked(dto.scheduleId, dto.seatId);
      if (seatBooked) throw new BadRequestException('Ghế đã được đặt');

      const userTickets = await this.ticketRepo.findUserBookedToday(dto.userId);
      if (userTickets >= 8) throw new BadRequestException('Chỉ được đặt tối đa 8 vé/ngày');

      const brandTickets = await this.ticketRepo.countBrandSoldToday(schedule.bus.brandId);
      if (brandTickets >= schedule.bus.brand.dailyTicketLimit)
        throw new BadRequestException('Hãng xe đã đạt giới hạn vé trong ngày');

      const ticketTotal = dto.price + surchargePerTicket;

      const ticket = await this.prism.ticket.create({
        data: {
          userId: dto.userId,
          scheduleId: dto.scheduleId,
          seatId: dto.seatId,
          price: dto.price,
          surcharge: surchargePerTicket,
          totalPrice: ticketTotal,
          status: TicketStatus.BOOKED,
          paymentMethod: dto.paymentMethod || AppPaymentMethod.MOMO,
          dropoffPointId: finalDropoffPointId,
          dropoffAddress: finalDropoffAddress,
          paymentHistoryId: paymentGroup.id,
        },
      });

      await this.prism.ticketPayment.create({
        data: { ticketId: ticket.id, paymentId: paymentGroup.id },
      });

      await this.ticketQueue.add(
        'hold-expire',
        { ticketId: ticket.id },
        { delay: 15 * 60 * 1000 },
      );

      createdTickets.push(ticket);
    }

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
      payment: momoResponse,
    };
  }

  // XỬ LÝ REDIRECT TỪ MOMO SAU KHI KHÁCH THANH TOÁN (THÀNH CÔNG / THẤT BẠI)
  async handleMomoRedirect(query: any) {
    this.logger.log(`MoMo Redirect: ${JSON.stringify(query)}`);
    const { resultCode, orderId, transId } = query;
    if (resultCode !== '0') {
      return { success: false, message: 'Thanh toán thất bại' };
    }
    const match = orderId?.match(/^TICKET_(\d+)_\d+$/);
    if (!match) throw new BadRequestException('orderId không hợp lệ');
    const paymentHistoryId = Number(match[1]);
    try {
      await this.payTicket(paymentHistoryId, AppPaymentMethod.MOMO, transId);
      return { success: true, paymentHistoryId };
    } catch (error) {
      this.logger.error(`payTicket failed for payment #${paymentHistoryId}:`, error);
      throw error;
    }
  }

  // NHẬN CALLBACK (IPN) TỪ MOMO – XÁC NHẬN THANH TOÁN TỪ SERVER MOMO (AN TOÀN NHẤT)
  async handleMomoCallback(data: any) {
    this.logger.log(`MoMo IPN: ${JSON.stringify(data)}`);
    if (data.resultCode !== 0) {
      return { success: false, message: data.message || 'Thanh toán thất bại' };
    }
    const match = data.orderId.match(/^TICKET_(\d+)_\d+$/);
    if (!match) {
      return { success: false, message: 'orderId không hợp lệ' };
    }
    const paymentHistoryId = Number(match[1]);
    const payment = await this.prism.paymentHistory.findUnique({
      where: { id: paymentHistoryId },
    });
    if (!payment) return { success: false, message: 'Không tìm thấy đơn thanh toán' };
    if (payment.status === 'SUCCESS') {
      return { success: true, paymentHistoryId };
    }
    try {
      await this.payTicket(paymentHistoryId, AppPaymentMethod.MOMO, data.transId);
      return { success: true, paymentHistoryId };
    } catch (error) {
      this.logger.error(`payTicket failed in callback:`, error);
      return { success: false, message: 'Xử lý thanh toán thất bại' };
    }
  }

  // XỬ LÝ THANH TOÁN THÀNH CÔNG – CẬP NHẬT TRẠNG THÁI, TẠO QR, GỬI EMAIL, HỦY JOB HẾT HẠN
  async payTicket(paymentHistoryId: number, method: AppPaymentMethod, transId?: string) {
    this.logger.log(`Thanh toán nhóm vé từ paymentHistoryId #${paymentHistoryId}`);
    const paymentHistory = await this.prism.paymentHistory.findUnique({
      where: { id: paymentHistoryId },
      include: {
        ticketPayments: {
          include: {
            ticket: {
              include: {
                seat: true,
=======
    async getAllTickets() {
        return this.prism.ticket.findMany({
            include: {
>>>>>>> c9cddcb477d486f593c5a5c3fb56875c99670747
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

<<<<<<< HEAD
    return {
      ticketCode: `V${String(payment.id).padStart(6, '0')}`,
      route: `${ticketsInGroup[0].schedule.route.startPoint} to ${ticketsInGroup[0].schedule.route.endPoint}`,
      departureTime: `${String(departure.getHours()).padStart(2, '0')}:${String(departure.getMinutes()).padStart(2, '0')}, ${departure.toLocaleDateString('vi-VN')}`,
      seatNumber: ticketsInGroup.length === 1 ? String(ticketsInGroup[0].seat.seatNumber) : `${ticketsInGroup.length} ghế`,
      price: `${payment.amount.toLocaleString('vi-VN')}đ`,
      paymentMethod: this.formatPaymentMethod(payment.method),
      status: payment.status === 'SUCCESS' ? 'Đã thanh toán' : 'Thất bại',
      paidAt: payment.paidAt
        ? `${payment.paidAt.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${payment.paidAt.toLocaleDateString('vi-VN')}`
        : '—',
      transactionId: payment.transactionId || '—',
      qrCode: payment.qrCode ?? null,
      paymentHistoryId: payment.id,
      ticketIds: ticketsInGroup.map(t => t.id),
      discountAmount: payment.discountAmount || 0,
    };
  }
=======
        // 2. Lấy thông tin lịch trình
        const schedule = await this.prism.schedule.findUnique({
            where: { id: scheduleId },
            include: { route: true },
        });
>>>>>>> c9cddcb477d486f593c5a5c3fb56875c99670747

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

<<<<<<< HEAD
    if (!payment || payment.ticketPayments.length === 0)
      throw new NotFoundException('Không tìm thấy thông tin thanh toán theo paymentHistoryId');

    const ticketsInGroup = payment.ticketPayments.map(tp => tp.ticket);
    const firstTicket = ticketsInGroup[0];
    const departure = new Date(firstTicket.schedule.departureAt);

    const sortedSeats = ticketsInGroup
      .map(t => t.seat.seatNumber)
      .sort((a, b) => a - b)
      .join(', ');

    const dropoffInfo = this.formatDropoffInfo(firstTicket);

    const promotion = payment.promotionId
      ? await this.prism.promotion.findUnique({ where: { id: payment.promotionId } })
      : null;

    return {
      startPoint: firstTicket.schedule.route.startPoint,
      endPoint: firstTicket.schedule.route.endPoint,
      departureTime: departure.toISOString(),
      price: payment.amount.toString(),
      qrCode: payment.qrCode,
      status: payment.status === 'SUCCESS' ? 'Đã thanh toán' : 'Chưa thanh toán',
      paidAt: payment.paidAt?.toISOString() || null,
      transactionId: payment.transactionId || null,
      paymentMethod: this.formatPaymentMethod(payment.method),
      ticketCode: `V${String(payment.id).padStart(6, '0')}`,
      seatList: sortedSeats,
      seatCount: ticketsInGroup.length,
      ticketIds: ticketsInGroup.map(t => t.id),
      dropoffInfo: {
        type: dropoffInfo.type,
        display: dropoffInfo.display,
        address: dropoffInfo.address,
        surcharge: dropoffInfo.surcharge,
        surchargeText: dropoffInfo.surchargeText,
      },
      promotionId: payment.promotionId,
      discountAmount: payment.discountAmount,
      promotionCode: promotion?.code,
      promotionDescription: promotion?.description,
    };
  }

  // LẤY TẤT CẢ VÉ TRONG HỆ THỐNG (DÀNH CHO ADMIN HOẶC DEBUG)
  async getAllTickets() {
    const tickets = await this.prism.ticket.findMany({
      include: {
        user: true,
        schedule: {
          include: {
            route: true,
            bus: { include: { brand: true } },
            dropoffPoints: true,
            // ĐÃ XÓA bulkTicketId
          },
        },
        seat: true,
      },
      orderBy: { id: 'asc' },
    });
    return tickets;
  }

  // CHUYỂN ĐỔI TÊN PHƯƠNG THỨC THANH TOÁN SANG TIẾNG VIỆT
  private formatPaymentMethod(method: any): string {
    const map: Record<string, string> = {
      CASH: 'Tiền mặt',
      CREDIT_CARD: 'Thẻ tín dụng',
      MOMO: 'MoMo',
      ZALOPAY: 'ZaloPay',
    };
    return map[method] || method;
  }

  // LẤY CHI TIẾT MỘT VÉ THEO ID – DÙNG CHO TRANG XEM VÉ, IN VÉ
  async getTicketById(id: number) {
    const ticket = await this.prism.ticket.findUnique({
      where: { id },
      include: {
        schedule: {
          include: {
            route: {
              include: { brand: true },
            },
            bus: { include: { brand: true } },
            dropoffPoints: true,
          },
        },
        seat: true,
        user: true,
        paymentHistory: true,
        dropoffPoint: true,
      },
    });
    if (!ticket) throw new NotFoundException('Vé không tồn tại');

    return {
      ...ticket,
      dropoffInfo: this.formatDropoffInfo(ticket),
    };
  }

  // FORMAT THÔNG TIN ĐIỂM TRẢ KHÁCH (TRẢ TẬN NƠI / ĐIỂM TRẢ / BẾN ĐÍCH)
  private formatDropoffInfo(ticket: any) {
    if (ticket.dropoffAddress) {
      return {
        type: 'tannoi',
        display: 'Trả tận nơi',
        address: ticket.dropoffAddress,
        surcharge: ticket.surcharge || 150000,
        surchargeText: '+150.000đ',
      };
=======
        if (!ticket) throw new NotFoundException('Vé không tồn tại');
        return ticket;
>>>>>>> c9cddcb477d486f593c5a5c3fb56875c99670747
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

<<<<<<< HEAD
    return bookings.map(booking => {
      const firstTicket = booking.tickets[0];
      if (!firstTicket) return null;

      return {
        id: booking.id,
        ticketCode: `V${String(booking.id).padStart(6, '0')}`,
        user: firstTicket.user,
        schedule: firstTicket.schedule,
        seatCount: booking.tickets.length,
        seatList: booking.tickets.map(t => t.seat.seatNumber).sort((a, b) => a - b).join(', '),
        totalPrice: booking.amount,
        status: booking.status === 'SUCCESS' ? TicketStatus.PAID : (booking.status === 'PENDING' ? TicketStatus.BOOKED : TicketStatus.CANCELLED),
        createdAt: booking.createdAt,
        paymentMethod: booking.method,
        tickets: booking.tickets,
        promotionId: booking.promotionId,
        discountAmount: booking.discountAmount,
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
=======
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
>>>>>>> c9cddcb477d486f593c5a5c3fb56875c99670747
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

<<<<<<< HEAD
    return {
      id: booking.id,
      ticketCode: `V${String(booking.id).padStart(6, '0')}`,
      user: firstTicket.user,
      schedule: firstTicket.schedule,
      seatCount: booking.tickets.length,
      seatList: booking.tickets.map(t => t.seat.seatNumber).sort((a, b) => a - b).join(', '),
      totalPrice: booking.amount,
      status: booking.status === 'SUCCESS' ? TicketStatus.PAID : (booking.status === 'PENDING' ? TicketStatus.BOOKED : TicketStatus.CANCELLED),
      createdAt: booking.createdAt,
      paymentMethod: booking.method,
      tickets: booking.tickets,
      promotionId: booking.promotionId,
      discountAmount: booking.discountAmount,
    };
  }
=======
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
>>>>>>> c9cddcb477d486f593c5a5c3fb56875c99670747
}