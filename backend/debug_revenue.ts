import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dataSource = new DataSource({
    type: 'oracle',
    host: process.env.ORACLE_HOST || 'localhost',
    port: parseInt(process.env.ORACLE_PORT || '1521'),
    username: process.env.ORACLE_USERNAME || 'busdb',
    password: process.env.ORACLE_PASSWORD || 'test123@@',
    serviceName: process.env.ORACLE_SERVICE_NAME || 'FREEPDB1',
    logging: false,
});

async function debug() {
    try {
        await dataSource.initialize();
        console.log('✅ Connected to DB');

        const email = 'truongnhi2904@gmail.com';
        const users = await dataSource.query(`SELECT "id", "name", "email" FROM "User" WHERE "email" = :1`, [email]);
        
        if (users.length === 0) {
            console.log('❌ User not found with email:', email);
            return;
        }

        const userId = users[0].id;
        console.log('👤 User info:', users[0]);

        const tickets = await dataSource.query(`SELECT "id", "userId", "totalPrice", "status" FROM "Ticket" WHERE "userId" = :1`, [userId]);
        console.log(`🎫 Found ${tickets.length} tickets for user ID ${userId}:`);
        console.table(tickets);

        const revenue = await dataSource.query(`SELECT F_REVENUE_BY_USER(:1) AS REV FROM DUAL`, [userId]);
        console.log('💰 F_REVENUE_BY_USER result:', revenue[0].REV);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await dataSource.destroy();
    }
}

debug();
