-- ==========================================
-- 3. YÊU CẦU: TẠO PROCEDURE (THỦ TỤC)
-- ==========================================
-- Tên Thủ tục: P_TICKETS_BY_DATE
-- Mục đích: Lấy ra danh sách các hành khách đã đặt vé cho một 
--           ngày khởi hành X nào đó (với X là tham số dạng DATE).
--           Trả về kết quả ở dạng một BẢNG dữ liệu thông qua con trỏ SYS_REFCURSOR.

CREATE OR REPLACE PROCEDURE P_TICKETS_BY_DATE(
    ds OUT SYS_REFCURSOR, 
    p_date DATE
)
AS
BEGIN
    OPEN ds FOR
        SELECT 
            U."name" AS TENKH,
            U."phone" AS DIENTHOAI,
            S."seatNumber" AS SOGHE,
            SCH."departureAt" AS NGAYDI,
            T."totalPrice" AS TONGTIEN
        FROM 
            "User" U, 
            "Ticket" T, 
            "Schedule" SCH, 
            "Seat" S
        WHERE 
            T."userId" = U."id"
            AND T."scheduleId" = SCH."id"
            AND T."seatId" = S."id"
            -- TRUNC: Ép kiểu dữ liệu TIMESTAMP chặt bỏ đi giờ/phút/giây, 
            -- chỉ so sánh xem có bằng đúng "ngày/tháng/năm" của p_date hay không.
            AND TRUNC(SCH."departureAt") = p_date;
END;
/

-- ==========================================
-- Câu lệnh chạy để Test trực tiếp trên Oracle:
-- ==========================================
-- var ds_ketqua REFCURSOR;
-- exec P_TICKETS_BY_DATE(:ds_ketqua, to_date('25/5/2026', 'dd/mm/yyyy'));
-- print ds_ketqua;
