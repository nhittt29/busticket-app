"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Bell } from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export function NotificationBell() {
    const { user } = useAuthStore();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    // Show only top 5 in dropdown
    const displayNotifications = notifications.slice(0, 5);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                                Đánh dấu đã đọc tất cả
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {displayNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">notifications_off</span>
                                <p className="text-sm text-slate-500">Chưa có thông báo nào</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {displayNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => markAsRead(notification.id)}
                                        className={cn(
                                            "p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3",
                                            !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                                        )}
                                    >
                                        <div className={cn(
                                            "w-2 h-2 mt-2 rounded-full shrink-0",
                                            !notification.isRead ? "bg-blue-600" : "bg-transparent"
                                        )}></div>
                                        <div className="flex-1">
                                            <h4 className={cn("text-sm font-semibold text-slate-900 dark:text-white mb-1", !notification.isRead ? "font-bold" : "")}>
                                                {notification.title}
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-slate-400 flex items-center gap-2">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
                                                {notification.type === 'VIRTUAL' && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded border border-slate-200 dark:border-slate-700">Tự động</span>}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center">
                        <Link
                            href="/account/notifications"
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 block w-full py-1"
                        >
                            Xem tất cả ({notifications.length})
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
