import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "BusTicket - Book Bus Tickets Online",
  description: "The world's largest online bus ticket booking service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Material Symbols */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${plusJakartaSans.className} antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-50 flex flex-col min-h-screen`}
      >
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <ChatWidget />
        <Footer />
      </body>
    </html>
  );
}
