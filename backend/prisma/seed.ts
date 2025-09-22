// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Xóa dữ liệu cũ (optional)
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // Tạo roles
  const roles = await prisma.role.createMany({
    data: [
      { name: 'ADMIN' },
      { name: 'PASSENGER' },
    ],
    skipDuplicates: true, // tránh lỗi nếu chạy nhiều lần
  });

  console.log('Roles created:', roles);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
