export function Offers() {
    return (
        <section className="px-4 lg:px-40 py-20 bg-white dark:bg-slate-950">
            <div className="flex flex-col gap-2 mb-10">
                <h3 className="text-3xl font-black text-[#023E8A] dark:text-white tracking-tight">Ưu đãi hiện có</h3>
                <p className="text-slate-500 font-medium">Tiết kiệm nhiều hơn cho mỗi chuyến đi</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Offer 1 */}
                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-400 p-8 text-white shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-1">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/30">
                            <span className="material-symbols-outlined font-bold">percent</span>
                        </div>
                        <h4 className="text-2xl font-black mb-2 tracking-tight">Chào Hè Sôi Động</h4>
                        <p className="text-blue-50/90 text-sm font-medium mb-6 leading-relaxed">Giảm 20% cho tất cả các tuyến trong mùa hè này.</p>
                        <button className="px-6 py-2.5 bg-white text-blue-600 font-black text-[10px] tracking-widest uppercase rounded-xl hover:bg-blue-50 transition-all active:scale-95">Nhận ngay</button>
                    </div>
                    <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-[160px] text-white/10 select-none group-hover:scale-110 transition-transform duration-700">wb_sunny</span>
                </div>
                {/* Offer 2 */}
                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#023E8A] to-[#0077B6] p-8 text-white shadow-xl shadow-blue-900/10 hover:shadow-blue-900/20 transition-all duration-500 hover:-translate-y-1">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/30">
                            <span className="material-symbols-outlined font-bold">school</span>
                        </div>
                        <h4 className="text-2xl font-black mb-2 tracking-tight">Ưu đãi sinh viên</h4>
                        <p className="text-blue-50/90 text-sm font-medium mb-6 leading-relaxed">Giảm ngay 15% cho sinh viên đã xác thực tài khoản.</p>
                        <button className="px-6 py-2.5 bg-white text-[#023E8A] font-black text-[10px] tracking-widest uppercase rounded-xl hover:bg-blue-50 transition-all active:scale-95">Xác thực ngay</button>
                    </div>
                    <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-[160px] text-white/10 select-none group-hover:scale-110 transition-transform duration-700">history_edu</span>
                </div>
                {/* Offer 3 */}
                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-amber-400 p-8 text-white shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-1">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/30">
                            <span className="material-symbols-outlined font-bold">card_membership</span>
                        </div>
                        <h4 className="text-2xl font-black mb-2 tracking-tight">Miễn phí chuyến đầu</h4>
                        <p className="text-orange-50/90 text-sm font-medium mb-6 leading-relaxed">Bạn mới? Phí đặt vé lần đầu là tặng phẩm của chúng tôi.</p>
                        <button className="px-6 py-2.5 bg-white text-orange-600 font-black text-[10px] tracking-widest uppercase rounded-xl hover:bg-orange-50 transition-all active:scale-95">Đăng ký</button>
                    </div>
                    <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-[160px] text-white/10 select-none group-hover:scale-110 transition-transform duration-700">directions_bus</span>
                </div>
            </div>
        </section>
    );
}
