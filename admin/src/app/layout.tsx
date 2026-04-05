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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                const originalError = console.error;
                console.error = (...args) => {
                  const msg = args[0] || '';
                  const msgString = typeof msg === 'string' ? msg : String(msg);
                  if (
                    msgString.includes('Hydration') || 
                    msgString.includes('extra attributes') || 
                    msgString.includes('React') ||
                    msgString.includes('width(-1)') ||
                    msgString.includes('height(-1)') ||
                    msgString.includes('chart')
                  ) {
                    return;
                  }
                  originalError(...args);
                };

                const originalWarn = console.warn;
                console.warn = (...args) => {
                  const msg = args[0] || '';
                  const msgString = typeof msg === 'string' ? msg : String(msg);
                  if (
                    msgString.includes('Hydration') || 
                    msgString.includes('extra attributes') || 
                    msgString.includes('React') ||
                    msgString.includes('width(-1)') ||
                    msgString.includes('height(-1)') ||
                    msgString.includes('chart')
                  ) {
                    return;
                  }
                  originalWarn(...args);
                };
              }
            `,
          }}
        />
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