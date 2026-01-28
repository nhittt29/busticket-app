export function Hero() {
    return (
        <section className="relative bg-slate-900">
            {/* Background Image */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent z-10"></div>
                <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCkoGJiw771p-bP6h-tlFwWkK7eZxzNEvL-cBpwz-Tb_ljEPBiUeKY99iCNcKqfPMLZGri15OBngckoT6YbugUTAj7lxhvjanGKnYE4wUS0bc4bNLiioaqChKlxfcBnobEGIbJUVdcuPJ0feBEoGKjjHfdu2VqF3ga-OSjqU0p5g2HVZvAPBTqALdUHskfeIXqW3eB2x2TU0TXv_CKsF11X7GeyKlBRiemDZqT7sWpz_ZJNu9WtxoDtLDr9AYr8dGU6kMcWMX3uWeil')" }}
                ></div>
            </div>
            {/* Content Container */}
            <div className="relative z-20 px-4 lg:px-40 pt-20 pb-32 flex flex-col items-center justify-center text-center">
                <h1 className="text-white text-4xl lg:text-6xl font-black leading-tight tracking-tight mb-4 max-w-4xl drop-shadow-lg">
                    Vi vu mọi miền tổ quốc với sự thoải mái nhất
                </h1>
                <h2 className="text-slate-200 text-lg lg:text-xl font-normal max-w-2xl drop-shadow-md">
                    Tìm kiếm các tuyến xe tốt nhất với giá rẻ nhất trên toàn quốc.
                </h2>
            </div>
        </section>
    );
}
