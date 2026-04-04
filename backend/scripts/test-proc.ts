import * as oracledb from 'oracledb';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

async function test() {
  console.log('Connecting to Oracle...');
  const ds = new DataSource({
    type: 'oracle',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 1521,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    sid: process.env.DB_SID,
  });

  try {
    await ds.initialize();
    console.log('DataSource initialized.');

    const queryRunner = ds.createQueryRunner();
    const connection = await queryRunner.connect(); // This is the native connection
    console.log('Native connection obtained.');

    const dateStr = '2026-04-03';
    console.log(`Calling P_TICKETS_BY_DATE for date: ${dateStr}`);

    const result: any = await connection.execute(
      `BEGIN P_TICKETS_BY_DATE(:ds, :p_date); END;`,
      {
        ds: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
        p_date: { val: new Date(dateStr), type: oracledb.DB_TYPE_DATE, dir: oracledb.BIND_IN }
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log('Procedure execution successful.');
    const resultSet = result.outBinds.ds;
    const rows = await resultSet.getRows(100);
    console.log('Rows found:', rows.length);
    if (rows.length > 0) {
      console.log('Sample Row:', JSON.stringify(rows[0], null, 2));
    } else {
        console.log('No rows returned for this date.');
        // Try without TRUNC or a different date to see if it's a timezone issue
        console.log('Checking all tickets to see if any exist...');
        const allTickets = await ds.query('SELECT COUNT(*) as TOTAL FROM "Ticket"');
        console.log('Total tickets in DB:', allTickets[0].TOTAL);
    }
    await resultSet.close();

    await queryRunner.release();
    await ds.destroy();
  } catch (err) {
    console.error('ERROR during test:', err);
  }
}

test();
