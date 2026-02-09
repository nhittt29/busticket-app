"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
    const { user } = useAuthStore();
    const { notifications, loading, markAsRead, markAllAsRead, refresh } = useNotifications();

    if (loading && notifications.length === 0) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thông báo</h1>
                    <p className="text-slate-500 text-sm mt-1">Cập nhật tin tức mới nhất</p>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={markAllAsRead}
                        className="text-sm font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Đánh dấu đã đọc tất cả
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                    <div className="inline-flex w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-4xl text-slate-300">notifications_off</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Không có thông báo mới</h3>
                    <p className="text-slate-500">Bạn sẽ nhận được thông báo khi có cập nhật về chuyến đi.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={cn(
                                "p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-4",
                                !notification.isRead ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                            )}
                        >
                            <div className={cn(
                                "w-3 h-3 mt-1.5 rounded-full shrink-0",
                                !notification.isRead ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                            )}></div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={cn("text-base font-semibold text-slate-900 dark:text-white", !notification.isRead ? "font-bold" : "")}>
                                        {notification.title}
                                    </h4>
                                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4 flex items-center gap-2">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
                                        {notification.type === 'VIRTUAL' && <span className="ml-2 text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded border border-slate-200 dark:border-slate-700">Tự động</span>}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {notification.message}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
