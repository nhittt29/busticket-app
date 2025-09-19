
Hướng dẫn clone project busticket-app từ GitHub và chạy dự án

1. Clone repo
   git clone https://github.com/nhittt29/busticket-app.git

   Kết quả sau khi clone:
   busticket-app/
    ├─ backend/
    ├─ frontend/
    ├─ .gitignore
    └─ README.md

2. Cài dependencies cho từng phần

   - Backend:
     cd busticket-app/backend
     npm install

   - Frontend (Flutter):
     cd ../frontend
     flutter pub get

3. Thêm file .env (quan trọng)
   Vì .env đã bị ignore, nên sau khi clone repo sẽ không có file này.
   Bạn phải tự tạo lại trong backend/.env, ví dụ:

   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/busticket_db?schema=public"

4. Chạy dự án
   - Backend:
     cd backend
     npm run start:dev

   - Frontend (Flutter):
     cd frontend
     flutter run
