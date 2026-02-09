import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Seat } from '@/types/seat';
import { DropoffPoint } from '@/types/booking'; // Ensure this exists or use DropoffPoint from backend/entities if shared
import { Promotion } from '@/types/promotion';

interface CustomerInfo {
    name: string;
    phone: string;
    email: string;
}

interface BookingState {
    // Selection Data
    scheduleId: number | null;
    selectedSeats: Seat[];
    customerInfo: CustomerInfo | null;

    // Dropoff Data
    dropoffPointId: number | null;
    dropoffAddress: string | null;
    selectedDropoffPoint: DropoffPoint | null;

    // Financials
    totalPrice: number; // Base price of seats
    surcharge: number; // Extra fees form dropoff
    discountAmount: number; // From promotion
    finalTotalPrice: number; // Total - Discount + Surcharge

    // Promotion
    selectedPromotion: Promotion | null;

    // Actions
    setBookingSession: (
        scheduleId: number,
        seats: Seat[],
        totalPrice: number
    ) => void;

    updateCustomerInfo: (info: CustomerInfo) => void;

    setDropoff: (
        pointId: number | null,
        address: string | null,
        point: DropoffPoint | null,
        surcharge: number
    ) => void;

    applyPromotion: (promotion: Promotion) => void;
    removePromotion: () => void;

    reset: () => void;
}

export const useBookingStore = create<BookingState>()(
    persist(
        (set, get) => ({
            scheduleId: null,
            selectedSeats: [],
            customerInfo: null,
            dropoffPointId: null,
            dropoffAddress: null,
            selectedDropoffPoint: null,
            totalPrice: 0,
            surcharge: 0,
            discountAmount: 0,
            finalTotalPrice: 0,
            selectedPromotion: null,

            setBookingSession: (scheduleId, seats, totalPrice) => {
                const currentSurcharge = get().surcharge;
                const currentDiscount = get().discountAmount;
                set({
                    scheduleId,
                    selectedSeats: seats,
                    totalPrice,
                    finalTotalPrice: totalPrice + currentSurcharge - currentDiscount
                });
            },

            updateCustomerInfo: (info) => set({ customerInfo: info }),

            setDropoff: (pointId, address, point, surchargePerSeat) => {
                const currentTotal = get().totalPrice;
                const currentDiscount = get().discountAmount;
                const seatCount = get().selectedSeats.length || 0;

                // Logic: Surcharge is per seat usually
                // If surchargePerSeat passed is 0, total surcharge is 0
                const totalSurcharge = surchargePerSeat * seatCount;

                set({
                    dropoffPointId: pointId,
                    dropoffAddress: address,
                    selectedDropoffPoint: point,
                    surcharge: totalSurcharge,
                    finalTotalPrice: currentTotal + totalSurcharge - currentDiscount
                });
            },

            applyPromotion: (promotion) => {
                const currentTotal = get().totalPrice;
                const currentSurcharge = get().surcharge;

                let discount = 0;
                if (promotion.discountType === 'FIXED') {
                    discount = promotion.discountValue;
                } else if (promotion.discountType === 'PERCENTAGE') {
                    discount = (currentTotal * promotion.discountValue) / 100;
                    if (promotion.maxDiscount && discount > promotion.maxDiscount) {
                        discount = promotion.maxDiscount;
                    }
                }

                // Ensure discount doesn't exceed total
                const grandTotal = currentTotal + currentSurcharge;
                if (discount > grandTotal) discount = grandTotal;

                set({
                    selectedPromotion: promotion,
                    discountAmount: discount,
                    finalTotalPrice: Math.max(0, grandTotal - discount)
                });
            },

            removePromotion: () => {
                const currentTotal = get().totalPrice;
                const currentSurcharge = get().surcharge;

                set({
                    selectedPromotion: null,
                    discountAmount: 0,
                    finalTotalPrice: currentTotal + currentSurcharge
                });
            },

            reset: () => set({
                scheduleId: null,
                selectedSeats: [],
                customerInfo: null,
                dropoffPointId: null,
                dropoffAddress: null,
                selectedDropoffPoint: null,
                totalPrice: 0,
                surcharge: 0,
                discountAmount: 0,
                finalTotalPrice: 0,
                selectedPromotion: null,
            })
        }),
        {
            name: 'booking-storage',
        }
    )
);
