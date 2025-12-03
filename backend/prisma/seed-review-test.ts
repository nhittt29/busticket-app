import { PrismaClient, ScheduleStatus, TicketStatus, PaymentMethod } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = 3;

  // 1. Verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error(`User with ID ${userId} not found!`);
    return;
  }
  console.log(`Found user: ${user.name} (ID: ${user.id})`);

  // 2. Find a bus and route
  const bus = await prisma.bus.findFirst();
  const route = await prisma.route.findFirst();

  if (!bus || !route) {
    console.error('No bus or route found in database!');
    return;
  }

  // 3. Create a COMPLETED schedule in the past
  const departureAt = new Date();
  departureAt.setDate(departureAt.getDate() - 1); // Yesterday
  const arrivalAt = new Date(departureAt);
  arrivalAt.setHours(arrivalAt.getHours() + 4); // 4 hours duration

  const schedule = await prisma.schedule.create({
    data: {
      busId: bus.id,
      routeId: route.id,
      departureAt: departureAt,
      arrivalAt: arrivalAt,
      status: ScheduleStatus.COMPLETED,
    },
  });
  console.log(`Created COMPLETED schedule: ID ${schedule.id}`);

  // 4. Find a seat
  const seat = await prisma.seat.findFirst({
    where: { busId: bus.id },
  });

  if (!seat) {
    console.error('No seat found for the bus!');
    return;
  }

  // 5. Create PaymentHistory
  const payment = await prisma.paymentHistory.create({
    data: {
      method: PaymentMethod.MOMO,
      amount: 100000,
      status: 'SUCCESS',
      ticketCode: `TEST-${Date.now()}`,
      seatCount: 1,
      paidAt: new Date(),
    },
  });
  console.log(`Created PaymentHistory: ID ${payment.id}`);

  // 6. Create Ticket
  const ticket = await prisma.ticket.create({
    data: {
      userId: userId,
      scheduleId: schedule.id,
      seatId: seat.id,
      price: 100000,
      status: TicketStatus.PAID,
      paymentHistoryId: payment.id,
    },
  });
  console.log(`Created Ticket: ID ${ticket.id} for User ${userId}`);

  console.log('Test data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
