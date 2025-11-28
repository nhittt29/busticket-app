// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { RefineProvider } from "@/providers/refine-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "busticket-app Admin – Quản lý hệ thống đặt vé xe khách",
  description: "Admin Panel chính thức của busticket-app – Siêu phẩm Việt Nam 2025",
};

import { Suspense } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Suspense>
          <RefineProvider>
            {children}
            <Toaster position="top-right" richColors />
          </RefineProvider>
        </Suspense>
      </body>
    </html>
  );
}