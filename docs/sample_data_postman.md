# Dữ liệu Mẫu Postman - Time-Based Pricing Testing

## Giải thích Quy tắc Tính Giá
Hệ thống xử lý tách biệt giữa **"Phụ thu dịch vụ" (Surcharge)** và **"Giảm giá chặng ngắn" (Price Difference)**.

1. **Bước 1: Phụ thu cố định**
   - Luôn luôn cộng `surcharge` vào giá vé (ví dụ: phí xe trung chuyển, phí bến bãi đặc biệt).
   - *Ví dụ: Điểm trả có `surcharge: 20000` -> Mặc định cộng 20k.*

2. **Bước 2: Xét điều kiện giảm giá**
   - Chỉ khi đủ 2 điều kiện: **Còn < 24h** VÀ **Xe còn trống > 20%**.
   - Lúc đó mới cộng thêm `priceDifference` (số âm) vào tổn phí.
   - *Ví dụ: Điểm trả có `priceDifference: -140000` -> Tổng chênh lệch = 20k + (-140k) = -120k.*

**Kết quả:**
- Nếu xe vắng khách, sát giờ: Giá vé giảm 120k.
- Nếu xe đầy hoặc đặt sớm: Giá vé tăng 20k (chỉ tính phụ thu, không giảm).

---

Dùng API: `POST http://localhost:3000/api/schedules/:scheduleId/dropoff-points`  
*(Thay `:scheduleId` bằng ID chuyến xe thực tế)*

## 1. Tuyến: Sài Gòn ➝ Cần Thơ
*Gốc: ~165.000đ*

### a. Ngã 3 Cai Lậy (Tiền Giang) - Giảm 60k
```json
{
    "name": "Ngã 3 Cai Lậy (Tiền Giang)",
    "address": "QL1A, Thị xã Cai Lậy, Tiền Giang",
    "surcharge": 0,
    "priceDifference": -60000,
    "order": 1
}
```

### b. Cầu Mỹ Thuận (Vĩnh Long) - Giảm 30k
```json
{
    "name": "Chân Cầu Mỹ Thuận (Vĩnh Long)",
    "address": "QL1A, Tân Hòa, Vĩnh Long",
    "surcharge": 0,
    "priceDifference": -30000,
    "order": 2
}
```

### c. Trung tâm TP. Vĩnh Long - Giảm 20k, Phụ thu 20k
*(Khách xuống dọc đường nhưng + xe trung chuyển)*
```json
{
    "name": "TP. Vĩnh Long (Có xe trung chuyển)",
    "address": "Phường 1, TP. Vĩnh Long",
    "surcharge": 20000,
    "priceDifference": -20000,
    "order": 3
}
```

---

## 2. Tuyến: Sài Gòn ➝ Đà Lạt
*Gốc: ~300.000đ*

### a. Madagui (Đầu đèo chuối) - Giảm 120k
```json
{
    "name": "Trạm dừng Madagui",
    "address": "QL20, Đạ Huoai, Lâm Đồng",
    "surcharge": 0,
    "priceDifference": -120000,
    "order": 1
}
```

### b. TP. Bảo Lộc - Giảm 80k
```json
{
    "name": "Bến xe Đức Long (Bảo Lộc)",
    "address": "Trần Phú, Lộc Sơn, Bảo Lộc",
    "surcharge": 0,
    "priceDifference": -80000,
    "order": 2
}
```

### c. Ngã 3 Phi Nôm - Giảm 30k
```json
{
    "name": "Ngã 3 Phi Nôm (Đức Trọng)",
    "address": "Hiệp Thạnh, Đức Trọng, Lâm Đồng",
    "surcharge": 0,
    "priceDifference": -30000,
    "order": 3
}
```

---

## 3. Tuyến: Sài Gòn ➝ Nha Trang
*Gốc: ~280.000đ*

### a. Phan Thiết (Dọc QL1A) - Giảm 140k
```json
{
    "name": "Ngã 3 Phan Thiết (QL1A)",
    "address": "Vòng xoay Bắc Phan Thiết",
    "surcharge": 0,
    "priceDifference": -140000,
    "order": 1
}
```

### b. Phan Rang (Ninh Thuận) - Giảm 60k
```json
{
    "name": "Ngã 5 Phủ Hà (Phan Rang)",
    "address": "Phan Rang - Tháp Chàm, Ninh Thuận",
    "surcharge": 0,
    "priceDifference": -60000,
    "order": 2
}
```
