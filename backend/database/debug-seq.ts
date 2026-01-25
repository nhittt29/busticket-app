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

async function checkSequences() {
    try {
        await dataSource.initialize();
        console.log('✅ Connected to DB');

        // Query to find sequences related to USER table
        // TypeORM usually uses "TableName_id_seq" or global sequence
        const result = await dataSource.query(`
      SELECT SEQUENCE_NAME, CACHE_SIZE, LAST_NUMBER 
      FROM USER_SEQUENCES
    `);

        console.table(result);

        for (const seq of result) {
            console.log(`🔧 Disabling cache for: ${seq.SEQUENCE_NAME}`);
            try {
                await dataSource.query(`ALTER SEQUENCE "${seq.SEQUENCE_NAME}" NOCACHE`);
                console.log(`✅ Fixed: ${seq.SEQUENCE_NAME}`);
            } catch (err) {
                console.error(`❌ Failed: ${seq.SEQUENCE_NAME}`, err.message);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await dataSource.destroy();
    }
}

checkSequences();
