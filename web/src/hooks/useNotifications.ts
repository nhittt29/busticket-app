import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { notificationApi } from '@/lib/api/notification';
import { bookingApi } from '@/lib/api/booking';

export interface NotificationItem {
    id: number | string;
    title: string;
    message: string;
    createdAt: string; // ISO string
    isRead: boolean;
    type?: 'REAL' | 'VIRTUAL';
    actionPayload?: any; // For navigation
}

export function useNotifications() {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userId = Number(user.id);

            // 1. Fetch Real Notifications from Backend
            // Assuming getNotifications returns array of { id, title, message, createdAt, isRead }
            // We fetch a reasonable amount to mix with virtual ones
            const realNotifications = await notificationApi.getNotifications(userId, 1, 50);

            // 2. Fetch User Tickets for Virtual Logic
            const tickets = await bookingApi.getUserTickets(userId);

            // 3. Generate Virtual Notifications based on Mobile Logic
            const virtualNotifications: NotificationItem[] = [];

            // Local Storage for Read Status of Virtual Notis
            const localReadIds = JSON.parse(localStorage.getItem(`read_virtual_notis_${userId}`) || '[]');

            tickets.forEach((t: any) => {
                const bookedAt = new Date(t.createdAt).getTime(); // Booking Time
                const now = Date.now();
                const paymentHistoryId = t.paymentHistoryId;
                const busName = t.schedule?.bus?.name || 'Xe khách';

                // --- Logic 1: Payment Reminder (10 mins after booking) ---
                // Condition: Status is PENDING/BOOKED (not PAID), and time passed > 10 mins
                // Mobile: schedulePaymentReminder at BookTime + 10m
                if (t.status === 'BOOKED') {
                    // Note: Check if 'BOOKED' means Pending Payment in your system. 
                    // Assuming 'PAID' or 'COMPLETED' is successful.
                    const remindTime = bookedAt + 10 * 60 * 1000;

                    // Show if we kept it valid (e.g. within 24h window for viewing history)
                    // If it's too old (days ago), maybe don't show "Reminder" anymore?
                    // But if it's PENDING and not Cancelled, it might stick around?
                    // Mobile cancels at +15m. So this only exists between T+10m and T+15m ideally.
                    // Or if backend doesn't auto-cancel, it stays. 

                    if (now >= remindTime) {
                        const id = `payment_reminder_${paymentHistoryId}`;
                        virtualNotifications.push({
                            id,
                            title: 'Sắp hết hạn thanh toán!',
                            message: `Vé xe ${busName} sẽ bị hủy sau 5 phút nữa nếu chưa thanh toán.`,
                            createdAt: new Date(remindTime).toISOString(),
                            isRead: localReadIds.includes(id),
                            type: 'VIRTUAL',
                        });
                    }
                }

                // --- Logic 2: Ticket Expired (15 mins after booking) ---
                // Condition: Status is CANCELLED (assuming auto-cancel)
                // Mobile: scheduleTicketExpired at BookTime + 15m
                if (t.status === 'CANCELLED') {
                    const expireTime = bookedAt + 15 * 60 * 1000;

                    // Only show if it matches the "Auto Cancel" pattern (approx 15m)
                    // Or just show for all cancelled? Logic says "Vé đã bị hủy do quá hạn".
                    // We can assume cancelled tickets are expiries.
                    const id = `ticket_expired_${paymentHistoryId}`;

                    // Only show cancellation notis for recent tickets (e.g. last 3 days) to avoid spamming history
                    if (now - expireTime < 3 * 24 * 60 * 60 * 1000) {
                        virtualNotifications.push({
                            id,
                            title: 'Vé đã bị hủy',
                            message: `Vé xe ${busName} đã tự động hủy do quá hạn thanh toán.`,
                            createdAt: new Date(expireTime).toISOString(),
                            isRead: localReadIds.includes(id),
                            type: 'VIRTUAL',
                        });
                    }
                }

                // --- Logic 3: Departure Reminder (1 hour before departure) ---
                // Condition: PAID/BOOKED/COMPLETED (Active ticket)
                if (['PAID', 'COMPLETED', 'BOOKED'].includes(t.status)) {
                    if (t.schedule?.departureAt) {
                        const depTime = new Date(t.schedule.departureAt).getTime();
                        const remindTime = depTime - 60 * 60 * 1000; // -1 Hour

                        const id = `departure_reminder_${paymentHistoryId}`;

                        // Show if remindTime has passed (it's time to remind) 
                        // AND departure hasn't passed too long ago (e.g. + 1 hour after departure)
                        if (now >= remindTime && now < depTime + 60 * 60 * 1000) {
                            virtualNotifications.push({
                                id,
                                title: 'Chuyến đi sắp khởi hành! 🚌',
                                message: `Xe ${busName} sẽ khởi hành trong 1 giờ nữa.`,
                                createdAt: new Date(remindTime).toISOString(),
                                isRead: localReadIds.includes(id),
                                type: 'VIRTUAL',
                            });
                        }
                    }
                }
            });

            // 4. Merge & Sort
            const allNotifications = [...realNotifications, ...virtualNotifications].sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setNotifications(allNotifications);
            setUnreadCount(allNotifications.filter(n => !n.isRead).length);

        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const markAsRead = async (id: number | string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        if (typeof id === 'string') {
            // Virtual: Save to Local Storage
            if (!user) return;
            const key = `read_virtual_notis_${user.id}`;
            const current = JSON.parse(localStorage.getItem(key) || '[]');
            if (!current.includes(id)) {
                current.push(id);
                localStorage.setItem(key, JSON.stringify(current));
            }
        } else {
            // Real: Call API
            if (user) await notificationApi.markAsRead(id, Number(user.id));
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);

        if (user) {
            // Real
            await notificationApi.markAllAsRead(Number(user.id));

            // Virtual: Save ALL current virtual IDs
            const key = `read_virtual_notis_${user.id}`;
            const current = JSON.parse(localStorage.getItem(key) || '[]');
            const newVirtualIds = notifications
                .filter(n => typeof n.id === 'string' && !n.isRead)
                .map(n => n.id);

            localStorage.setItem(key, JSON.stringify([...current, ...newVirtualIds]));
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications
    };
}
