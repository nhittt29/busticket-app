export function Hero() {
    return (
        <section className="relative bg-[#EAF6FF] dark:bg-slate-950 overflow-hidden">
            {/* Background Image / Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Light gradient overlay to blend image with background */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#EAF6FF]/20 to-[#EAF6FF] z-10 dark:from-transparent dark:to-slate-950"></div>
                <div
                    className="h-[500px] w-full bg-cover bg-center opacity-40 mix-blend-multiply dark:mix-blend-overlay dark:opacity-20"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCkoGJiw771p-bP6h-tlFwWkK7eZxzNEvL-cBpwz-Tb_ljEPBiUeKY99iCNcKqfPMLZGri15OBngckoT6YbugUTAj7lxhvjanGKnYE4wUS0bc4bNLiioaqChKlxfcBnobEGIbJUVdcuPJ0feBEoGKjjHfdu2VqF3ga-OSjqU0p5g2HVZvAPBTqALdUHskfeIXqW3eB2x2TU0TXv_CKsF11X7GeyKlBRiemDZqT7sWpz_ZJNu9WtxoDtLDr9AYr8dGU6kMcWMX3uWeil')" }}
                ></div>
            </div>

            {/* Content Container */}
            <div className="relative z-20 px-4 lg:px-40 pt-8 pb-40 flex flex-col items-center justify-center text-center">
                <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                    Hệ thống đặt vé xe khách Miền Đông
                </span>
                <h1 className="text-[#023E8A] dark:text-white text-4xl lg:text-7xl font-black leading-tight tracking-tight mb-6 max-w-4xl">
                    Vi vu mọi miền tổ quốc <br /> với sự <span className="text-blue-600">thoải mái nhất</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg lg:text-xl font-medium max-w-2xl">
                    Tìm kiếm các tuyến xe tốt nhất với giá rẻ nhất trên toàn quốc.
                </p>
            </div>
        </section>
    );
}
