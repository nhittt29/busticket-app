export function Stats() {
    return (
        <section className="px-4 lg:px-40 py-16 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-primary">groups</span>
                    <h5 className="text-3xl font-black text-slate-900 dark:text-white">10M+</h5>
                    <p className="text-slate-500 text-sm">Khách hàng hài lòng</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-primary">route</span>
                    <h5 className="text-3xl font-black text-slate-900 dark:text-white">5000+</h5>
                    <p className="text-slate-500 text-sm">Tuyến xe</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-primary">verified_user</span>
                    <h5 className="text-3xl font-black text-slate-900 dark:text-white">100%</h5>
                    <p className="text-slate-500 text-sm">Thanh toán an toàn</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-primary">support_agent</span>
                    <h5 className="text-3xl font-black text-slate-900 dark:text-white">24/7</h5>
                    <p className="text-slate-500 text-sm">Hỗ trợ khách hàng</p>
                </div>
            </div>
        </section>
    );
}
