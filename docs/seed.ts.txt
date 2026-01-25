// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { auth } from '../src/config/firebase';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    // ======================================
    // 🔹 1. Kiểm tra thư mục lưu ảnh
    // ======================================
    const avatarDir = path.join(__dirname, '..', 'uploads', 'avatars');
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
      console.log('📁 Created folder:', avatarDir);
    }

    // Đường dẫn avatar mặc định
    const defaultAvatar = 'uploads/avatars/default.png';

    // ======================================
    // 🔹 2. Tạo Roles nếu chưa có
    // ======================================
    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN' },
    });

    const passengerRole = await prisma.role.upsert({
      where: { name: 'PASSENGER' },
      update: {},
      create: { name: 'PASSENGER' },
    });

    console.log('✅ Roles ready:', { adminRole, passengerRole });

    // ======================================
    // 🔹 3. Tạo Admin mặc định
    // ======================================
    const adminEmail = 'admin@busticket.com';
    const adminPassword = 'AdminBus123@@';

    let userRecord;

    try {
      userRecord = await auth.getUserByEmail(adminEmail);
      console.log('ℹ️ Admin already exists in Firebase:', userRecord.uid);
    } catch {
      userRecord = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: 'Bus Admin',
      });
      console.log('🆕 Created admin in Firebase:', userRecord.uid);
    }

    // ======================================
    // 🔹 4. Đồng bộ Admin vào Prisma DB
    // ======================================
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        avatar: defaultAvatar,
        dob: new Date("1990-01-01"),
        gender: "OTHER",
      } as Prisma.UserUncheckedUpdateInput,
      create: {
        uid: userRecord.uid,
        name: 'NhiTr',
        email: adminEmail,
        phone: '0123456789',
        dob: new Date("1990-01-01"),
        gender: "OTHER",
        avatar: defaultAvatar,
        roleId: adminRole.id,
        isActive: true,
      } as Prisma.UserUncheckedCreateInput,
      include: {
        role: true,
      },
    });

    // ======================================
    // 🔹 5. Tạo Passenger mặc định
    // ======================================
    const passengerEmail = 'passenger@gmail.com';
    const passengerPassword = 'BusTicket123@@';

    let passengerRecord;

    try {
      passengerRecord = await auth.getUserByEmail(passengerEmail);
      console.log('ℹ️ Passenger already exists in Firebase:', passengerRecord.uid);
    } catch {
      passengerRecord = await auth.createUser({
        email: passengerEmail,
        password: passengerPassword,
        displayName: 'Default Passenger',
      });
      console.log('🆕 Created passenger in Firebase:', passengerRecord.uid);
    }

    // ======================================
    // 🔹 6. Đồng bộ Passenger vào Prisma DB
    // ======================================
    const passengerUser = await prisma.user.upsert({
      where: { email: passengerEmail },
      update: {
        avatar: defaultAvatar,
        dob: new Date("1995-01-01"),
        gender: "OTHER",
      } as Prisma.UserUncheckedUpdateInput,
      create: {
        uid: passengerRecord.uid,
        name: 'Passenger One',
        email: passengerEmail,
        phone: '0987654321',
        dob: new Date("1995-01-01"),
        gender: "OTHER",
        avatar: defaultAvatar,
        roleId: passengerRole.id,
        isActive: true,
      } as Prisma.UserUncheckedCreateInput,
      include: {
        role: true,
      },
    });

    // ======================================
    // ✅ 7. Log kết quả
    // ======================================
    console.log('\n✅ Admin user ready:');
    console.table({
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      phone: adminUser.phone,
      dob: (adminUser as any).dob?.toISOString().split('T')[0] ?? 'N/A',
      gender: (adminUser as any).gender ?? 'N/A',
      role: adminUser.role?.name,
      avatar: adminUser.avatar,
    });

    console.log('\n✅ Passenger user ready:');
    console.table({
      id: passengerUser.id,
      name: passengerUser.name,
      email: passengerUser.email,
      phone: passengerUser.phone,
      dob: (passengerUser as any).dob?.toISOString().split('T')[0] ?? 'N/A',
      gender: (passengerUser as any).gender ?? 'N/A',
      role: passengerUser.role?.name,
      avatar: passengerUser.avatar,
    });

    console.log('\n🎯 Seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);

    // Rollback cả admin và passenger
    try {
      await prisma.user.deleteMany({
        where: {
          email: { in: ['admin@busticket.com', 'passenger@gmail.com'] }
        },
      });
      console.log('🧹 Rolled back created users.');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// ======================================
// 🚀 Chạy script
// ======================================
main()
  .then(() => console.log('🌱 Database seeding finished.'))
  .catch((e) => {
    console.error('❌ Unhandled error:', e);
    process.exit(1);
  });