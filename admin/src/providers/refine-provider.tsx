"use client";

import { Refine } from "@refinedev/core";
import { authProvider } from "./auth-provider";
import { dataProvider } from "./data-provider";
import routerProvider from "@refinedev/nextjs-router";

export function RefineProvider({ children }: { children: React.ReactNode }) {
    return (
        <Refine
            authProvider={authProvider}
            dataProvider={dataProvider}
            routerProvider={routerProvider}
            resources={[
                {
                    name: "users",
                    list: "/users",
                    create: "/users/create",
                    edit: "/users/edit/:id",
                    show: "/users/show/:id",
                    meta: { label: "Người dùng" },
                },
                {
                    name: "brands",
                    list: "/brands",
                    create: "/brands/create",
                    edit: "/brands/edit/:id",
                    show: "/brands/show/:id",
                    meta: { label: "Nhà xe" },
                },
                {
                    name: "buses",
                    list: "/buses",
                    create: "/buses/create",
                    edit: "/buses/edit/:id",
                    show: "/buses/show/:id",
                    meta: { label: "Xe khách" },
                },
                {
                    name: "routes",
                    list: "/routes",
                    create: "/routes/create",
                    edit: "/routes/edit/:id",
                    show: "/routes/show/:id",
                    meta: { label: "Tuyến đường" },
                },
                {
                    name: "schedules",
                    list: "/schedules",
                    create: "/schedules/create",
                    edit: "/schedules/edit/:id",
                    show: "/schedules/show/:id",
                    meta: { label: "Lịch trình" },
                },
                {
                    name: "tickets",
                    list: "/tickets",
                    create: "/tickets/create",
                    edit: "/tickets/edit/:id",
                    show: "/tickets/show/:id",
                    meta: { label: "Vé xe" },
                },
                {
                    name: "promotions",
                    list: "/promotions",
                    create: "/promotions/create",
                    edit: "/promotions/edit/:id",
                    show: "/promotions/show/:id",
                    meta: { label: "Khuyến mãi" },
                },
                {
                    name: "stats",
                    list: "/stats",
                    meta: { label: "Thống kê" },
                },
            ]}
            options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
            }}
        >
            {children}
        </Refine>
    );
}
