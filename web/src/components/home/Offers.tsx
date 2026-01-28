export function Offers() {
    return (
        <section className="px-4 lg:px-40 py-12 bg-white dark:bg-slate-800/50">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Ưu đãi hiện có</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Offer 1 */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 p-6 text-white shadow-lg">
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                            <span className="material-symbols-outlined">percent</span>
                        </div>
                        <h4 className="text-2xl font-bold mb-1">Chào Hè Sôi Động</h4>
                        <p className="text-blue-100 text-sm mb-4">Giảm 20% cho tất cả các tuyến trong mùa hè này.</p>
                        <button className="px-4 py-2 bg-white text-blue-600 font-bold text-xs rounded-lg uppercase tracking-wider hover:bg-blue-50 transition-colors">Nhận ngay</button>
                    </div>
                    <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/10 select-none">wb_sunny</span>
                </div>
                {/* Offer 2 */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 to-teal-400 p-6 text-white shadow-lg">
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                            <span className="material-symbols-outlined">school</span>
                        </div>
                        <h4 className="text-2xl font-bold mb-1">Ưu đãi sinh viên</h4>
                        <p className="text-emerald-100 text-sm mb-4">Giảm ngay 15% cho sinh viên đã xác thực.</p>
                        <button className="px-4 py-2 bg-white text-emerald-600 font-bold text-xs rounded-lg uppercase tracking-wider hover:bg-emerald-50 transition-colors">Xác thực ngay</button>
                    </div>
                    <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/10 select-none">history_edu</span>
                </div>
                {/* Offer 3 */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 p-6 text-white shadow-lg">
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                            <span className="material-symbols-outlined">card_membership</span>
                        </div>
                        <h4 className="text-2xl font-bold mb-1">Miễn phí chuyến đầu</h4>
                        <p className="text-orange-100 text-sm mb-4">Bạn mới? Phí đặt vé lần đầu là của chúng tôi.</p>
                        <button className="px-4 py-2 bg-white text-orange-600 font-bold text-xs rounded-lg uppercase tracking-wider hover:bg-orange-50 transition-colors">Đăng ký</button>
                    </div>
                    <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/10 select-none">directions_bus</span>
                </div>
            </div>
        </section>
    );
}
