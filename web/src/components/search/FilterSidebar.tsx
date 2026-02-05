export function FilterSidebar() {
    return (
        <div className="space-y-6">
            {/* Sort */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">sort</span>
                    Sắp xếp
                </h3>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" name="sort" defaultChecked className="w-5 h-5 text-primary border-slate-300 focus:ring-primary" />
                        <span className="group-hover:text-primary transition-colors">Giờ đi sớm nhất</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" name="sort" className="w-5 h-5 text-primary border-slate-300 focus:ring-primary" />
                        <span className="group-hover:text-primary transition-colors">Giờ đi muộn nhất</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" name="sort" className="w-5 h-5 text-primary border-slate-300 focus:ring-primary" />
                        <span className="group-hover:text-primary transition-colors">Giá thấp đến cao</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" name="sort" className="w-5 h-5 text-primary border-slate-300 focus:ring-primary" />
                        <span className="group-hover:text-primary transition-colors">Giá cao đến thấp</span>
                    </label>
                </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">payments</span>
                    Giá vé
                </h3>
                {/* Simple Range Slider Placeholder */}
                <input type="range" className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between mt-2 text-sm font-medium text-slate-500">
                    <span>0đ</span>
                    <span>1.000.000đ</span>
                </div>
            </div>

            {/* Time Filter */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">schedule</span>
                    Giờ đi
                </h3>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded text-primary border-slate-300 focus:ring-primary" />
                        <span>Sáng sớm (00:00 - 06:00)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded text-primary border-slate-300 focus:ring-primary" />
                        <span>Sáng (06:00 - 12:00)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded text-primary border-slate-300 focus:ring-primary" />
                        <span>Chiều (12:00 - 18:00)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded text-primary border-slate-300 focus:ring-primary" />
                        <span>Tối (18:00 - 24:00)</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
