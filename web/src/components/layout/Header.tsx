"use client";

import Link from "next/link";
import Image from "next/image";
import busLogo from "@/assets/images/bus_logo.png";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";

import { NotificationBell } from "./NotificationBell";

export function Header() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full bg-surface-light/95 dark:bg-background-dark/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
            <div className="px-4 lg:px-40 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-1 text-slate-900 dark:text-white">
                    <Image src={busLogo} alt="BusTicket Logo" width={120} height={120} className="rounded-lg object-contain" />
                    <h2 className="text-xl font-bold tracking-tight hidden sm:block">BusTicket</h2>
                </Link>
                <nav className="hidden lg:flex items-center gap-8">
                    <Link href="/" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium text-sm transition-colors">
                        Trang chủ
                    </Link>
                    <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium text-sm transition-colors">
                        Vé của tôi
                    </Link>
                    <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium text-sm transition-colors">
                        Khuyến mãi
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-2">
                            <NotificationBell />
                            <div className="relative group">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 pr-3 rounded-full transition-colors"
                                >
                                    <UserAvatar
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700"
                                        size={32}
                                    />
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{user.name}</span>
                                    <span className="material-symbols-outlined text-slate-500 text-lg">expand_more</span>
                                </button>

                                {/* Simple Dropdown */}
                                {/* Simple Dropdown */}
                                <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block hover:block z-50">
                                    <div className="bg-white dark:bg-surface-dark rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                        </div>
                                        <ul className="py-1">
                                            <li>
                                                <Link href="/account/profile" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                                    Hồ sơ
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/account/tickets" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                                    Vé của tôi
                                                </Link>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => logout()}
                                                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                                >
                                                    Đăng xuất
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link href="/auth/login">
                            <button className="hidden sm:flex h-10 px-6 items-center justify-center rounded-lg bg-primary hover:bg-sky-600 text-white text-sm font-bold transition-colors shadow-sm shadow-primary/30">
                                Đăng nhập / Đăng ký
                            </button>
                        </Link>
                    )}

                    <button className="lg:hidden p-2 text-slate-600 dark:text-slate-300">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
