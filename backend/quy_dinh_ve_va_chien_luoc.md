# 🎟️ Quy Định Hủy Vé & Giải Pháp Bán Vé Chặng Ngắn

---

## 1. Quy Định Hủy Vé

### 1.1. Vé Đã Thanh Toán (Paid)

Áp dụng cho khách đã thanh toán qua MoMo/Thẻ:

| Thời điểm hủy | Phí hủy | Hoàn tiền |
|--------------|---------|-----------|
| Trước giờ khởi hành > 24 giờ | 10% giá vé | 90% |
| Trước giờ khởi hành 4–24 giờ | 30% giá vé | 70% |
| Trước giờ khởi hành < 4 giờ | ❌ Không được hủy (Hệ thống sẽ chặn) | — |

### 1.2. Vé Đặt Chỗ (Booked – Chưa thanh toán)

- Được phép hủy nếu còn > 2 tiếng trước giờ khởi hành.
- Không mất phí (vì chưa thanh toán).

---

## 2. Giải Pháp Bán Vé Chặng Ngắn Trên Tuyến Dài

**Ví dụ:** Tuyến Sài Gòn → Cần Thơ, khách muốn xuống Vĩnh Long.

### 🎯 Mục tiêu

- Tối đa hóa doanh thu (tránh ghế trống).
- Ưu tiên khách đi full tuyến.
- Vẫn bán được chặng ngắn nếu còn chỗ.

---

## 3. Chiến Lược "Ưu Tiên Theo Thời Gian" (Time-Based Priority)

### Giai đoạn 1: Bán Giữ Chỗ (Ngày mở bán → Trước giờ khởi hành 24h)

**Nguyên tắc:** Ưu tiên khách đi full tuyến.

**Cách xử lý khách đi Vĩnh Long:**

- Vẫn bán, nhưng tính giá full tuyến (Sài Gòn → Cần Thơ).
- Giải thích:  
  “Đây là vé đi Cần Thơ, nhà xe hỗ trợ trả khách tại Vĩnh Long. Quý khách thanh toán đủ vé toàn chặng để giữ chỗ.”

**Lợi ích:**

- Đảm bảo không mất ghế full tuyến cho khách đặt sau.

---

### Giai đoạn 2: Tối Ưu Lấp Đầy (24h cuối)

**Điều kiện:** Xe còn trống nhiều ghế, ví dụ lấp đầy < 70%.

**Hành động:**

- Hệ thống tự mở bán vé chặng ngắn (Sài Gòn → Vĩnh Long).
- Giá vé áp dụng đúng theo chặng ngắn.

**Lợi ích:**

- Tăng doanh thu thay vì để ghế trống.

---

### Giai đoạn 3: Giờ Chót (Last-minute tại bến)

**Hành động:**

- Tài xế/lơ xe bán linh hoạt chặng ngắn (tiền mặt/vé tay).
- Cập nhật vào hệ thống sau.

---

## 4. Giải Pháp Triển Khai Trên App – MVP

### ✔️ Phương án: “Bán Vé Toàn Tuyến – Ghi Nhận Điểm Trả”

**Triển khai:**

- Giá vé luôn tính toàn tuyến (VD: 165.000đ).
- Khách chọn điểm trả: “Vĩnh Long”.
- Trên vé:  
  - Tuyến: Sài Gòn → Cần Thơ  
  - Ghi chú: Trả tại Vĩnh Long

**Thông báo hiển thị:**

> “Quý khách đang đặt chỗ trên tuyến Sài Gòn – Cần Thơ. Giá vé được tính toàn chặng để đảm bảo giữ chỗ.”

**Ưu điểm:**

- Rất dễ triển khai.
- Nhà xe lớn như Phương Trang/Thành Bưởi đang áp dụng.
  