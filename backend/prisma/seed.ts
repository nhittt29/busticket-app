// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { auth } from '../src/config/firebase';

const prisma = new PrismaClient();

async function main() {
  try {
    // ======================================
    // 🔹 1. Tạo Roles nếu chưa có
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
    // 🔹 2. Tạo Admin mặc định
    // ======================================
    const adminEmail = 'admin@busticket.com'; // ✅ Email hợp lệ
    const adminPassword = 'Admin123/';        // ✅ Mật khẩu đủ mạnh cho Firebase

    let userRecord;

    try {
      // Nếu đã tồn tại trên Firebase
      userRecord = await auth.getUserByEmail(adminEmail);
      console.log('ℹ️ Admin already exists in Firebase:', userRecord.uid);
    } catch {
      // Nếu chưa có thì tạo mới
      userRecord = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: 'Bus Admin',
      });
      console.log('🆕 Created admin in Firebase:', userRecord.uid);
    }

    // ======================================
    // 🔹 3. Đồng bộ Admin vào Prisma DB
    // ======================================
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        uid: userRecord.uid,
        name: 'NhiTr',              // 👈 tên hiển thị trong hệ thống
        email: adminEmail,
        phone: '0123456789',
        roleId: adminRole.id,
        isActive: true,
      },
      include: { role: true },
    });

    // ======================================
    // ✅ 4. Log kết quả
    // ======================================
    console.log('\n✅ Admin user ready:');
    console.table({
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role.name,
    });

    console.log('\n🎯 Seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);

    // Nếu có lỗi khi tạo user, rollback lại user admin trong DB
    try {
      await prisma.user.deleteMany({
        where: { email: 'admin@busticket.com' },
      });
      console.log('🧹 Rolled back created admin user.');
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
