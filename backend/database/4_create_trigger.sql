-- ==========================================
-- 4. YÊU CẦU: TẠO TRIGGER (CƠ CHẾ KÍCH HOẠT)
-- ==========================================
-- Tên Trigger: TRG_CHECK_SEAT_CONCURRENCY
-- Mục đích: Chặn đứng tình huống nghẽn mạng (Concurrency) làm 2 người trên
--           web cùng bấm đặt 1 cái ghế cùng lúc (chênh lệch mili-giây).
--           Oracle sẽ chộp lấy dòng dữ liệu định thêm vào bảng "Ticket", 
--           soi kĩ xem đã có ai mua vé đó ('BOOKED' hoặc 'PAID') chưa,
--           nếu có, xả lỗi ép phía web báo về cho khách hàng đến chậm.

CREATE OR REPLACE TRIGGER TRG_CHECK_SEAT_CONCURRENCY
BEFORE INSERT ON "Ticket"
FOR EACH ROW
DECLARE
    v_count NUMBER;
    -- Kỹ thuật giao dịch độc lập để chống 
    -- lỗi khóa bảng ORA-04091 (Mutating Table) của Oracle
    PRAGMA AUTONOMOUS_TRANSACTION; 
BEGIN
    -- Quét xem cái Ghế ở Chuyến đi này có thằng nào "nhét" vô trước chưa
    SELECT COUNT(*) INTO v_count
    FROM "Ticket"
    WHERE "scheduleId" = :NEW."scheduleId"
      AND "seatId" = :NEW."seatId"
      AND "status" IN ('BOOKED', 'PAID');

    -- Áp dụng Rule của Web: Nếu Count > 0 nghĩa là đã có chủ
    IF v_count > 0 THEN
        -- Báo lỗi thẳng vào mặt luồng Data (Backend sẽ hứng cục Error này)
        RAISE_APPLICATION_ERROR(-20001, 'Lỗi mạng: Tranh chấp vé. Ghế này vừa được một người khác đặt chớp nhoáng trước bạn!');
    END IF;
    
    -- Bắt buộc phải có khi dùng lệnh PRAGMA ở trên
    COMMIT; 
END;
/

-- ==========================================
-- Test thử Trigger trong CSDL (Chặn đứng):
-- Lệnh insert dưới đây nếu làm cùng 1 lịch trình (1) và ghế (2), 
-- lần gọi thứ hai sẽ lập tức quăng lỗi 20001 đỏ chót ra màn hình Developer.
-- 
-- INSERT INTO "Ticket" ("userId", "scheduleId", "seatId", "price", "status") 
-- VALUES (1, 1, 2, 250000, 'BOOKED');
-- ==========================================
