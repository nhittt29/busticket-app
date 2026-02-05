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
    logging: true,
});

async function resetDatabase() {
    try {
        console.log('🔥 Connecting to Database for Reset...');
        await dataSource.initialize();

        console.log('⚠️ DROPPING ALL TABLES AND SEQUENCES...');

        // 1. Drop Tables
        const tables = await dataSource.query(`SELECT table_name FROM user_tables`);
        console.log(`Found ${tables.length} tables.`);

        for (const t of tables) {
            const tableName = t.TABLE_NAME || t.table_name; // Handle case sensitivity
            if (!tableName) continue;

            try {
                await dataSource.query(`DROP TABLE "${tableName}" CASCADE CONSTRAINTS PURGE`);
                console.log(`🗑️ Dropped Table: ${tableName}`);
            } catch (e) {
                // Ignore "table or view does not exist" error (ORA-00942)
                if (e.message.includes('ORA-00942')) {
                    console.log(`⚠️ Table ${tableName} already gone.`);
                } else {
                    console.error(`❌ Failed to drop table ${tableName}: ${e.message}`);
                }
            }
        }

        // 2. Drop Sequences
        const sequences = await dataSource.query(`SELECT sequence_name FROM user_sequences`);
        for (const s of sequences) {
            try {
                await dataSource.query(`DROP SEQUENCE "${s.SEQUENCE_NAME}"`);
                console.log(`🗑️ Dropped Sequence: ${s.SEQUENCE_NAME}`);
            } catch (e) {
                console.error(`❌ Failed to drop sequence ${s.SEQUENCE_NAME}: ${e.message}`);
            }
        }

        console.log('✅ Database Cleared Successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Reset failed:', error);
        process.exit(1);
    } finally {
        if (dataSource.isInitialized) await dataSource.destroy();
    }
}

resetDatabase();

//npm run db:reset
