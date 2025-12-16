# GIẢI PHÁP: QUẢN LÝ KHO GHẾ THEO TẦNG (TIERED SEAT INVENTORY)

Thay vì áp dụng cứng nhắc một luật cho toàn bộ xe, giải pháp này chia
ghế thành các tầng (tier) để vận hành linh hoạt, tối ưu doanh thu và
trải nghiệm khách hàng.

------------------------------------------------------------------------

## 1. Phân Loại Ghế & Chiến Lược Giá

**Giả sử xe 40 giường:**

-   **Nhóm A (Priority):** 35 ghế (bao gồm tất cả ghế trừ 5 ghế cuối).
    -   **Bán Full Tuyến:** Tất cả các ghế (bao gồm cả Nhóm A và B) đều được đối xử như nhau về quyền mua. Khách mua full tuyến có thể chọn bất kỳ ghế trống nào.
    -   **Bán Chặng Ngắn:** Khách chặng ngắn **KHÔNG** được chọn ghế này trong giai đoạn mở bán sớm (trừ khi chấp nhận trả tiền full tuyến).
-   **Nhóm B (Standard/Back):** 5 ghế cuối / tầng dưới.
    -   **Dành riêng cho khách chặng ngắn:** Được bán với giá đúng chặng (thấp hơn) ngay từ đầu.
    -   Khách full tuyến vẫn có thể ngồi đây nếu muốn (nhưng thường họ sẽ ưu tiên Nhóm A hơn).

### Chiến lược theo thời gian

| Giai đoạn | Hành động |
| :--- | :--- |
| **Giai đoạn mở bán sớm** | - **Giữ chặt ghế Nhóm A:** Không giảm giá cho chặng ngắn. Khách chặng ngắn muốn ngồi phải trả full tiền.<br>- **Mở bán Nhóm B:** Bán vé chặng ngắn với giá đúng chặng. |
| **12h - 24h trước giờ chạy** | - Nếu xe vắng (< 70%): Tự động **"hạ cấp"** một phần ghế Nhóm A.<br>→ Cho phép bán chặng ngắn (giá đúng chặng hoặc có phụ phí nhẹ). |
| **Giờ chót (< 2h)** | - **Xả kho:** Mở bán toàn bộ ghế còn lại cho khách chặng ngắn. |

------------------------------------------------------------------------

## 2. Logic Hiển Thị Trên App (UX Flow)

### Hiển thị sơ đồ xe
-   **Màu Vàng (Ưu tiên - Nhóm A):** Ghế dành ưu tiên cho khách đi full tuyến.
-   **Màu Xanh (Tiết kiệm - Nhóm B):** Ghế dành cho khách đi chặng ngắn (hoặc khách muốn tiết kiệm).

### Popup cảnh báo
Khi khách chọn điểm xuống là chặng ngắn (VD: Vĩnh Long), nhưng bấm chọn **Ghế Vàng**:

> "Đây là ghế ưu tiên cho chặng Sài Gòn – Cần Thơ.
> Để đặt ghế này về Vĩnh Long, quý khách vui lòng thanh toán đủ vé toàn chặng."

Nút hành động:
-   **[Đồng ý đặt]** (Tính giá full)
-   **[Chọn ghế tiết kiệm khác]** (Quay lại chọn ghế Xanh)

------------------------------------------------------------------------

## 3. Quy Trình Xử Lý Nghiệp Vụ (Backend & Operation)

### 1. Quy tắc "Chốt chặn"
-   Vé **chặng ngắn (Nhóm B)**:
    -   Trên vé và app tài xế hiển thị rõ: **Điểm xuống: Vĩnh Long**.
-   Vé **full tuyến (Nhóm A)** nhưng khách xuống giữa đường:
    -   App tài xế hiển thị: **"Điểm trả: Vĩnh Long (Khách VIP / Vé Full tuyến)"**.

### 2. Quy tắc "Tự động hạ cấp" (Automation)
-   Job chạy định kỳ (hoặc check realtime khi book):
    -   Nếu `(DepartureTime - Now) < 24h` VÀ `(DepartureTime - Now) > 12h`:
        -   Check Occupancy < 70%.
        -   Nếu thỏa: Áp dụng bảng giá chặng ngắn cho cả ghế Nhóm A (hoặc 1 lượng nhất định).

### 3. Quy tắc "Ghế quay vòng" (Nâng cao -- triển khai sau)
-   Khi khách mua ghế Nhóm B (Sài Gòn → Vĩnh Long), hệ thống có thể mở bán tiếp chặng Vĩnh Long → Cần Thơ.

------------------------------------------------------------------------

**Kết luận:**
Mô hình này đảm bảo quyền lợi cho khách đi xe đường dài (luôn có ghế đẹp), đồng thời tận dụng tối đa ghế trống cho khách chặng ngắn mà không làm loãng doanh thu.
