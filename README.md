# BUSTICKET - Tai Lieu Ky Thuat Du An

BUSTICKET la he thong quan ly va dat ve xe khach truc tuyen cho Ben xe Mien Dong, bao gom ung dung di dong cho khach hang va he thong Backend API quan ly tap trung. Tai lieu nay huong dan cau truc du an, cach cai dat moi truong phat trien va cac quy uoc lap trinh (coding standards).

---

## 1. Kien truc va To chuc Thu muc

Du an duoc to chuc theo mo hinh Monorepo bao gom 2 thu muc chinh:

```
busticket-app/
├── backend/
│   ├── src/
│   │   ├── config/         # Cau hinh he thong (Environment, Constants)
│   │   ├── controllers/    # Tiep nhan request (API Endpoints)
│   │   ├── dtos/           # Data Transfer Objects (Validation)
│   │   ├── models/         # Database Models
│   │   ├── modules/        # Cac module nghiep vu (Auth, User, Bus...)
│   │   ├── queues/         # Xu ly background job (Redis Bull)
│   │   ├── redis/          # Cau hinh Redis Cache
│   │   ├── repositories/   # Tuong tac Database (Prisma)
│   │   ├── services/       # Logic nghiep vu chinh
│   │   ├── stats/          # Thong ke bao cao
│   │   ├── validators/     # Custom validators
│   │   ├── app.module.ts   # Root Module
│   │   └── main.ts         # Entry point
│   ├── test/               # Unit & E2E Tests
│   └── package.json
│
├── frontend/
│   ├── assets/             # Tai nguyen (Images, Icons, Fonts)
│   ├── lib/
│   │   ├── ai_chat/        # Tinh nang Chatbot & Voice
│   │   ├── bloc/           # Global State Management
│   │   ├── booking/        # Quy trinh dat ve (Chon ghe, lich trinh)
│   │   ├── models/         # Data Models (Dart Objects)
│   │   ├── payment/        # Tich hop thanh toan (Zalo, Momo, VNPAY)
│   │   ├── promotions/     # Quan ly khuyen mai
│   │   ├── repositories/   # Data Layer (API fetching)
│   │   ├── review/         # Danh gia & Phan hoi
│   │   ├── screens/        # Cac man hinh chung (Home, Login, Profile)
│   │   ├── services/       # Cac service tien ich (API, Storage, Format)
│   │   ├── theme/          # Hinh anh giao dien (Colors, Fonts)
│   │   ├── ticket/         # Quan ly ve cua toi (QR Code, History)
│   │   └── main.dart       # Entry point
│   └── pubspec.yaml
│
└── README.md
```

### Backend (backend/)
Xay dung 3 tang (3-layer architecture) dua tren NestJS Framework:
- **src/modules**: Chua cac Module nghiep vu chinh (Auth, Bus, Ticket, Booking, Payment, ...).
- **src/controllers**: Tiep nhan request va tra ve response, khong chua logic nghiep vu.
- **src/services**: Xu ly logic nghiep vu api, tuong tac voi co so du lieu.
- **src/repositories**: Lop tuong tac truc tiep voi Database (Prisma Client).
- **src/queues**: Xu ly cac tac vu nen (Background Jobs) voi Redis/Bull (VD: Huy ve qua han).

### Frontend (frontend/)
Phat trien bang Flutter cho ung dung di dong anroid/ios:
- **lib/screens**: Chua giao dien man hinh (UI).
- **lib/bloc**: Quan ly trang thai ung dung (State Management) theo mo hinh BLoC.
- **lib/services**: Chua cac lop giao tiep voi Backend API va cac dich vu ben thu 3 (ZaloPay, AI, ...).
- **lib/payment**: Module rieng biet xu ly thanh toan (ZaloPay, MoMo, VNPAY).
- **lib/ai_chat**: Module tro ly ao va xu ly giong noi (Voice to Text).

---

## 2. Huong dan Cai dat Moi truong (Local Development)

### 2.1 Khoi tao Ung dung Di dong (Frontend)
Yeu cau: Da cai dat Flutter SDK.

1.  Di chuyen vao thu muc frontend:
    ```bash
    cd frontend
    ```
2.  Cai dat cac thu vien phu thuoc:
    ```bash
    flutter pub get
    ```
3.  Cau hinh dia chi IP API:
    - Mo file `lib/services/api_service.dart`.
    - Cap nhat bien `baseUrl` thanh dia chi IP LAN cua may tinh (neu chay tren thiet bi that) hoac `10.0.2.2` (neu chay tren Android Emulator).
4.  Khoi chay ung dung:
    ```bash
    flutter run
    ```

### 2.2 Khoi tao He thong Backend
Yeu cau: Node.js, PostgreSQL, Redis.

1.  Di chuyen vao thu muc backend:
    ```bash
    cd backend
    ```
2.  Cai dat cac goi thu vien:
    ```bash
    npm install
    ```
3.  Cau hinh bien moi truong:
    - Sao chep file `.env.example` thanh `.env`.
    - Cap nhat chuoi ket noi Database (`DATABASE_URL`), Redit Host va cac API Key (ZaloPay, MoMo, VNPAY, Google AI).
4.  Dong bo cau truc co so du lieu (Prisma):
    ```bash
    npx prisma migrate dev
    ```
5.  Khoi chay server o che do development:
    ```bash
    npm run start:dev
    ```
    Server se hoat dong tai dia chi: `http://localhost:3000`.

---

## 3. Quy uoc Phat trien va Tieu chuan Code

### 3.1 Quy tac Dat ten
- **Bien va Ham (Variables/Functions):** Su dung camelCase. (Vi du: `getTicketDetails`, `isPaymentSuccess`).
- **Lop (Classes):** Su dung PascalCase. (Vi du: `AuthController`, `PaymentService`).
- **Ten File:** Su dung snake_case. (Vi du: `auth_controller.ts`, `home_screen.dart`).
- **Constanst:** Su dung SCREAMING_SNAKE_CASE. (Vi du: `MAX_TIMEOUT_SECONDS`).

### 3.2 Clean Code va Modularity
- **Backend:** Tuan thu nguyen tac D.R.Y (Don't Repeat Yourself) va S.O.L.I.D. Moi Service chi nen dam nhan mot nhiem vu cu the. Logic phuc tap nen duoc tach ra khoi Controller.
- **Frontend:** Su dung BLoC de tach biet logic nghiep vu (Business Logic) khoi giao dien (UI). Cac Widget nen duoc chia nho de tai su dung (Reusable Widgets).

### 3.3 Quan ly Cau hinh
- Khong luu tru thong tin nhay cam (Mat khau DB, API Keys, Secret Keys) truc tiep trong Source Code.
- Su dung file `.env` de quan ly cac bien moi truong.
- File `.env` da duoc them vao `.gitignore` de tranh lo lot thong tin.

### 3.4 Quy uoc API
- API phai tra ve du lieu dong nhat theo cau truc JSON:
    ```json
    {
      "data": { ... },
      "message": "Mo ta ket qua",
      "statusCode": 200
    }
    ```
- Su dung dung cac dong tu HTTP (GET, POST, PUT, DELETE) theo chuan RESTful API.
