import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { User } from '../src/entities/User.entity';
import { Role } from '../src/entities/Role.entity';
import { auth } from '../src/config/firebase'; // Reusing your existing Firebase config

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dataSource = new DataSource({
    type: 'oracle',
    host: process.env.ORACLE_HOST || 'localhost',
    port: parseInt(process.env.ORACLE_PORT || '1521'),
    username: process.env.ORACLE_USERNAME || 'busdb',
    password: process.env.ORACLE_PASSWORD || 'test123@@',
    serviceName: process.env.ORACLE_SERVICE_NAME || 'FREEPDB1', // Changed from sid to serviceName
    entities: [path.join(__dirname, '../src/entities/*.entity.ts')],
    synchronize: true, // Enable sync to recreate tables after reset
    logging: true,
});

async function main() {
    try {
        console.log('🌱 Connecting to Oracle Database...');
        await dataSource.initialize();
        console.log('✅ Connected!');

        const roleRepo = dataSource.getRepository(Role);
        const userRepo = dataSource.getRepository(User);

        // ======================================
        // 🔹 1. Tạo Roles
        // ======================================
        const roles = ['ADMIN', 'PASSENGER'];
        const roleMap = new Map<string, Role>();

        for (const roleName of roles) {
            let role = await roleRepo.findOne({ where: { name: roleName } });
            if (!role) {
                role = roleRepo.create({ name: roleName });
                await roleRepo.save(role);
                console.log(`✅ Created Role: ${roleName}`);
            } else {
                console.log(`ℹ️ Role exists: ${roleName}`);
            }
            roleMap.set(roleName, role);
        }

        // ======================================
        // 🔹 2. Config Users
        // ======================================
        const usersToSeed = [
            {
                email: 'admin@busticket.com',
                password: 'AdminBus123@@',
                name: 'NhiTr',
                role: 'ADMIN',
                dob: new Date('1990-01-01'),
                phone: '0123456789'
            },
            {
                email: 'passenger@gmail.com',
                password: 'BusTicket123@@',
                name: 'Passenger One',
                role: 'PASSENGER',
                dob: new Date('1995-01-01'),
                phone: '0987654321'
            }
        ];

        for (const userData of usersToSeed) {
            // A. Firebase Sync
            let uid: string;
            try {
                const userRecord = await auth.getUserByEmail(userData.email);
                uid = userRecord.uid;
                console.log(`ℹ️ Firebase User exists: ${userData.email} (${uid})`);
            } catch (e) {
                const userRecord = await auth.createUser({
                    email: userData.email,
                    password: userData.password,
                    displayName: userData.name,
                });
                uid = userRecord.uid;
                console.log(`🆕 Created Firebase User: ${userData.email} (${uid})`);
            }

            // B. Oracle Sync
            const role = roleMap.get(userData.role);
            const existingUser = await userRepo.findOne({ where: { email: userData.email } });

            if (existingUser) {
                console.log(`ℹ️ Oracle User exists: ${userData.email}`);
                // Optional: Update logic if needed
            } else {
                const newUser = userRepo.create({
                    uid: uid,
                    email: userData.email,
                    name: userData.name,
                    phone: userData.phone,
                    dob: userData.dob,
                    gender: 'OTHER',
                    avatar: 'uploads/avatars/default.png',
                    isActive: true,
                    role: role
                });
                await userRepo.save(newUser);
                console.log(`✅ Created Oracle User: ${userData.email} (Role: ${userData.role})`);
            }
        }

        console.log('\n🎯 Seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Seed failed:', error);
        process.exit(1);
    } finally {
        if (dataSource.isInitialized) await dataSource.destroy();
    }
}

main();
