const oracledb = require('oracledb');

async function test() {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: "busdb",
      password: "test123@@",
      connectString: "localhost:1521/freepdb1"
    });

    const date = '2026-04-04';
    console.log(`Testing with date: ${date}`);

    // Try BIND_OUT CURSOR
    try {
        const result = await connection.execute(
          `BEGIN P_TICKETS_BY_DATE(:ds, :p_date); END;`,
          {
            ds: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
            p_date: { val: new Date(date), type: oracledb.DATE, dir: oracledb.BIND_IN }
          },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const resultSet = result.outBinds.ds;
        const rows = await resultSet.getRows(10);
        await resultSet.close();

        console.log('Success with CURSOR bind!');
        console.log('Result:', JSON.stringify(rows, null, 2));
    } catch (innerErr) {
        console.error('Inner Error (CURSOR bind):', innerErr.message);
        
        // Try alternative: Maybe the procedure name is case-sensitive or different?
        // Or maybe it expects VARCHAR2 and converts internally?
        console.log('Retrying with STRING bind for date...');
        const result2 = await connection.execute(
          `BEGIN P_TICKETS_BY_DATE(:ds, :p_date); END;`,
          {
            ds: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
            p_date: { val: date, type: oracledb.STRING, dir: oracledb.BIND_IN }
          },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const resultSet2 = result2.outBinds.ds;
        const rows2 = await resultSet2.getRows(10);
        await resultSet2.close();
        console.log('Success with STRING bind!');
    }

  } catch (err) {
    console.error('Final Error:', err);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

test();
