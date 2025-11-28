"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BusFront,
  Route,
  Ticket,
  Users,
  BellRing,
  Settings,
  BarChart3,
  LogOut,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@refinedev/core";
import Image from "next/image";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "Chuyến xe", icon: BusFront, href: "/schedules" },
  { title: "Tuyến đường", icon: Route, href: "/routes" },
  { title: "Xe buýt", icon: BusFront, href: "/buses" },
  { title: "Vé đã đặt", icon: Ticket, href: "/tickets" },
  { title: "Người dùng", icon: Users, href: "/users" },
  { title: "Thông báo", icon: BellRing, href: "/notifications" },
  { title: "Thống kê", icon: BarChart3, href: "/stats" },
  { title: "Cài đặt", icon: Settings, href: "/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { mutate: logout } = useLogout();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl font-black text-[#023E8A] flex items-center gap-3 py-6 px-4">
            <div className="relative w-8 h-8" suppressHydrationWarning>
              <Image src="/icon.png" alt="Logo" fill className="object-contain" />
            </div>
            busticket-app
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="text-base font-medium"
                  >
                    <Link href={item.href}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout()}
              className="text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span>Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}