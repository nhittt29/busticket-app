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

        // Query to find Identity Columns (which have system-generated sequences)
        const result = await dataSource.query(`
          SELECT TABLE_NAME, COLUMN_NAME 
          FROM USER_TAB_IDENTITY_COLS
        `);

        console.table(result);

        for (const identity of result) {
            console.log(`🔧 Disabling cache for identity column: ${identity.TABLE_NAME}.${identity.COLUMN_NAME}`);
            try {
                // For Identity columns, we must use ALTER TABLE MODIFY
                await dataSource.query(`ALTER TABLE "${identity.TABLE_NAME}" MODIFY ("${identity.COLUMN_NAME}" NOCACHE)`);
                console.log(`✅ Fixed: ${identity.TABLE_NAME}`);
            } catch (err) {
                console.error(`❌ Failed: ${identity.TABLE_NAME}`, err.message);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await dataSource.destroy();
    }
}

checkSequences();
