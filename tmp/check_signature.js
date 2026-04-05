const oracledb = require('oracledb');

async function checkSignature() {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: "busdb",
      password: "test123@@",
      connectString: "localhost:1521/freepdb1"
    });

    const result = await connection.execute(
      `SELECT argument_name, data_type, in_out, position 
       FROM user_arguments 
       WHERE object_name = 'P_TICKETS_BY_DATE'
       ORDER BY position`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log('Signature in DB:', JSON.stringify(result.rows, null, 2));

  } catch (err) {
    console.error('Error checking signature:', err);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

checkSignature();
