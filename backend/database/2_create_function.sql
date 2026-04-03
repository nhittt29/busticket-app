-- ==========================================
-- 2. YÊU CẦU: TẠO FUNCTION (HÀM TÍNH TOÁN) 
-- ==========================================
-- Tên Hàm: F_REVENUE_BY_USER (Tổng tiền mà một Hành khách đã mua)
-- Mục đích: Nhận đầu vào là "id" của một Hành khách (ví dụ: số 1, 2)
--           Trả về 1 con số (NUMBER) là tổng tất cả các tiền vé mà người đó 
--           đã thanh toán thành công (PAID).

CREATE OR REPLACE FUNCTION F_REVENUE_BY_USER (p_userId NUMBER)
RETURN NUMBER
IS
    v_TongTien NUMBER;
BEGIN
    -- Lệnh Tính Tổng
    SELECT SUM("totalPrice")
    INTO v_TongTien
    FROM "Ticket"
    WHERE "userId" = p_userId
      AND "status" = 'PAID';

    -- NVL giúp tránh tình trạng báo lỗi nếu như 
    -- ông khách đó chưa mua bất kỳ vé nào (v_TongTien bị NULL)
    RETURN NVL(v_TongTien, 0);

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 0;
    WHEN OTHERS THEN
        RETURN NULL;
END;

-- ==========================================
-- Cách gõ lệnh chạy để Test:
-- CÚ PHÁP: SELECT tên_hàm(tham_số) FROM DUAL;
-- ==========================================
-- SELECT F_REVENUE_BY_USER(1) AS TONG_TIEN_KHACH_1 FROM DUAL;
-- SELECT F_REVENUE_BY_USER(2) AS TONG_TIEN_KHACH_2 FROM DUAL;
