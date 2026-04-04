import * as oracledb from 'oracledb';
async function run() {
    let conn = await oracledb.getConnection({ user: 'busdb', password: 'test123@@', connectString: 'localhost:1521/freepdb1' });
    let res = await conn.execute(`SELECT COUNT(*) FROM "Ticket" T JOIN "Schedule" S ON T."scheduleId" = S."id" WHERE TRUNC(S."departureAt") = TO_DATE('2026-04-03', 'YYYY-MM-DD')`);
    console.log("Tickets on departure date Apr 3:", res.rows);

    let res2 = await conn.execute(`SELECT COUNT(*) FROM "Ticket" T JOIN "Schedule" S ON T."scheduleId" = S."id" WHERE TRUNC(T."createdAt") = TO_DATE('2026-04-03', 'YYYY-MM-DD')`);
    console.log("Tickets booked on Apr 3:", res2.rows);

    let dates = await conn.execute(`SELECT TO_CHAR(S."departureAt", 'YYYY-MM-DD HH24:MI:SS') as DEP FROM "Ticket" T JOIN "Schedule" S ON T."scheduleId" = S."id"`);
    console.log("Actual departure dates with tickets:");
    console.log(Array.from(new Set(dates.rows.map(r => (r as any)[0].split(' ')[0]))).slice(0, 10));

    await conn.close();
}
run();
