import * as oracledb from 'oracledb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testProcedure() {
    let connection;

    try {
        console.log('Connecting to Oracle...');
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USERNAME || 'busdb',
            password: process.env.ORACLE_PASSWORD || 'test123@@',
            connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/freepdb1',
        });

        console.log('Connected. Running Procedure P_TICKETS_BY_DATE with date 2026-04-01...');
        const dateStr = '2026-04-01';

        const result: any = await connection.execute(
            `BEGIN P_TICKETS_BY_DATE(:p_json, :p_date); END;`,
            {
              p_json: { type: oracledb.DB_TYPE_CLOB, dir: oracledb.BIND_OUT },
              p_date: { val: dateStr, type: oracledb.STRING, dir: oracledb.BIND_IN }
            }
        );
        
        console.log('Procedure executed. Retrieving CLOB data...');
        const lob = result.outBinds.p_json;
        let jsonStr = '[]';
        
        if (lob) {
            jsonStr = await lob.getData();
        }
        
        const data = JSON.parse(jsonStr);
        console.log(`Success! Received ${data.length} records.`);
        console.log(data.slice(0, 2)); // Print first 2 records

    } catch (err) {
        console.error('Error executing procedure:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

testProcedure();
