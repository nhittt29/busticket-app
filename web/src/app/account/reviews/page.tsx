"use client";

import { useEffect, useState } from "react";
import { reviewApi } from "@/lib/api/review";
import Image from "next/image";
import { Star } from "lucide-react";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMyReviews = async () => {
            try {
                const data = await reviewApi.getMyReviews();
                setReviews(data);
            } catch (err: any) {
                console.error("Failed to fetch reviews", err);
                setError(err.response?.data?.message || "Không thể tải danh sách đánh giá.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyReviews();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Đánh giá của tôi</h1>
                <p className="text-slate-500 text-sm mt-1">Lịch sử đánh giá các chuyến đi</p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6 h-40"></div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    {error}
                </div>
            ) : reviews.length === 0 ? (
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
                    <div className="inline-flex w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-4xl text-slate-300">rate_review</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Chưa có đánh giá</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">Bạn chưa viết đánh giá nào. Sau khi hoàn thành chuyến đi, hãy chia sẻ trải nghiệm của bạn nhé.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden relative">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Route Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <span className="material-symbols-outlined text-xl">directions_bus</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">
                                                {review.bus?.brand?.name || "Nhà xe"} ({review.bus?.licensePlate})
                                            </h4>
                                            {review.ticket?.schedule?.route && (
                                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                                    <span>{review.ticket.schedule.route.startPoint}</span>
                                                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                                    <span>{review.ticket.schedule.route.endPoint}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-5 h-5 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300 dark:text-slate-700"}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Comment */}
                                    {review.comment && (
                                        <p className="text-slate-700 dark:text-slate-300 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg italic">
                                            "{review.comment}"
                                        </p>
                                    )}

                                    {/* Images */}
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 mt-4 mt-auto">
                                            {review.images.map((img: string, idx: number) => (
                                                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                                    <Image src={img} alt={`Review image ${idx + 1}`} fill className="object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Metadata/Reply */}
                                <div className="md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 py-1 px-3 rounded-full inline-block mb-2">
                                            {formatDate(review.createdAt)}
                                        </div>
                                    </div>

                                    {review.reply ? (
                                        <div className="bg-sky-50 dark:bg-sky-900/20 p-3 rounded-lg border border-sky-100 dark:border-sky-800 mt-4 md:mt-0">
                                            <div className="flex items-center gap-1 text-sky-700 dark:text-sky-400 mb-1">
                                                <span className="material-symbols-outlined text-[16px]">reply</span>
                                                <span className="text-xs font-bold">Phản hồi từ Nhà xe</span>
                                            </div>
                                            <p className="text-xs text-slate-700 dark:text-slate-300">{review.reply}</p>
                                        </div>
                                    ) : (
                                        <div className="mt-auto text-right">
                                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                                                <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                                                Đang chờ phản hồi
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
