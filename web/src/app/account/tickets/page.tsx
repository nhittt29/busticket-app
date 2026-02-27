"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowUpDown } from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { bookingApi } from "@/lib/api/booking";
import { TicketCard } from "@/components/ticket/TicketCard";

type Tab = "upcoming" | "history" | "cancelled";
type SortOrder = "newest" | "oldest";

import { WriteReviewModal } from "@/components/reviews/WriteReviewModal";

// ... imports

export default function MyTicketsPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [activeTab, setActiveTab] = useState<Tab>("upcoming");
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Review Modal State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

    // Fetch Tickets
    const fetchTickets = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await bookingApi.getUserTickets(Number(user.id));
            setTickets(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Không thể tải danh sách vé");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [user]);

    // ... (Filter Logic Same)
    const filteredGroups = useMemo(() => {
        if (!tickets.length) return [];

        // 1. Group by paymentHistoryId
        const grouped: Record<string, any[]> = {};
        tickets.forEach(t => {
            const key = t.paymentHistoryId || `t_${t.id}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(t);
        });

        const groups = Object.values(grouped);

        // 2. Filter
        const now = new Date();
        const filtered = groups.filter(group => {
            const first = group[0];
            const status = first.status;
            const departureTime = first.schedule?.departureAt ? new Date(first.schedule.departureAt) : null;
            const arrivalTime = first.schedule?.arrivalAt ? new Date(first.schedule.arrivalAt) : null;

            if (activeTab === 'cancelled') {
                return status === 'CANCELLED';
            }

            if (activeTab === 'upcoming') {
                // Not cancelled AND (future date OR pending payment)
                return status !== 'CANCELLED' && (departureTime && departureTime > now);
            }

            if (activeTab === 'history') {
                // Completed/Paid AND date passed or arrived
                // Using departureTime <= now as simple past check, or arrivalTime if available
                const isPast = departureTime && departureTime <= now;
                return status === 'COMPLETED' || status === 'PAID' && isPast && status !== 'CANCELLED';
            }

            return true;
        });

        // 3. Sort
        return filtered.sort((a, b) => {
            const dateA = new Date(a[0].createdAt || 0).getTime();
            const dateB = new Date(b[0].createdAt || 0).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

    }, [tickets, activeTab, sortOrder]);

    const handlePay = (ticket: any) => {
        const id = ticket.paymentHistoryId || ticket.id;
        router.push(`/payment/${id}`);
    };

    const handleView = (ticket: any) => {
        router.push(`/account/tickets/${ticket.id}`);
    };

    const handleReview = (ticket: any) => {
        setSelectedTicketId(ticket.id);
        setReviewModalOpen(true);
    };

    const handleReviewSuccess = () => {
        fetchTickets(); // Refresh to update "Reviewed" status
    };

    if (!user) {
        return (
            <div className="p-12 text-center text-slate-500">
                Vui lòng đăng nhập để xem vé.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vé của tôi</h1>
                    <p className="text-slate-500 text-sm mt-1">Quản lý các chuyến đi của bạn</p>
                </div>

                {/* Sort Button */}
                <button
                    onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <ArrowUpDown className="w-4 h-4" />
                    {sortOrder === 'newest' ? 'Mới nhất' : 'Cũ nhất'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                {[
                    { id: 'upcoming', label: 'Sắp khởi hành' },
                    { id: 'history', label: 'Lịch sử' },
                    { id: 'cancelled', label: 'Đã hủy' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-4">
                {filteredGroups.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
                        <div className="inline-flex w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-4xl text-slate-300">confirmation_number</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Chưa có vé nào</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-6">
                            {activeTab === 'upcoming'
                                ? 'Bạn chưa có chuyến đi sắp tới nào.'
                                : activeTab === 'history'
                                    ? 'Bạn chưa có lịch sử chuyến đi nào.'
                                    : 'Bạn chưa có vé đã hủy nào.'}
                        </p>
                        <Link href="/">
                            <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                                Tìm chuyến xe
                            </button>
                        </Link>
                    </div>
                ) : (
                    /* Ticket List */
                    filteredGroups.map(group => {
                        const ticket = group[0];
                        // Only show review for History tab
                        const showReview = activeTab === 'history';

                        return (
                            <TicketCard
                                key={ticket.id}
                                ticket={ticket}
                                groupTickets={group}
                                onPay={handlePay}
                                onView={handleView}
                                onReview={showReview ? handleReview : undefined}
                                isProcessing={processingId === ticket.id}
                            />
                        );
                    })
                )}
            </div>

            {/* Review Modal */}
            {selectedTicketId && (
                <WriteReviewModal
                    isOpen={reviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    ticketId={selectedTicketId}
                    onSuccess={handleReviewSuccess}
                />
            )}
        </div>
    );
}
