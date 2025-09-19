-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'customer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "seatCount" INTEGER NOT NULL,
    "type" TEXT,

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Route" (
    "id" SERIAL NOT NULL,
    "startPoint" TEXT NOT NULL,
    "endPoint" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "intermediatePoints" TEXT,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Schedule" (
    "id" SERIAL NOT NULL,
    "busId" INTEGER NOT NULL,
    "routeId" INTEGER NOT NULL,
    "departureAt" TIMESTAMP(3) NOT NULL,
    "arrivalAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ticket" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "seatNumber" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'booked',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_licensePlate_key" ON "public"."Bus"("licensePlate");

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_busId_fkey" FOREIGN KEY ("busId") REFERENCES "public"."Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "public"."Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ticket" ADD CONSTRAINT "Ticket_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "public"."Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
