"use client";

import { useLogin } from "@refinedev/core";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Bus } from "lucide-react";

export default function LoginPage() {
    const { mutate: login, isPending } = useLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(
            { email, password },
            {
                onError: (error) => {
                    toast.error("Đăng nhập thất bại", {
                        description: error?.message || "Vui lòng kiểm tra lại thông tin.",
                    });
                },
                onSuccess: () => {
                    toast.success("Đăng nhập thành công!");
                },
            }
        );
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#f0fdf4] font-sans p-4 relative overflow-hidden">

            {/* Page Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#bbf7d0]/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#99f6e4]/40 rounded-full blur-[120px]" />
            </div>

            {/* Main Card Container */}
            <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative z-10 min-h-[600px]">

                {/* Left Side - Visual & Branding (50%) */}
                <div className="hidden lg:flex lg:w-1/2 bg-[#ecfdf5] relative flex-col justify-between p-12">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                    </div>

                    {/* Top Branding */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <Bus className="w-6 h-6 text-[#10b981]" />
                            </div>
                            <span className="text-xl font-bold text-[#064e3b]">BusTicket Admin</span>
                        </div>
                    </div>

                    {/* Central Image */}
                    <div className="relative z-10 flex-1 flex items-center justify-center py-8">
                        <div className="relative w-full aspect-[4/3]">
                            <Image
                                src="/logo_bg.png"
                                alt="BusTicket Illustration"
                                fill
                                className="object-contain drop-shadow-xl"
                                priority
                            />
                        </div>
                    </div>

                    {/* Bottom Text */}
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-[#064e3b] mb-2">Quản lý hành trình thông minh</h2>
                        <p className="text-[#047857] opacity-80">
                            Hệ thống quản lý vé xe, lịch trình và doanh thu hiệu quả, chính xác.
                        </p>
                    </div>
                </div>

                {/* Right Side - Login Form (50%) */}
                <div className="w-full lg:w-1/2 bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="max-w-sm mx-auto w-full">

                        <div className="mb-10">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại!</h1>
                            <p className="text-gray-500">Vui lòng nhập thông tin để đăng nhập.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-gray-700 font-semibold">Mật khẩu</Label>
                                    <a href="#" className="text-sm font-medium text-[#10b981] hover:text-[#059669]">
                                        Quên mật khẩu?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] pr-10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-lg rounded-xl shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/40 hover:-translate-y-0.5 transition-all duration-200 mt-4"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    "Đăng nhập"
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-400">
                                Protected by reCAPTCHA and subject to the Privacy Policy and Terms of Service.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
