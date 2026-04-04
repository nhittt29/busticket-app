import * as oracledb from 'oracledb';
async function run() {
    let conn = await oracledb.getConnection({ user: 'busdb', password: 'test123@@', connectString: 'localhost:1521/freepdb1' });
    let res = await conn.execute('SELECT COUNT(*) FROM "Ticket" T JOIN "Schedule" S ON T."scheduleId" = S."id" WHERE TRUNC(S."departureAt") = TO_DATE(\'2026-04-03\', \'YYYY-MM-DD\')');
    console.log("Tickets on Apr 3:", res.rows);

    res = await conn.execute('SELECT COUNT(*) FROM "Ticket" T JOIN "Schedule" S ON T."scheduleId" = S."id" WHERE TRUNC(T."createdAt") = TO_DATE(\'2026-04-03\', \'YYYY-MM-DD\')');
    console.log("Tickets booked on Apr 3:", res.rows);
    await conn.close();
}
run();
