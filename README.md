# Hướng dẫn clone project Busticket-App từ GitHub và chạy dự án

## 1. Clone repo

Sử dụng lệnh sau để clone repository:

```bash
git clone [https://github.com/nhittt29/busticket-app.git](https://github.com/nhittt29/busticket-app.git)
```

```Project structure
Kết quả sau khi clone:
busticket-app/
 ├─ backend/
 ├─ frontend/
 ├─ .gitignore
 └─ README.md
```

## 2. Cài dependencies cho từng phần

- **Backend:**

```bash
cd busticket-app/backend
npm install
```

- **Frontend (Flutter):**

```bash
cd ../frontend
flutter pub get
```

## 3. Thêm file `.env` (quan trọng)

File `.env` đã bị `.gitignore`, nên sau khi clone repo sẽ không có file này.  
Bạn phải tự tạo lại trong `backend/.env`. Ví dụ:

```env
# PostgreSQL
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/busticket-app?schema=public"

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH="./src/config/firebase.json"
```

## 4. Chạy dự án

- **Backend:**

```bash
cd backend
npm run start:dev
```

- **Frontend (Flutter):**

```bash
cd frontend
flutter run
```

## 5. Chạy seed database (nếu có)

- **Backend:**

```bash
npx ts-node prisma/seed.ts
```
