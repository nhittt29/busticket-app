// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { auth } from '../src/config/firebase';

const prisma = new PrismaClient();

async function main() {
  // Tạo roles nếu chưa có
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

  console.log('Roles ready:', { adminRole, passengerRole });

  // Admin mặc định
  const adminEmail = 'admin@busticket.com';  // ✅ đúng cú pháp email
  const adminPassword = 'Admin123/';            // Firebase yêu cầu >= 12 ký tự

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(adminEmail);
    console.log('Admin already exists in Firebase:', userRecord.uid);
  } catch {
    userRecord = await auth.createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: 'Super Admin',
    });
    console.log('Created admin in Firebase:', userRecord.uid);
  }

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      uid: userRecord.uid,
      name: 'NhiTr',
      email: adminEmail,
      phone: '0123456789',
      roleId: adminRole.id,
      isActive: true,
    },
    include: { role: true },
  });

  console.log('Admin user ready:', adminUser);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
