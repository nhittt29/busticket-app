"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import defaultAvatar from "@/assets/uploads/default.png";

const menuItems = [
    {
        label: "Tổng quan",
        href: "/account",
        icon: "dashboard",
    },
    {
        label: "Thông tin tài khoản",
        href: "/account/profile",
        icon: "person",
    },
    {
        label: "Vé của tôi",
        href: "/account/tickets",
        icon: "confirmation_number",
    },
    {
        label: "Đánh giá",
        href: "/account/reviews",
        icon: "rate_review",
    },
    {
        label: "Thông báo",
        href: "/account/notifications",
        icon: "notifications",
    },
];

export function AccountSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push("/auth/login");
    };

    return (
        <aside className="w-full lg:w-[280px] flex-shrink-0">
            {/* User Short Profile */}
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6 flex flex-col items-center text-center">
                <div className="relative mb-3">
                    <img
                        src={user?.avatar || defaultAvatar.src}
                        alt={user?.name || "User"}
                        className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 dark:border-slate-800 shadow-md"
                    />
                    <button className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full shadow-sm hover:bg-sky-600 transition-colors">
                        <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-full">
                    {user?.name || "Khách hàng"}
                </h3>
                <p className="text-sm text-slate-500 truncate max-w-full">{user?.email}</p>
            </div>

            {/* Menu */}
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <nav className="flex flex-col p-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${isActive ? "text-primary" : "text-slate-400"}`}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}

                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-2"></div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-left w-full"
                    >
                        <span className="material-symbols-outlined text-red-500">logout</span>
                        Đăng xuất
                    </button>
                </nav>
            </div>
        </aside>
    );
}
