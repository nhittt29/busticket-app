"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BusIcon, LayoutDashboard, CalendarDays, KeyRound, LogOut, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Quản lý vé", href: "/tickets", icon: Ticket },
    { name: "Đội xe & Sơ đồ ghế", href: "/buses", icon: BusIcon },
    { name: "Lịch trình chuyến đi", href: "/schedules", icon: CalendarDays },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="flex h-full w-64 flex-col border-r bg-white">
            <div className="flex h-16 shrink-0 items-center justify-center border-b px-6 bg-primary">
                <div className="flex items-center gap-2">
                    <BusIcon className="h-6 w-6 text-white" />
                    <span className="text-xl font-bold tracking-tight text-white">
                        Brand Portal
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto">
                <nav className="flex-1 space-y-1 p-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-primary",
                                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        isActive ? "text-primary" : "text-gray-400 group-hover:text-primary",
                                        "mr-3 h-5 w-5 flex-shrink-0"
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t p-4">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                            <span className="text-xs text-gray-500">Quản lý Nhà Xe</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-red-500 group-hover:text-red-600" />
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
}
