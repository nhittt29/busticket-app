# Database Utility Scripts

Thư mục này chứa các script quan trọng để quản lý Database Oracle cho dự án BusTicket.

## 1. `reset.ts` - Xóa Sạch Database
*   **Chức năng**: Xóa toàn bộ Bảng (Tables) và Sequence hiện có trong Schema.
*   **Cách hoạt động**:
    *   Kết nối vào Oracle.
    *   Tìm tất cả bảng (`user_tables`) và sequence (`user_sequences`).
    *   Dùng lệnh `DROP ... CASCADE CONSTRAINTS PURGE` để xóa triệt để.
*   **Khi nào dùng**: Khi muốn làm sạch sẽ database để cài lại từ đầu.
*   **Lệnh chạy**:
    ```bash
    npx ts-node database/reset.ts
    ```

## 2. `seed.ts` - Khởi Tạo & Nạp Dữ Liệu
*   **Chức năng**: Tạo lại cấu trúc bảng (nếu chưa có) và nạp dữ liệu mẫu.
*   **Cách hoạt động**:
    *   `synchronize: true`: Tự động tạo bảng dựa trên file Entity (`src/entities/*.ts`).
    *   Tạo 2 Role mặc định: `ADMIN`, `PASSENGER`.
    *   Tạo 2 User mặc định:
        *   Admin: `admin@busticket.com` / `AdminBus123@@`
        *   Passenger: `passenger@gmail.com` / `BusTicket123@@`
    *   Đồng bộ user sang Firebase Auth (nếu chưa có trên Firebase).
*   **Khi nào dùng**: Sau khi reset, hoặc khi muốn thêm dữ liệu mẫu.
*   **Lệnh chạy**:
    ```bash
    npm run seed
    ```

## 3. `debug-seq.ts` - Fix Lỗi Nhảy ID (Sequence Cache)
*   **Chức năng**: Khắc phục hiện tượng ID tự tăng bị nhảy số lớn (ví dụ từ 5 nhảy lên 25) sau khi restart server.
*   **Nguyên nhân**: Oracle mặc định cache 20 số sequence để tối ưu. Khi restart, số trong cache bị mất gây ra khoảng trống.
*   **Cách hoạt động**:
    *   Tìm tất cả sequence trong Schema.
    *   Chạy lệnh `ALTER SEQUENCE ... NOCACHE` để tắt tính năng cache.
*   **Khi nào dùng**: Chạy ngay sau khi `seed.ts` tạo xong bảng/sequence mới.
*   **Lệnh chạy**:
    ```bash
    npx ts-node database/debug-seq.ts
    ```

---

## 🚀 Lệnh Tổng Hợp (Khuyên Dùng)
Để thực hiện quy trình "Làm mới hoàn toàn" (Xóa -> Tạo lại -> Fix lỗi), hãy dùng lệnh tắt đã được cấu hình trong `package.json`:

```bash
npm run db:reset
```
*(Lệnh này sẽ chạy lần lượt: `reset.ts` --> `seed.ts` --> `debug-seq.ts`)*
