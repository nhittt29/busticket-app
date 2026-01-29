"use client";

import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

export default function AccountDashboard() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tổng quan</h1>
                <p className="text-slate-500 text-sm mt-1">Chào mừng trở lại, {user?.name || "Khách hàng"}!</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <span className="material-symbols-outlined">confirmation_number</span>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Vé đã đặt</p>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white">0</h4>
                    </div>
                </div>
                <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined">savings</span>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tiết kiệm</p>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white">0đ</h4>
                    </div>
                </div>
                <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <span className="material-symbols-outlined">star</span>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Điểm thưởng</p>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white">0</h4>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 dark:text-white">Vé gần đây</h3>
                        <Link href="/account/tickets" className="text-sm text-primary font-medium hover:underline">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="p-8 text-center">
                        <div className="inline-flex w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-3xl text-slate-300">confirmation_number</span>
                        </div>
                        <p className="text-slate-500 font-medium">Bạn chưa có chuyến đi nào gần đây</p>
                        <Link href="/">
                            <button className="mt-4 px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-sky-600 transition-colors">
                                Đặt vé ngay
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white">Thông tin cá nhân</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                            <span className="text-slate-500 text-sm">Họ và tên</span>
                            <span className="text-slate-900 dark:text-white font-medium text-sm">{user?.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                            <span className="text-slate-500 text-sm">Email</span>
                            <span className="text-slate-900 dark:text-white font-medium text-sm">{user?.email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                            <span className="text-slate-500 text-sm">Số điện thoại</span>
                            <span className="text-slate-900 dark:text-white font-medium text-sm">{user?.phone || "Chưa cập nhật"}</span>
                        </div>
                        <div className="pt-2">
                            <Link href="/account/profile">
                                <button className="w-full py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    Cập nhật thông tin
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
