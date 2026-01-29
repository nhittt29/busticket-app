export default function ReviewsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Đánh giá của tôi</h1>
                <p className="text-slate-500 text-sm mt-1">Lịch sử đánh giá các chuyến đi</p>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
                <div className="inline-flex w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl text-slate-300">rate_review</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Chưa có đánh giá</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">Bạn chưa viết đánh giá nào. Sau khi hoàn thành chuyến đi, hãy chia sẻ trải nghiệm của bạn nhé.</p>
            </div>
        </div>
    );
}
