"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match"); // better to use error state
      return;
    }

    try {
      await register({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        // Backend doesn't expect confirmPassword
      });
      router.push("/auth/login?registered=true");
    } catch (err) {
      // Error is handled in store
    }
  };

  return (
    <div className="flex flex-grow items-stretch">
      {/* Left Panel: Hero Content */}
      <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden items-center justify-center p-20">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}
        ></div>
        <div className="relative z-10 max-w-lg text-white">
          <div
            className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl shadow-2xl mb-12 border-4 border-white/20"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBUF_hNZD2XDv2tk83uNh9--rCpTUNLexnLMrmmJo_iKHAt9mTGRLCJMDBu_Og24mnT74-MXUm-lj5j76p-grhKzgJBYXyWJ0-_81DgBKkHu4_PK51NrY3f1NrV1nPWcOOcaPXgTuctJcqlNAGAHvyfbsbQbnweiq15tYTa6DAmNX5exvz9aYpeX7D9E1QJI27q9xh1zG2xlp0Avk32T7cZYXTRUVLvhkZwmZwc5802-Kwt9pRrdNpNfN5jnLHiDSKZLfYVwOwwog3X')" }}
          >
          </div>
          <h1 className="text-5xl font-black leading-tight tracking-tight mb-6">
            Bắt đầu hành trình ngay hôm nay
          </h1>
          <p className="text-lg font-normal leading-relaxed text-white/90">
            Tham gia cùng hàng ngàn hành khách đặt vé chỉ trong vài giây. Nhận ưu đãi độc quyền và lên kế hoạch dễ dàng. Chuyến đi tiếp theo của bạn chỉ cách vài cú nhấp chuột.
          </p>
          <div className="mt-10 flex gap-4 items-center">
            <div className="flex -space-x-3">
              <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi1zAeObCZJU8RuZGxIjCCCPUsl6vbeyVHLNHcO6_Dk3nWvisQwO9Yw-bKwmY7uOFq8dV_V_pM-vIVbCLMakU9yMfPyHeBh14OgeqisL7Omd9iuj0p38FgNg4Thg9bTY2bi5CLOUdMYh4FYjkm4ItJubYSo8nN9oZ_68lMa5O2s99gw2pVwTQLJV-yCNQFyyIefYx8HEnaMlL0ZWPwpVg-BciCOrzIl5WBm1UWnAtMTgfrj1WvV89L3feGJLzBK-UF7SZK24DzHJsG" />
              <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMiBK1Amowtv3l5Ooutg1aIL74vMcwe-N8F8ujw50mnrBHIGneuaSTWMVEIpz1MZzig3EESFNTGwkkAlj8ORmEZYboHM6Q8yhbJADcG6xVJbUj8k1xetiI9FlCb6uI9R99Cj4djoX_iVmU-0UNFTqJs1Ja-ow6BLpcjmXIFS4NTrAfuyaxyVMr0cidSIczl4O9VsPa9GoWDKwuH2q6OBPXPr1iqhlSL9mS3c9U0BhCHBcocEL4Xob1N_PTXJKUFOFhkSJs3y1cEO6C" />
              <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhdz0arSjwHMINmo2zfHBo2ewAesYCHLcVfMQbhwlReF93mzUcDMVQq2sVHNKkxWftN-MAGe1fhnrBBdxXqJC8AdOc1egMvjFVPNb0uvmCn7R_0aAiTRH4ogyxXm8mxvcFMBvn2s84qlhjsc52bU9c3czsk-vH6auphaWPh_Dm17GgqZAWoGRJGbX456IrU9NYNhhma4cLNcfk_vR2sbCRT0yMdUgNd0cGAlsbr4qvqqDVEDidCJcg9KcuUDHg8ldLn2XgRRx_-Avz" />
            </div>
            <span className="text-sm font-medium text-white/90">Hơn 10,000+ khách hàng tin dùng</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Registration Form */}
      <div className="flex-1 flex flex-col justify-center items-center dark:bg-background-dark px-6 py-12 lg:px-20">
        <div className="w-full max-w-[480px]">
          {/* Page Heading Component */}
          <div className="mb-8">
            <h2 className="text-[#0e161b] dark:text-white tracking-tight text-3xl font-bold leading-tight">Tạo tài khoản mới</h2>
            <p className="text-[#507a95] dark:text-gray-400 text-sm font-normal mt-2 leading-normal">Điền thông tin để bắt đầu đặt vé.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[#0e161b] dark:text-gray-200 text-sm font-medium leading-normal">Họ và tên</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">person</span>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="flex w-full rounded-lg text-[#0e161b] dark:text-white focus:ring-2 focus:ring-primary/20 border border-[#d1dde6] dark:border-gray-700 bg-[#f8fafb] dark:bg-gray-800/50 focus:border-primary h-12 pl-12 placeholder:text-[#507a95] dark:placeholder:text-gray-500 text-sm font-normal focus:outline-none transition-all"
                  placeholder="Nhập họ tên đầy đủ"
                  required
                  type="text"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone Number Field */}
              <div className="flex flex-col gap-2">
                <label className="text-[#0e161b] dark:text-gray-200 text-sm font-medium leading-normal">Số điện thoại</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">call</span>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex w-full rounded-lg text-[#0e161b] dark:text-white focus:ring-2 focus:ring-primary/20 border border-[#d1dde6] dark:border-gray-700 bg-[#f8fafb] dark:bg-gray-800/50 focus:border-primary h-12 pl-12 placeholder:text-[#507a95] dark:placeholder:text-gray-500 text-sm font-normal focus:outline-none transition-all"
                    placeholder="0912 345 678"
                    required
                    type="tel"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="text-[#0e161b] dark:text-gray-200 text-sm font-medium leading-normal">Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">mail</span>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex w-full rounded-lg text-[#0e161b] dark:text-white focus:ring-2 focus:ring-primary/20 border border-[#d1dde6] dark:border-gray-700 bg-[#f8fafb] dark:bg-gray-800/50 focus:border-primary h-12 pl-12 placeholder:text-[#507a95] dark:placeholder:text-gray-500 text-sm font-normal focus:outline-none transition-all"
                    placeholder="ten@email.com"
                    required
                    type="email"
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[#0e161b] dark:text-gray-200 text-sm font-medium leading-normal">Mật khẩu</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
                <style jsx>{`
                  input::-ms-reveal,
                  input::-ms-clear {
                      display: none;
                  }
                `}</style>
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  className="flex w-full rounded-lg text-[#0e161b] dark:text-white focus:ring-2 focus:ring-primary/20 border border-[#d1dde6] dark:border-gray-700 bg-[#f8fafb] dark:bg-gray-800/50 focus:border-primary h-12 pl-12 pr-16 placeholder:text-[#507a95] dark:placeholder:text-gray-500 text-sm font-normal focus:outline-none transition-all"
                  placeholder="Tạo mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-gray-400 hover:text-primary transition-colors cursor-pointer z-[100] rounded-r-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                >
                  <span className="material-symbols-outlined text-lg select-none pointer-events-none">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[#0e161b] dark:text-gray-200 text-sm font-medium leading-normal">Xác nhận mật khẩu</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">shield</span>
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  type={showConfirmPassword ? "text" : "password"}
                  className="flex w-full rounded-lg text-[#0e161b] dark:text-white focus:ring-2 focus:ring-primary/20 border border-[#d1dde6] dark:border-gray-700 bg-[#f8fafb] dark:bg-gray-800/50 focus:border-primary h-12 pl-12 pr-16 placeholder:text-[#507a95] dark:placeholder:text-gray-500 text-sm font-normal focus:outline-none transition-all"
                  placeholder="Nhập lại mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowConfirmPassword(!showConfirmPassword);
                  }}
                  className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-gray-400 hover:text-primary transition-colors cursor-pointer z-[100] rounded-r-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                >
                  <span className="material-symbols-outlined text-lg select-none pointer-events-none">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 py-2">
              <input className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-primary" id="terms" type="checkbox" required />
              <label className="text-sm text-[#507a95] dark:text-gray-400 leading-normal" htmlFor="terms">
                Tôi đồng ý với <Link href="#" className="text-primary font-medium hover:underline">Điều khoản dịch vụ</Link> và <Link href="#" className="text-primary font-medium hover:underline">Chính sách bảo mật</Link>.
              </label>
            </div>

            {/* Action Button */}
            <button
              className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              <span className="truncate">{isLoading ? 'Đang khởi tạo...' : 'Đăng Ký'}</span>
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#507a95] dark:text-gray-400">
              Đã có tài khoản?
              <Link href="/auth/login" className="text-primary font-bold hover:underline ml-1">Đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
