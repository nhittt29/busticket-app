"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, User } from "lucide-react";
import api from "@/lib/api";
import { useNavigation } from "@refinedev/core";

interface IBonusBooking {
    id: number;
    customerName: string;
    totalPrice: number;
    createdAt: string;
    status: string;
}

const STATUS_CONFIG: Record<string, { label: string; twClass: string }> = {
    'PAID': { label: 'Thành công', twClass: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20' },
    'BOOKED': { label: 'Chờ TT', twClass: 'text-[#eab308] bg-[#eab308]/10 border-[#eab308]/20' },
    'CANCELLED': { label: 'Đã hủy', twClass: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20' }
};

export const RecentBookingsBonus = () => {
    const [bookings, setBookings] = useState<IBonusBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const { show } = useNavigation();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // Fetch direct from Oracle Package Procedure endpoint
                // Loading 50 items to showcase the 'Scrollable' feature
                const res = await api.get("/stats/recent-bookings-bonus?limit=50");
                setBookings(res.data);
            } catch (error) {
                console.error("Failed to fetch bonus bookings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <Card className="col-span-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden flex flex-col h-[500px]">
            <CardHeader className="bg-gradient-to-r from-[#023E8A] to-[#0077B6] text-white py-4 shrink-0">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Giao dịch Gần đây (Bonus Logic)
                    </CardTitle>
                    <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full border border-white/30 hidden sm:block">
                        Oracle Package + ROWNUM
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden relative">
                <div className="h-full overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#023E8A] border-t-transparent" />
                            <span className="italic text-sm">Đang truy vấn Oracle Database...</span>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center text-muted-foreground py-20">
                            Chưa có giao dịch nào được ghi nhận.
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <div
                                key={booking.id}
                                onClick={() => show("tickets", booking.id)}
                                className="group relative flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-[#96DFD8] hover:bg-[#96DFD8]/5 transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0077B6]/10 text-[#0077B6] group-hover:bg-[#0077B6] group-hover:text-white transition-colors duration-300 shadow-sm">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-[#2c3e50] truncate group-hover:text-[#0077B6] transition-colors">
                                            {booking.customerName}
                                        </p>
                                        <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1 rounded border">
                                            #{booking.id}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[11px] text-muted-foreground flex items-center">
                                            <Clock className="mr-1 h-3 w-3" />
                                            {new Date(booking.createdAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-[#023E8A]">
                                        {formatCurrency(booking.totalPrice)}
                                    </p>
                                    <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block border ${STATUS_CONFIG[booking.status]?.twClass || 'text-gray-500 bg-gray-100 border-gray-200'}`}>
                                        {STATUS_CONFIG[booking.status]?.label || booking.status}
                                    </div>
                                </div>
                                
                                {/* Aesthetic indicator */}
                                <div className="absolute left-0 w-1 h-0 bg-[#0077B6] group-hover:h-3/4 transition-all duration-500 rounded-r-full top-1/2 -translate-y-1/2" />
                            </div>
                        ))
                    )}
                </div>
                
                {/* Scroll Indicator overlay (bottom) */}
                {!loading && bookings.length > 5 && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
            </CardContent>
            
            {/* Inline CSS for scrollbar - Refine projects usually support styled-jsx or standard CSS */}
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
                    background: #0077B6;
                }
            `}</style>
        </Card>
    );
};
