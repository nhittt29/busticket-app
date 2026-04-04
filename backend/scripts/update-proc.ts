import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

async function updateProcedure() {
  console.log('Connecting to Oracle to update Procedure...');
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

    const sql = `
    CREATE OR REPLACE PROCEDURE P_TICKETS_BY_DATE(ds OUT SYS_REFCURSOR, p_date DATE) AS
    BEGIN
      OPEN ds FOR
        SELECT t.id AS MAVE, u.name AS TENKH, u.phone AS DIENTHOAI,
               r.startPoint AS DIEMDI, r.endPoint AS DIEMDEN,
               s.seatNumber AS SOGHE, sch.departureAt AS NGAYDI,
               t.totalPrice AS TONGTIEN, t.status AS TRANGTHAI, t.createdAt AS THOIGIANDAT
        FROM "Ticket" t
        JOIN "User" u ON t.userId = u.id
        JOIN "Seat" s ON t.seatId = s.id
        JOIN "Schedule" sch ON t.scheduleId = sch.id
        JOIN "Route" r ON sch.routeId = r.id
        WHERE TRUNC(sch.departureAt) = TRUNC(p_date);
    END;
    `;

    await ds.query(sql);
    console.log('Procedure P_TICKETS_BY_DATE updated successfully with ALL columns.');

    await ds.destroy();
  } catch (err) {
    console.error('ERROR updating procedure:', err);
  }
}

updateProcedure();
