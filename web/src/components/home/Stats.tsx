export function Stats() {
    return (
        <section className="px-4 lg:px-40 py-20 border-t border-slate-100 dark:border-slate-800 bg-[#EAF6FF]/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                <div className="flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
                        <span className="material-symbols-outlined text-3xl text-blue-600 group-hover:text-white transition-colors duration-500">groups</span>
                    </div>
                    <div>
                        <h5 className="text-4xl font-black text-[#023E8A] dark:text-white tracking-tighter">10M+</h5>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Khách hàng</p>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
                        <span className="material-symbols-outlined text-3xl text-blue-600 group-hover:text-white transition-colors duration-500">route</span>
                    </div>
                    <div>
                        <h5 className="text-4xl font-black text-[#023E8A] dark:text-white tracking-tighter">5000+</h5>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Tuyến xe</p>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
                        <span className="material-symbols-outlined text-3xl text-blue-600 group-hover:text-white transition-colors duration-500">verified_user</span>
                    </div>
                    <div>
                        <h5 className="text-4xl font-black text-[#023E8A] dark:text-white tracking-tighter">100%</h5>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">An toàn</p>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
                        <span className="material-symbols-outlined text-3xl text-blue-600 group-hover:text-white transition-colors duration-500">support_agent</span>
                    </div>
                    <div>
                        <h5 className="text-4xl font-black text-[#023E8A] dark:text-white tracking-tighter">24/7</h5>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Hỗ trợ</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
