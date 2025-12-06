import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding review data...');

    // 1. Find user with ID 4
    const user = await prisma.user.findUnique({ where: { id: 4 } });
    if (!user) {
        console.error('User with ID 4 not found.');
        return;
    }
    console.log(`Found user: ${user.email} (ID: ${user.id})`);

    // 2. Find or create a brand/bus/route
    let brand = await prisma.brand.findFirst();
    if (!brand) {
        brand = await prisma.brand.create({
            data: { name: 'Test Brand', dailyTicketLimit: 100 },
        });
    }

    let bus = await prisma.bus.findFirst({ where: { brandId: brand.id } });
    if (!bus) {
        bus = await prisma.bus.create({
            data: {
                name: 'Test Bus',
                licensePlate: '59A-12345',
                seatCount: 36,
                category: 'SLEEPER',
                seatType: 'BERTH',
                brandId: brand.id,
            },
        });
        // Create seats
        for (let i = 1; i <= 36; i++) {
            await prisma.seat.create({
                data: {
                    seatNumber: i,
                    code: `A${i}`,
                    price: 200000,
                    busId: bus.id,
                },
            });
        }
    }

    let route = await prisma.route.findFirst();
    if (!route) {
        route = await prisma.route.create({
            data: {
                startPoint: 'Sài Gòn',
                endPoint: 'Đà Lạt',
                averageDurationMin: 360,
                lowestPrice: 200000,
            },
        });
    }

    // 3. Create a PAST schedule (arrived yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const arrival = new Date(yesterday);
    arrival.setHours(arrival.getHours() + 6);

    const schedule = await prisma.schedule.create({
        data: {
            busId: bus.id,
            routeId: route.id,
            departureAt: yesterday,
            arrivalAt: arrival,
            status: 'COMPLETED',
        },
    });
    console.log(`Created past schedule: ${schedule.id} (Departed: ${yesterday.toISOString()})`);

    // 4. Create a Ticket
    const seat = await prisma.seat.findFirst({ where: { busId: bus.id } });
    if (!seat) throw new Error('No seat found');

    const paymentHistory = await prisma.paymentHistory.create({
        data: {
            method: 'MOMO',
            amount: 200000,
            status: 'SUCCESS',
            paidAt: new Date(),
        },
    });

    const ticket = await prisma.ticket.create({
        data: {
            userId: user.id,
            scheduleId: schedule.id,
            seatId: seat.id,
            price: 200000,
            totalPrice: 200000,
            status: 'PAID',
            paymentMethod: 'MOMO',
            paymentHistoryId: paymentHistory.id,
        },
    });

    await prisma.ticketPayment.create({
        data: {
            ticketId: ticket.id,
            paymentId: paymentHistory.id,
        },
    });

    console.log(`Created PAID ticket #${ticket.id} for user ${user.email}. You can now review it.`);

    // 5. Create another Unreviewed Ticket (Different Route)
    const route2 = await prisma.route.create({
        data: {
            startPoint: 'Đà Nẵng',
            endPoint: 'Huế',
            averageDurationMin: 120,
            lowestPrice: 150000,
            brandId: brand.id,
        },
    });

    const schedule2 = await prisma.schedule.create({
        data: {
            busId: bus.id,
            routeId: route2.id,
            departureAt: yesterday,
            arrivalAt: arrival,
            status: 'COMPLETED',
        },
    });

    const seat2 = await prisma.seat.create({
        data: { seatNumber: 99, code: 'B01', price: 150000, busId: bus.id },
    });

    const ticket2 = await prisma.ticket.create({
        data: {
            userId: user.id,
            scheduleId: schedule2.id,
            seatId: seat2.id,
            price: 150000,
            totalPrice: 150000,
            status: 'PAID',
            paymentMethod: 'ZALOPAY',
        },
    });
    console.log(`Created another UNREVIEWED ticket #${ticket2.id}`);

    // 6. Create a REVIEWED Ticket (History)
    const schedule3 = await prisma.schedule.create({
        data: {
            busId: bus.id,
            routeId: route.id,
            departureAt: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days ago
            arrivalAt: new Date(new Date().setDate(new Date().getDate() - 5)),
            status: 'COMPLETED',
        },
    });

    const seat3 = await prisma.seat.create({
        data: { seatNumber: 100, code: 'C01', price: 200000, busId: bus.id },
    });

    const ticket3 = await prisma.ticket.create({
        data: {
            userId: user.id,
            scheduleId: schedule3.id,
            seatId: seat3.id,
            price: 200000,
            totalPrice: 200000,
            status: 'PAID',
            paymentMethod: 'CASH',
        },
    });

    await prisma.review.create({
        data: {
            rating: 5,
            comment: 'Chuyến đi tuyệt vời! Xe sạch sẽ, bác tài vui tính.',
            images: ['https://picsum.photos/200/300', 'https://picsum.photos/200/301'],
            userId: user.id,
            busId: bus.id,
            ticketId: ticket3.id,
        },
    });
    console.log(`Created REVIEWED ticket #${ticket3.id} with review.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
