"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Terminal } from "lucide-react";
import api from "@/lib/api";

interface IActionLog {
    id: number;
    actionName: string;
    logTime: string;
}

export const SystemActivityLog = () => {
    const [logs, setLogs] = useState<IActionLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // Fetch direct from backend endpoint which queries Oracle sequence data
                const res = await api.get("/stats/action-logs?limit=8");
                setLogs(res.data);
            } catch (error) {
                console.error("Failed to fetch action logs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <Card className="col-span-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden flex flex-col h-[500px]">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-4 shrink-0">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Terminal className="h-5 w-5" />
                        Nhật ký Hệ thống (Sequence / Oracle)
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden relative">
                <div className="h-full overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-transparent" />
                            <span className="italic text-sm">Đang tải Action Logs...</span>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center text-muted-foreground py-20">
                            Hệ thống chưa ghi nhận hoạt động nào.
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-slate-200 ml-3 mt-2 space-y-6">
                            {logs.map((log, index) => (
                                <div key={log.id} className="relative pl-6">
                                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-slate-800 ring-4 ring-white flex items-center justify-center">
                                        <Activity className="h-2 w-2 text-white" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-mono text-slate-400">
                                            {new Date(log.logTime).toLocaleString('vi-VN')}
                                        </span>
                                        <span className="text-sm text-slate-700 font-medium leading-tight">
                                            {log.actionName}
                                        </span>
                                        <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded w-max border">
                                            Log ID: #{log.id}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {!loading && logs.length > 5 && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
            </CardContent>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </Card>
    );
};
