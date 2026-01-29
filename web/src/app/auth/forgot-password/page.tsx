"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const router = useRouter();

    // Step 1: Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await api.post('/auth/send-otp', { email });
            setMessage(`Mã OTP đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư.`);
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gửi OTP thất bại. Vui lòng kiểm tra lại email.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await api.post('/auth/verify-otp', { email, otp });
            // If success, move to next step
            setStep(3);
            setMessage(null); // Clear message
        } catch (err: any) {
            setError(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await api.post('/auth/reset-password-with-otp', { email, otp, newPassword });
            // Success
            alert('Đặt lại mật khẩu thành công! Bạn sẽ được chuyển hướng về trang đăng nhập.');
            router.push('/auth/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-grow items-stretch min-h-screen">
            {/* Left Side: Hero Section (Visible on Desktop) */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
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
                        Khôi phục tài khoản
                    </h1>
                    <p className="text-white/80 text-lg max-w-md">
                        Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại quyền truy cập chỉ trong vài bước đơn giản.
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 bg-white dark:bg-background-dark">
                <div className="w-full max-w-[480px]">
                    <div className="mb-10">
                        <h2 className="text-[#0e161b] dark:text-white text-4xl font-bold tracking-tight mb-2">Quên mật khẩu?</h2>
                        <p className="text-[#507a95] dark:text-gray-400 text-base">
                            {step === 1 && 'Nhập email của bạn để nhận mã xác thực.'}
                            {step === 2 && 'Nhập mã OTP 6 số đã được gửi đến email.'}
                            {step === 3 && 'Tạo mật khẩu mới cho tài khoản của bạn.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {message && step === 2 && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
                            {message}
                        </div>
                    )}

                    {/* STEP 1: Email Input */}
                    {step === 1 && (
                        <form className="space-y-6" onSubmit={handleSendOtp}>
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
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-lg text-lg font-bold shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Đang gửi mã...' : 'Gửi mã OTP'}
                            </button>
                        </form>
                    )}

                    {/* STEP 2: OTP Input */}
                    {step === 2 && (
                        <form className="space-y-6" onSubmit={handleVerifyOtp}>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#507a95] text-sm font-medium">Email nhận mã</label>
                                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 font-medium flex justify-between items-center">
                                    <span>{email}</span>
                                    <button type="button" onClick={() => setStep(1)} className="text-primary text-sm font-bold hover:underline">Thay đổi</button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#0e161b] dark:text-white text-base font-medium leading-normal">Mã OTP (6 số)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="flex w-full rounded-lg text-[#0e161b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#d1dde6] dark:border-gray-700 bg-white dark:bg-gray-800 h-14 placeholder:text-[#507a95] px-4 text-base font-normal leading-normal transition-all tracking-widest text-center text-xl"
                                        placeholder="------"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || otp.length < 6}
                                className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-lg text-lg font-bold shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Đang xác thực...' : 'Xác thực mã'}
                            </button>

                            <button
                                type="button"
                                onClick={handleSendOtp} // Resend logic
                                className="w-full text-primary hover:text-primary/80 font-semibold text-sm mt-2"
                            >
                                Gửi lại mã
                            </button>
                        </form>
                    )}

                    {/* STEP 3: New Password */}
                    {step === 3 && (
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#0e161b] dark:text-white text-base font-medium leading-normal">Mật khẩu mới</label>
                                <div className="relative w-full">
                                    <style jsx>{`
                                        input::-ms-reveal,
                                        input::-ms-clear {
                                            display: none;
                                        }
                                    `}</style>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={`block w-full rounded-lg text-[#0e161b] dark:text-white focus:outline-0 focus:ring-2 border bg-white dark:bg-gray-800 h-14 placeholder:text-[#507a95] px-4 pr-16 text-base font-normal leading-normal transition-all ${newPassword.length > 0 && newPassword.length < 8
                                            ? 'border-red-500 focus:ring-red-200'
                                            : 'border-[#d1dde6] dark:border-gray-700 focus:ring-primary/50'
                                            }`}
                                        placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
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
                                {newPassword.length > 0 && newPassword.length < 8 && (
                                    <p className="text-red-500 text-xs mt-1 font-medium pl-1">Mật khẩu phải có tối thiểu 8 ký tự</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#0e161b] dark:text-white text-base font-medium leading-normal">Xác nhận mật khẩu</label>
                                <div className="relative w-full">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`block w-full rounded-lg text-[#0e161b] dark:text-white focus:outline-0 focus:ring-2 border bg-white dark:bg-gray-800 h-14 placeholder:text-[#507a95] px-4 pr-16 text-base font-normal leading-normal transition-all ${confirmPassword.length > 0 && confirmPassword.length < 8
                                            ? 'border-red-500 focus:ring-red-200'
                                            : 'border-[#d1dde6] dark:border-gray-700 focus:ring-primary/50'
                                            }`}
                                        placeholder="Nhập lại mật khẩu"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowConfirmPassword(!showConfirmPassword);
                                        }}
                                        className="absolute right-0 top-0 h-full w-16 flex items-center justify-center text-[#507a95] hover:text-primary transition-colors cursor-pointer z-[100] rounded-r-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                                    >
                                        <span className="material-symbols-outlined select-none pointer-events-none text-2xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                                {confirmPassword.length > 0 && confirmPassword.length < 8 && (
                                    <p className="text-red-500 text-xs mt-1 font-medium pl-1">Mật khẩu phải có tối thiểu 8 ký tự</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-lg text-lg font-bold shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                            </button>
                        </form>
                    )}

                    {/* Back to Login */}
                    <div className="mt-8 text-center">
                        <Link href="/auth/login" className="text-[#507a95] dark:text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-2 font-medium">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
