"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "upcoming" | "history" | "cancelled";

export default function MyTicketsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("upcoming");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vé của tôi</h1>
                <p className="text-slate-500 text-sm mt-1">Quản lý các chuyến đi của bạn</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab("upcoming")}
                    className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "upcoming"
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                >
                    Sắp khởi hành
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "history"
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                >
                    Lịch sử
                </button>
                <button
                    onClick={() => setActiveTab("cancelled")}
                    className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "cancelled"
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                >
                    Đã hủy
                </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {/* Empty State */}
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
                    <div className="inline-flex w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-4xl text-slate-300">confirmation_number</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Chưa có vé nào</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">Bạn chưa có chuyến đi nào trong mục này. Hãy đặt vé ngay để trải nghiệm những hành trình thú vị.</p>
                    <Link href="/">
                        <button className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-sky-600 transition-colors shadow-lg shadow-primary/20">
                            Tìm chuyến xe
                        </button>
                    </Link>
                </div>

                {/* Example Mock Ticket (Hidden for Empty State demo, but structure for later) */}
                {/* 
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded">Đã thanh toán</span>
                                <span className="text-slate-400 text-sm">Mã vé: #XC9283</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">20:00</p>
                                    <p className="text-xs text-slate-500">20/05/2024</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center px-4">
                                     <p className="text-xs text-slate-400 mb-1">5h 30m</p>
                                     <div className="w-full h-px bg-slate-200 relative">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-slate-300 bg-white"></div>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-primary bg-primary"></div>
                                     </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">05:30</p>
                                    <p className="text-xs text-slate-500">21/05/2024</p>
                                </div>
                            </div>
                            <div className="flex justify-between mt-3 px-1">
                                <p className="font-semibold text-slate-700 dark:text-slate-200">Sài Gòn</p>
                                <p className="font-semibold text-slate-700 dark:text-slate-200">Đà Lạt</p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-end border-l border-slate-100 dark:border-slate-800 pl-0 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0">
                             <p className="text-primary font-bold text-lg mb-2">350.000đ</p>
                             <button className="w-full md:w-auto px-4 py-2 border border-primary text-primary text-sm font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">
                                Xem chi tiết
                             </button>
                        </div>
                    </div>
                </div>
                */}
            </div>
        </div>
    );
}
