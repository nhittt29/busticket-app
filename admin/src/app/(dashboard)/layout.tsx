import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white shadow-sm">
                    <SidebarTrigger className="-ml-1" />
                    <div className="w-px h-4 bg-gray-200 mx-2" />
                    <h1 className="text-lg font-bold text-[#023E8A]">busticket-app Admin</h1>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gray-50 min-h-[calc(100vh-4rem)]">
                    <div className="py-6">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
