export function PopularRoutes() {
    return (
        <section className="px-4 lg:px-40 py-16 bg-[#EAF6FF]/30">
            <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col gap-1">
                    <h3 className="text-3xl font-black text-[#023E8A] dark:text-white tracking-tight">Tuyến đường phổ biến</h3>
                    <p className="text-slate-500 text-sm font-medium">Khám phá những điểm đến yêu thích của cộng đồng</p>
                </div>
                <a href="#" className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1.5 text-sm bg-blue-50 px-4 py-2 rounded-full transition-colors dark:bg-blue-900/20">
                    Xem tất cả
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {/* Card 1 */}
                <div className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-slate-100 dark:border-slate-800">
                    <div className="h-56 overflow-hidden relative">
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase text-blue-600 z-10 flex items-center gap-1.5 shadow-sm">
                            <span className="material-symbols-outlined text-xs">trending_up</span> Popular
                        </div>
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHD3BiYaalyygXWOl09FSIlm8eN5MhB78NTS5E9zr_00Me8qEe4DQgxpBuaypl_R0KEX3GzVZUhaLxolZ5nYoizP3D6R_h1LiyjtjEpCrfgG5pJKFAvU5r9M7NfbKQMP3eRu7Tjin4mm2IEZTBjQESlxC9mxZAsS3_Dfec17RQMYpcEXqqO_19k-ji_Rz6lqmQxBMnTnHtcuhSFVnON2Iafa4d8tdBw2wolv-FGgsOvUG-Malp9VbcsWvXVxFFrgCkMEOl_qpa-Rvs" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Hồ Chí Minh" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-extrabold text-xl text-[#023E8A] dark:text-white">Hồ Chí Minh</h4>
                                <p className="text-slate-400 text-sm font-semibold">đi Đà Lạt</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Giá vé</p>
                                <p className="text-blue-600 font-black text-xl">250.000đ</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-sm text-blue-500">schedule</span> 4h 30m
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-sm text-blue-500">directions_bus</span> Direct
                            </div>
                        </div>
                    </div>
                </div>
                {/* Card 2 */}
                <div className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-slate-100 dark:border-slate-800">
                    <div className="h-56 overflow-hidden relative">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDc4sUQ9o-o7QlLh3ByG-N317NANv6D3WXdzyIqFa5CX7fBEFlTCT4XxUI_RkBSLD2HpO7N38WTYxtWQ2FBV1eQ3KexEYAz3-sGNUcRh0iHQh-1OwGrijEJTJPe1WPf2gc_ERgcSc_y61PJULqcdfsepB7J5LGPo-F8abWjnCN5R6f5mItSEtmIjeBz27HCfC6nYQSEjowXTRzMlXAtuKjefv4aG9GXlTR3umThsXQfaeJkyPCtm-gyfcgZ2HMoOoDt5hi1ZWe0biji" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Hà Nội" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-extrabold text-xl text-[#023E8A] dark:text-white">Hà Nội</h4>
                                <p className="text-slate-400 text-sm font-semibold">đi Sapa</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Giá vé</p>
                                <p className="text-blue-600 font-black text-xl">300.000đ</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-sm text-blue-500">schedule</span> 5h 10m
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-sm text-blue-500">directions_bus</span> Direct
                            </div>
                        </div>
                    </div>
                </div>
                {/* Card 3 */}
                <div className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-slate-100 dark:border-slate-800">
                    <div className="h-56 overflow-hidden relative">
                        <div className="absolute top-4 left-4 bg-orange-500/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase text-white z-10 flex items-center gap-1.5 shadow-sm">
                            <span className="material-symbols-outlined text-xs">local_offer</span> Giá tốt nhất
                        </div>
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1U_wz2HPoKp82dKkY_cOEXf7ZxO_CXuuGbwutSkrth24K1ftOvZLSFC8fYS9GtAf0vuWO5iPmueI-YsMoIBqtzoCVQqlfcclExa4uJrjePHgSd5RwLkqN_i3hRl7fjyB0xa2gZ8IvaIiRf0O_Kr1hKWPMSTvx56yJQqD9Nhq7M-Qi68Tn4JxLuMrDjI8V0C1OGU4uGrtH9RF7zHeSp6ebejkfxeG93dqzTRNEGuhPS6zvURfSfxNEVV-QxcJK28zrRHbDJALLkccC" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Đà Nẵng" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-extrabold text-xl text-[#023E8A] dark:text-white">Đà Nẵng</h4>
                                <p className="text-slate-400 text-sm font-semibold">đi Nha Trang</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Giá vé</p>
                                <p className="text-blue-600 font-black text-xl">400.000đ</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-sm text-blue-500">schedule</span> 3h 15m
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-sm text-blue-500">directions_bus</span> Direct
                            </div>
                        </div>
                    </div>
                </div>
                {/* Card 4 */}
                <div className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-slate-100 dark:border-slate-800">
                    <div className="h-56 overflow-hidden relative">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU1Xk2zCoe69Q2N87n1odbsZvh94geNlXU8xUi5GNp1xtNGvaX2mtXvZuwfcKDh1_HXQ5hD5HDj_njtWGj-5uLpVx7gMbgL4bex0Y9yMlWXS3bON9-Io8Bnvubwq5VAIHTZfZxgHR_ZuhdNa6Oed0OGq61VmMpigigbnZT_gg2kldg-3WW4agKTHt1GjRb7Y6PWTOfYUmwcuPhG7yfPUtrDEhNaonZeeBl6wrxkeYPbNE0mrWsu-RumLD-i5vQv6nETr4RR2Egsh2S" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Cần Thơ" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-extrabold text-xl text-[#023E8A] dark:text-white">Cần Thơ</h4>
                                <p className="text-slate-400 text-sm font-semibold">đi Vũng Tàu</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Giá vé</p>
                                <p className="text-blue-600 font-black text-xl">180.000đ</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-sm text-blue-500">schedule</span> 6h 00m
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-sm text-blue-500">directions_bus</span> 1 Trạm dừng
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
