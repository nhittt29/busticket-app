export function PopularRoutes() {
    return (
        <section className="px-4 lg:px-40 py-12">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Tuyến đường phổ biến</h3>
                <a href="#" className="text-primary font-semibold hover:text-sky-600 flex items-center gap-1 text-sm">
                    Xem tất cả
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Card 1 */}
                <div className="group bg-surface-light dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300">
                    <div className="h-48 overflow-hidden relative">
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary z-10 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">trending_up</span> Popular
                        </div>
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHD3BiYaalyygXWOl09FSIlm8eN5MhB78NTS5E9zr_00Me8qEe4DQgxpBuaypl_R0KEX3GzVZUhaLxolZ5nYoizP3D6R_h1LiyjtjEpCrfgG5pJKFAvU5r9M7NfbKQMP3eRu7Tjin4mm2IEZTBjQESlxC9mxZAsS3_Dfec17RQMYpcEXqqO_19k-ji_Rz6lqmQxBMnTnHtcuhSFVnON2Iafa4d8tdBw2wolv-FGgsOvUG-Malp9VbcsWvXVxFFrgCkMEOl_qpa-Rvs" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="New York" />
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white">Hồ Chí Minh</h4>
                                <p className="text-slate-500 text-sm">đi Đà Lạt</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 font-medium">chỉ từ</p>
                                <p className="text-primary font-bold text-lg">250.000đ</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                <span className="material-symbols-outlined text-sm">schedule</span> 4h 30m
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                <span className="material-symbols-outlined text-sm">directions_bus</span> Direct
                            </div>
                        </div>
                    </div>
                </div>
                {/* Card 2 */}
                <div className="group bg-surface-light dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300">
                    <div className="h-48 overflow-hidden relative">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDc4sUQ9o-o7QlLh3ByG-N317NANv6D3WXdzyIqFa5CX7fBEFlTCT4XxUI_RkBSLD2HpO7N38WTYxtWQ2FBV1eQ3KexEYAz3-sGNUcRh0iHQh-1OwGrijEJTJPe1WPf2gc_ERgcSc_y61PJULqcdfsepB7J5LGPo-F8abWjnCN5R6f5mItSEtmIjeBz27HCfC6nYQSEjowXTRzMlXAtuKjefv4aG9GXlTR3umThsXQfaeJkyPCtm-gyfcgZ2HMoOoDt5hi1ZWe0biji" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="London" />
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white">Hà Nội</h4>
                                <p className="text-slate-500 text-sm">đi Sapa</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 font-medium">chỉ từ</p>
                                <p className="text-primary font-bold text-lg">300.000đ</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                <span className="material-symbols-outlined text-sm">schedule</span> 5h 10m
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                <span className="material-symbols-outlined text-sm">directions_bus</span> Direct
                            </div>
                        </div>
                    </div>
                </div>
                {/* Card 3 */}
                <div className="group bg-surface-light dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300">
                    <div className="h-48 overflow-hidden relative">
                        <div className="absolute top-3 left-3 bg-orange-500/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white z-10 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">local_offer</span> Giá tốt nhất
                        </div>
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1U_wz2HPoKp82dKkY_cOEXf7ZxO_CXuuGbwutSkrth24K1ftOvZLSFC8fYS9GtAf0vuWO5iPmueI-YsMoIBqtzoCVQqlfcclExa4uJrjePHgSd5RwLkqN_i3hRl7fjyB0xa2gZ8IvaIiRf0O_Kr1hKWPMSTvx56yJQqD9Nhq7M-Qi68Tn4JxLuMrDjI8V0C1OGU4uGrtH9RF7zHeSp6ebejkfxeG93dqzTRNEGuhPS6zvURfSfxNEVV-QxcJK28zrRHbDJALLkccC" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Sydney" />
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white">Đà Nẵng</h4>
                                <p className="text-slate-500 text-sm">đi Nha Trang</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 font-medium">chỉ từ</p>
                                <p className="text-primary font-bold text-lg">400.000đ</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                <span className="material-symbols-outlined text-sm">schedule</span> 3h 15m
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                <span className="material-symbols-outlined text-sm">directions_bus</span> Direct
                            </div>
                        </div>
                    </div>
                </div>
                {/* Card 4 */}
                <div className="group bg-surface-light dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300">
                    <div className="h-48 overflow-hidden relative">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU1Xk2zCoe69Q2N87n1odbsZvh94geNlXU8xUi5GNp1xtNGvaX2mtXvZuwfcKDh1_HXQ5hD5HDj_njtWGj-5uLpVx7gMbgL4bex0Y9yMlWXS3bON9-Io8Bnvubwq5VAIHTZfZxgHR_ZuhdNa6Oed0OGq61VmMpigigbnZT_gg2kldg-3WW4agKTHt1GjRb7Y6PWTOfYUmwcuPhG7yfPUtrDEhNaonZeeBl6wrxkeYPbNE0mrWsu-RumLD-i5vQv6nETr4RR2Egsh2S" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Istanbul" />
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white">Cần Thơ</h4>
                                <p className="text-slate-500 text-sm">đi Vũng Tàu</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 font-medium">chỉ từ</p>
                                <p className="text-primary font-bold text-lg">180.000đ</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                <span className="material-symbols-outlined text-sm">schedule</span> 6h 00m
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                <span className="material-symbols-outlined text-sm">directions_bus</span> 1 Trạm dừng
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
