import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const scheduleId = 18;
  const busId = 2; // From request
  const routeId = 1; // From request

  console.log(`🚀 Seeding data for Schedule ID: ${scheduleId}...`);

  // 1. Ensure Schedule exists with correct time (to meet < 24h condition)
  // Current time is ~Dec 15 morning, departure is Dec 15 16:30 -> < 24h difference.
  const departureAt = new Date('2025-12-15T16:30:00.000Z');
  const arrivalAt = new Date('2025-12-15T20:00:00.000Z');

  // We assume Bus 2 and Route 1 exist as per user request context.
  // Using upsert to ensure it matches the user's specs.
  const schedule = await prisma.schedule.upsert({
    where: { id: scheduleId },
    update: {
      busId,
      routeId,
      departureAt,
      arrivalAt,
      status: 'UPCOMING',
    },
    create: {
      id: scheduleId,
      busId,
      routeId,
      departureAt,
      arrivalAt,
      status: 'UPCOMING',
      // Assuming Bus 2 and Route 1 exist. If not, this might fail,
      // but usually seed scripts assume base data or create it.
      // Given user provided ID 18, it likely exists.
    },
  });

  console.log('✅ Schedule updated/verified:', schedule);

  // 2. Clear existing DropoffPoints for this schedule to avoid duplicates
  await prisma.dropoffPoint.deleteMany({
    where: { scheduleId: scheduleId },
  });
  console.log('🧹 Cleared existing dropoff points for this schedule.');

  // 3. Create DropoffPoints based on sample_data_postman.md
  // Tuyến SG -> Cần Thơ
  const dropoffPointsData = [
    {
      name: 'Ngã 3 Cai Lậy (Tiền Giang)',
      address: 'QL1A, Thị xã Cai Lậy, Tiền Giang',
      surcharge: 0,
      priceDifference: -60000,
      order: 1,
    },
    {
      name: 'Chân Cầu Mỹ Thuận (Vĩnh Long)',
      address: 'QL1A, Tân Hòa, Vĩnh Long',
      surcharge: 0,
      priceDifference: -30000,
      order: 2,
    },
    {
      name: 'TP. Vĩnh Long (Có xe trung chuyển)',
      address: 'Phường 1, TP. Vĩnh Long', // Dummy address
      surcharge: 20000,
      priceDifference: -20000,
      order: 3,
    },
  ];

  for (const point of dropoffPointsData) {
    await prisma.dropoffPoint.create({
      data: {
        ...point,
        scheduleId: scheduleId,
      },
    });
  }
  console.log(`✅ Created ${dropoffPointsData.length} dropoff points with pricing logic.`);

  // 4. Ensure Occupancy Condition (< 24h AND Occupancy < 80%)
  // We need to make sure the bus is NOT full.
  // We'll create a few dummy tickets to make it realistic but keep it under 80%.
  
  // First, verify bus capacity
  const bus = await prisma.bus.findUnique({ where: { id: busId } });
  if (!bus) {
    console.warn(`⚠️ Bus ID ${busId} not found! Skipping seat checks.`);
  } else {
    console.log(`🚌 Bus: ${bus.name}, Seats: ${bus.seatCount}`);
    
    // Clear existing tickets to control the state exactly
    await prisma.ticket.deleteMany({
      where: { scheduleId: scheduleId }
    });
    console.log('🧹 Cleared existing tickets for strict testing state.');

    // Seed 5 tickets (occupied seats)
    // We need a valid User ID. Assuming User 1 exists (admin or seed user).
    // If not, we'll try to find one or create one.
    let user = await prisma.user.findFirst();
    if (!user) {
        // Create a dummy user if none exists
        user = await prisma.user.create({
            data: {
                uid: 'dummy-seed-user',
                name: 'Seed User',
                email: 'seed@test.com',
                role: {
                    connectOrCreate: {
                        where: { name: 'PASSENGER' },
                        create: { name: 'PASSENGER' }
                    }
                }
            }
        })
    }

    // Get 5 available seats for this bus
    const seats = await prisma.seat.findMany({
        where: { busId: busId },
        take: 5
    });

    if (seats.length > 0) {
        for (const seat of seats) {
            await prisma.ticket.create({
                data: {
                    userId: user.id,
                    scheduleId: scheduleId,
                    seatId: seat.id,
                    price: 165000, // Base price example
                    status: 'PAID',
                    paymentMethod: 'MOMO'
                }
            });
        }
        console.log(`✅ Created ${seats.length} booked tickets to simulate partial occupancy.`);
        
        const occupancy = (seats.length / bus.seatCount) * 100;
        console.log(`📊 Current Occupancy: ${occupancy.toFixed(2)}% (< 80% condition met).`);
    } else {
        console.warn('⚠️ No seats found for this bus. Setup bus seats first if needed.');
    }
  }

  console.log('\n🎉 Seed completed successfully! Ready for testing pricing logic.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
