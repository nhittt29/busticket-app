// test-prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    const ticket = await prisma.ticket.create({
      data: {
        userId: 1,
        scheduleId: 1,
        seatId: 1,
        price: 180000,
        status: 'BOOKED',
        bulkTicketId: 100, // ← Nếu không lỗi → OK
      },
    });
    console.log('Tạo vé thành công:', ticket);
  } catch (error) {
    console.error('Lỗi khi tạo vé:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();