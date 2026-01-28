import Image from "next/image";
import busLogo from "@/assets/images/bus_logo.png";

export function Footer() {
    return (
        <footer className="bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="px-4 lg:px-40">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-1 text-slate-900 dark:text-white mb-2">
                            <Image src={busLogo} alt="BusTicket Logo" width={120} height={120} className="rounded-lg object-contain" />
                            <h2 className="text-lg font-bold tracking-tight">BusTicket</h2>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Dịch vụ đặt vé xe trực tuyến hàng đầu. Được tin dùng bởi hơn 25 triệu khách hàng trên toàn cầu.
                        </p>
                    </div>
                    {/* Links 1 */}
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-4">Về chúng tôi</h4>
                        <ul className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400">
                            <li><a href="#" className="hover:text-primary transition-colors">Giới thiệu</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Liên hệ</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Tuyển dụng</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Truyền thông</a></li>
                        </ul>
                    </div>
                    {/* Links 2 */}
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-4">Hỗ trợ</h4>
                        <ul className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400">
                            <li><a href="#" className="hover:text-primary transition-colors">Câu hỏi thường gặp</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Điều khoản sử dụng</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Chính sách Cookie</a></li>
                        </ul>
                    </div>
                    {/* Newsletter */}
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-4">Nhận tin tức</h4>
                        <p className="text-slate-500 text-sm mb-4">Đăng ký nhận bản tin để cập nhật ưu đãi mới nhất.</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Email" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary" />
                            <button className="bg-primary hover:bg-sky-600 text-white rounded-lg px-3 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm">© 2024 BusTicket Inc. Đã đăng ký bản quyền.</p>
                    <div className="flex gap-4 text-slate-400">
                        <a href="#" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><span className="material-symbols-outlined text-xl">thumb_up</span></a>
                        <a href="#" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><span className="material-symbols-outlined text-xl">share</span></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
