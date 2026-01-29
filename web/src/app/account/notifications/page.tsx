export default function NotificationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thông báo</h1>
                <p className="text-slate-500 text-sm mt-1">Cập nhật tin tức và khuyến mãi</p>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
                <div className="inline-flex w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl text-slate-300">notifications_off</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Không có thông báo mới</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Hiện tại bạn chưa có thông báo nào. Chúng tôi sẽ gửi thông báo khi có ưu đãi mới.</p>
            </div>
        </div>
    );
}
