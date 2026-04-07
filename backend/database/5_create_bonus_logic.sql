-- =======================================================
-- 5. YÊU CẦU: CỘNG ĐIỂM (BONUS POINTS)
-- CÁC TÍNH NĂNG: SEQUENCE, PACKAGE, ROWNUM
-- =======================================================

-- -------------------------------------------------------
-- A. SEQUENCE & TABLE (Dãy số tự động & Bảng Nhật ký)
-- -------------------------------------------------------

-- 1. YÊU CẦU: Tạo Sequence để đánh ID tự động
-- MỤC ĐÍCH: Để không phải nhập ID bằng tay, Sequence sẽ tự động 
-- sinh ra các số tăng dần (1, 2, 3...) giúp quản lý khóa chính an toàn.
CREATE SEQUENCE SEQ_LOG_ID 
    START WITH 1 
    INCREMENT BY 1 
    NOCACHE;

-- 2. YÊU CẦU: Tạo bảng "ActionLog" (Nhật ký hành động)
-- MỤC ĐÍCH: Dùng để lưu trữ lịch sử các hoạt động quan trọng trong hệ thống 
-- (như đăng nhập, tra cứu vé, lỗi hệ thống...) để phục vụ kiểm tra và quản trị.
CREATE TABLE "ActionLog" (
    "id" NUMBER PRIMARY KEY,
    "action_name" VARCHAR2(255),
    "log_time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- >>> KIỂM TRA CÂU A (SEQUENCE & TABLE):
-- TRUY VẤN: Thử thêm dữ liệu mới vào bảng Nhật ký bằng cách sử dụng Sequence.
INSERT INTO "ActionLog" ("id", "action_name") VALUES (SEQ_LOG_ID.NEXTVAL, 'Test: Sequence sinh so ID dau tien');
INSERT INTO "ActionLog" ("id", "action_name") VALUES (SEQ_LOG_ID.NEXTVAL, 'Test: Sequence sinh so ID tiep theo');
-- KIỂM TRA: Xem dữ liệu đã được gán ID tự động hay chưa.
SELECT * FROM "ActionLog";


-- -------------------------------------------------------
-- B. PACKAGE (Gói thủ tục và hàm)
-- -------------------------------------------------------

-- 1. YÊU CẦU: Tạo PACKAGE SPECIFICATION (Phần khai báo)
-- MỤC ĐÍCH: Khai báo danh sách các Hàm/Thủ tục mà các ứng dụng bên ngoài 
-- (như Web, App) có thể gọi vào. Giúp mã nguồn được đóng gói gọn gàng.
CREATE OR REPLACE PACKAGE PKG_BUSTICKET_UTILS AS
    -- Thủ tục ghi lại nhật ký (Sử dụng SEQUENCE nội bộ)
    PROCEDURE LOG_SYSTEM_ACTION(p_action IN VARCHAR2);
    
    -- Thủ tục lấy danh sách N vé vừa đặt (SỬ DỤNG ROWNUM ĐỂ GIỚI HẠN KẾT QUẢ)
    PROCEDURE GET_RECENT_BOOKINGS(p_limit IN NUMBER, ds OUT SYS_REFCURSOR);
END PKG_BUSTICKET_UTILS;
/

-- 2. YÊU CẦU: Tạo PACKAGE BODY (Phần thực thi logic)
-- MỤC ĐÍCH: Viết các câu lệnh SQL chi tiết bên trong để xử lý nghiệp vụ.
CREATE OR REPLACE PACKAGE BODY PKG_BUSTICKET_UTILS AS

    -- HIỆN THỰC THỦ TỤC GHI NHẬT KÝ (Dùng Sequence)
    PROCEDURE LOG_SYSTEM_ACTION(p_action IN VARCHAR2) IS
    BEGIN
        INSERT INTO "ActionLog" ("id", "action_name")
        VALUES (SEQ_LOG_ID.NEXTVAL, p_action);
        COMMIT; -- Đảm bảo nhật ký được lưu lại ngay lập tức
    END LOG_SYSTEM_ACTION;

    -- HIỆN THỰC THỦ TỤC LẤY VÉ GẦN NHẤT (Dùng ROWNUM)
    -- MỤC ĐÍCH: Truy vấn danh sách các vé xe mới được đặt gần đây nhất,
    -- kết quả trả về đúng số lượng (N dòng) mà người dùng yêu cầu.
    PROCEDURE GET_RECENT_BOOKINGS(p_limit IN NUMBER, ds OUT SYS_REFCURSOR) IS
    BEGIN
        -- Tự động ghi lại hoạt động vào bảng Nhật ký thông qua Procedure trong chính Package
        LOG_SYSTEM_ACTION('Tra cuu Top ' || p_limit || ' ve xe moi dat');
        
        OPEN ds FOR
            SELECT * FROM (
                SELECT 
                    T."id" AS MAVE, 
                    U."name" AS TENKH, 
                    T."totalPrice" AS TONGTIEN,
                    T."createdAt" AS NGAYDAT,
                    T."status" AS TRANGTHAI
                FROM "Ticket" T, "User" U
                WHERE T."userId" = U."id"
                ORDER BY T."createdAt" DESC -- Sắp xếp vé mới nhất lên đầu
            ) WHERE ROWNUM <= p_limit; -- Dùng ROWNUM để cắt đúng số dòng yêu cầu (Top N)
    END GET_RECENT_BOOKINGS;

END PKG_BUSTICKET_UTILS;
/

-- >>> KIỂM TRA CÂU B (PACKAGE & ROWNUM):
-- TRUY VẤN 1: Thử gọi thủ tục ghi nhật ký từ bên trong Package.
EXEC PKG_BUSTICKET_UTILS.LOG_SYSTEM_ACTION('Test: Ghi log qua Package chuc nang');

-- TRUY VẤN 2: Thử lấy danh sách 3 vé xe đặt mới nhất bằng cách gọi Package.
var c REFCURSOR;
EXEC PKG_BUSTICKET_UTILS.GET_RECENT_BOOKINGS(3, :c);
PRINT c;

-- TRUY VẤN 3: Xem lại bảng Nhật ký để xác nhận tất cả mọi hành động đã được ghi lại bằng Sequence.
SELECT * FROM "ActionLog" ORDER BY "id" ASC;
