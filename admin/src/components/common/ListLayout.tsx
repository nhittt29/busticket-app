import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LucideIcon } from "lucide-react";

interface ListLayoutProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    actions?: ReactNode;
    filters?: ReactNode;
    children: ReactNode;
}

export function ListLayout({
    title,
    description,
    icon: Icon,
    actions,
    filters,
    children,
}: ListLayoutProps) {
    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        {Icon && <Icon className="w-6 h-6 text-primary" strokeWidth={2.5} />}
                        {title}
                    </h2>
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            </div>

            <Separator />

            {filters && (
                <div className="bg-card p-4 rounded-xl border shadow-sm">
                    {filters}
                </div>
            )}

            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    {children}
                </CardContent>
            </Card>
        </div>
    );
}
