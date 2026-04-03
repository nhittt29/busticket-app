-- Câu 1: Tạo bảng tổng hợp chi tiết vé xe gồm các thông tin: 
-- mã vé, tên khách hàng, số điện thoại, điểm đi, điểm đến, 
-- số ghế, thời gian khởi hành, tổng tiền, trạng thái vé.

CREATE OR REPLACE VIEW V_TICKET_DETAILS 
AS
SELECT 
    T."id" AS MAVE, 
    U."name" AS TENKH, 
    U."phone" AS DIENTHOAI, 
    R."startPoint" AS DIEMDI, 
    R."endPoint" AS DIEMDEN, 
    S."seatNumber" AS SOGHE,
    SCH."departureAt" AS THOIGIANKHOIHANH,
    T."totalPrice" AS TONGTIEN,
    T."status" AS TRANGTHAI
FROM 
    "Ticket" T, 
    "User" U, 
    "Seat" S, 
    "Schedule" SCH, 
    "Route" R
WHERE 
    T."userId" = U."id" 
    AND T."seatId" = S."id" 
    AND T."scheduleId" = SCH."id" 
    AND SCH."routeId" = R."id";

-- ==========================================
-- HƯỚNG DẪN CĂN CHỈNH BẢNG ĐẸP TRONG SQL*PLUS / COMMAND LINE
-- Chạy các lệnh SET và COLUMN dưới đây trước khi gõ lệnh SELECT
-- ==========================================
SET PAGESIZE 100
SET LINESIZE 200

COLUMN MAVE FORMAT 99999;
COLUMN TENKH FORMAT A25;
COLUMN DIENTHOAI FORMAT A12;
COLUMN DIEMDI FORMAT A15;
COLUMN DIEMDEN FORMAT A15;
COLUMN SOGHE FORMAT 999;
COLUMN THOIGIANKHOIHANH FORMAT A25;
COLUMN TONGTIEN FORMAT 99,999,999;
COLUMN TRANGTHAI FORMAT A12;

-- Chạy thử View sau khi đã Format:
-- SELECT * FROM V_TICKET_DETAILS;
