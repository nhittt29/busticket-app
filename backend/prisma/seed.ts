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
    // 🔹 4. Đồng bộ Admin vào Prisma DB
    // ======================================
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        avatar: defaultAvatar,
        dob: new Date("1990-01-01"), // 🔹 Sử dụng Date object cho dob
        gender: "OTHER",             // 🔹 Giới tính mặc định
      } as Prisma.UserUncheckedUpdateInput, // Sử dụng UncheckedUpdateInput
      create: {
        uid: userRecord.uid,
        name: 'NhiTr',
        email: adminEmail,
        phone: '0123456789',
        dob: new Date("1990-01-01"), // 🔹 Sử dụng Date object cho dob
        gender: "OTHER",             // 🔹 Giới tính mặc định
        avatar: defaultAvatar,
        roleId: adminRole.id,
        isActive: true,
      } as Prisma.UserUncheckedCreateInput, // Sử dụng UncheckedCreateInput
      include: {
        role: true, // Bao gồm role
      },
    });

    // ======================================
    // ✅ 5. Log kết quả
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