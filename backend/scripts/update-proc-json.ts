import * as oracledb from 'oracledb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function updateProcedure() {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USERNAME || 'busdb',
            password: process.env.ORACLE_PASSWORD || 'test123@@',
            connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/freepdb1',
        });

        console.log('Connected to Oracle. Updating P_TICKETS_BY_DATE to JSON version...');

        const plsql = `
        CREATE OR REPLACE PROCEDURE P_TICKETS_BY_DATE(
            p_json OUT CLOB, 
            p_date VARCHAR2 -- Nhận chuỗi YYYY-MM-DD để triệt tiêu lỗi múi giờ
        ) AS
        BEGIN
            -- 'The Ultimate Fix': Gộp vé theo User + Chuyến + Trạng thái + Mã Giao Dịch
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'MAVE' VALUE mave,
                    'TENKH' VALUE tenkh,
                    'DIENTHOAI' VALUE dienthoai,
                    'DIEMDI' VALUE diemdi,
                    'DIEMDEN' VALUE diemden,
                    'SOGHE' VALUE soghe,
                    'SO_VE' VALUE so_ve,
                    'NGAYDI' VALUE TO_CHAR(ngaydi, 'YYYY-MM-DD"T"HH24:MI:SS'),
                    'TONGTIEN' VALUE tongtien,
                    'TRANGTHAI' VALUE trangthai,
                    'THOIGIANDAT' VALUE TO_CHAR(thoigiandat, 'YYYY-MM-DD"T"HH24:MI:SS')
                )
            ABSENT ON NULL
            ) INTO p_json
            FROM (
                SELECT 
                    MAX(T."id") as mave,
                    MAX(U."name") as tenkh,
                    MAX(U."phone") as dienthoai,
                    MAX(R1."startPoint") as diemdi,
                    MAX(R1."endPoint") as diemden,
                    LISTAGG(S."seatNumber", ', ') WITHIN GROUP (ORDER BY S."seatNumber") as soghe,
                    COUNT(*) as so_ve,
                    MAX(SCH."departureAt") as ngaydi,
                    SUM(T."totalPrice") as tongtien,
                    MAX(T."status") as trangthai,
                    MAX(T."createdAt") as thoigiandat
                FROM 
                    "User" U
                    JOIN "Ticket" T ON T."userId" = U."id"
                    JOIN "Schedule" SCH ON T."scheduleId" = SCH."id"
                    JOIN "Seat" S ON S."id" = T."seatId"
                    JOIN "Route" R1 ON SCH."routeId" = R1."id"
                WHERE 
                    TRUNC(T."createdAt") = TO_DATE(p_date, 'YYYY-MM-DD')
                GROUP BY 
                    U."id", SCH."id", T."paymentHistoryId"
                ORDER BY 
                    MAX(T."createdAt") DESC
            );
            
            IF p_json IS NULL THEN
                p_json := '[]';
            END IF;
        END;
        `;

        await connection.execute(plsql);
        console.log('Procedure P_TICKETS_BY_DATE (JSON version) updated successfully!');

    } catch (err) {
        console.error('Error updating procedure:', err);
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

updateProcedure();
