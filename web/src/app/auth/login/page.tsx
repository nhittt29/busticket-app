"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import googleLogo from "@/assets/images/google_logo.png";
import facebookLogo from "@/assets/images/facebok_logo.png";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        try {
            await login(email, password, rememberMe);
            router.push("/"); // Redirect to home on success
        } catch (err) {
            // Error is handled in store and displayed
        }
    };

    return (
        <div className="flex flex-grow items-stretch">
            {/* Left Side: Hero Section (Visible on Desktop) */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBUF_hNZD2XDv2tk83uNh9--rCpTUNLexnLMrmmJo_iKHAt9mTGRLCJMDBu_Og24mnT74-MXUm-lj5j76p-grhKzgJBYXyWJ0-_81DgBKkHu4_PK51NrY3f1NrV1nPWcOOcaPXgTuctJcqlNAGAHvyfbsbQbnweiq15tYTa6DAmNX5exvz9aYpeX7D9E1QJI27q9xh1zG2xlp0Avk32T7cZYXTRUVLvhkZwmZwc5802-Kwt9pRrdNpNfN5jnLHiDSKZLfYVwOwwog3X')" }}
                >
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="relative z-10 flex flex-col justify-end p-20 w-full">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-primary p-2 rounded-lg">
                            <span className="material-symbols-outlined text-white text-3xl">directions_bus</span>
                        </div>
                        <span className="text-white text-2xl font-bold tracking-tight">BusBooker</span>
                    </div>
                    <h1 className="text-white text-5xl font-extrabold leading-tight mb-4">
                        Sẵn sàng cho hành trình mới?
                    </h1>
                    <p className="text-white/80 text-lg max-w-md">
                        Trải nghiệm sự thoải mái và tin cậy trên mọi nẻo đường. Đăng nhập để quản lý vé và khám phá những điểm đến mới.
                    </p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 dark:bg-background-dark">
                <div className="w-full max-w-[480px]">
                    {/* Page Heading */}
                    <div className="mb-10">
                        <h2 className="text-[#0e161b] dark:text-white text-4xl font-bold tracking-tight mb-2">Đăng Nhập</h2>
                        <p className="text-[#507a95] dark:text-gray-400 text-base">Nhập thông tin để quản lý các chuyến đi của bạn.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#0e161b] dark:text-white text-base font-medium leading-normal">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex w-full rounded-lg text-[#0e161b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#d1dde6] dark:border-gray-700 bg-white dark:bg-gray-800 h-14 placeholder:text-[#507a95] px-4 text-base font-normal leading-normal transition-all"
                                    placeholder="Ví dụ: ten@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#0e161b] dark:text-white text-base font-medium leading-normal">Mật khẩu</label>
                            <div className="relative w-full">
                                <style jsx>{`
                                    input::-ms-reveal,
                                    input::-ms-clear {
                                        display: none;
                                    }
                                `}</style>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`block w-full rounded-lg text-[#0e161b] dark:text-white focus:outline-0 focus:ring-2 border bg-white dark:bg-gray-800 h-14 placeholder:text-[#507a95] px-4 pr-16 text-base font-normal leading-normal transition-all ${password.length > 0 && password.length < 8
                                        ? 'border-red-500 focus:ring-red-200'
                                        : 'border-[#d1dde6] dark:border-gray-700 focus:ring-primary/50'
                                        }`}
                                    placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowPassword(!showPassword);
                                    }}
                                    className="absolute right-0 top-0 h-full w-16 flex items-center justify-center text-[#507a95] hover:text-primary transition-colors cursor-pointer z-[100] rounded-r-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                                >
                                    <span className="material-symbols-outlined select-none pointer-events-none text-2xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                            {password.length > 0 && password.length < 8 && (
                                <p className="text-red-500 text-xs mt-1 font-medium pl-1">Mật khẩu phải có tối thiểu 8 ký tự</p>
                            )}
                        </div>

                        {/* Actions: Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-x-2 cursor-pointer group checkbox-custom">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-5 w-5 rounded border-[#d1dde6] dark:border-gray-700 border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer"
                                />
                                <span className="text-[#0e161b] dark:text-gray-300 text-sm font-medium">Ghi nhớ đăng nhập</span>
                            </label>
                            <Link href="/auth/forgot-password" className="text-primary hover:text-primary/80 text-sm font-bold transition-colors">Quên mật khẩu?</Link>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-lg text-lg font-bold shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-10 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-[#d1dde6] dark:border-gray-700"></span>
                        </div>
                        <span className="relative bg-white dark:bg-background-dark px-4 text-[#507a95] text-sm">Hoặc tiếp tục với</span>
                    </div>



                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-3 border border-[#d1dde6] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 h-12 rounded-lg transition-colors font-semibold text-sm cursor-pointer">
                            <Image src={googleLogo} alt="Google logo" width={20} height={20} />
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-3 border border-[#d1dde6] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 h-12 rounded-lg transition-colors font-semibold text-sm cursor-pointer">
                            <Image src={facebookLogo} alt="Facebook logo" width={20} height={20} />
                            Facebook
                        </button>
                    </div>

                    {/* Register Footer */}
                    <p className="mt-10 text-center text-[#507a95] dark:text-gray-400">
                        Chưa có tài khoản?
                        <Link prefetch={false} href="/auth/register" className="text-primary hover:text-primary/80 font-bold ml-1 transition-colors underline-offset-4 hover:underline">Đăng ký ngay</Link>
                    </p>
                </div>

                {/* Dark Mode Toggle */}
                <div className="absolute top-8 right-8">
                    <button
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                        onClick={() => document.documentElement.classList.toggle('dark')}
                    >
                        <span className="material-symbols-outlined dark:hidden">dark_mode</span>
                        <span className="material-symbols-outlined hidden dark:block text-yellow-400">light_mode</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
