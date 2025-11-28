"use client";

import { useLogin } from "@refinedev/core";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
        <div className="min-h-screen w-full flex font-sans overflow-hidden">
            {/* Left Side - Image Section (Full Screen) */}
            <div className="hidden lg:block relative w-[65%] h-screen bg-[#DAF1DE]">
                <Image
                    src="/logo_bg.png"
                    alt="BusTicket Background"
                    fill
                    className="object-contain"
                    priority
                />
                {/* Gradient Overlay for depth (optional, keeping it subtle) */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/20 via-transparent to-transparent" />
            </div>

            {/* Right Side - Login Form (Full Screen) */}
            <div className="w-full lg:w-[35%] h-screen bg-white flex flex-col justify-center px-8 sm:px-12 xl:px-16 shadow-2xl relative z-10 overflow-hidden">

                {/* Decorative Background Blobs */}
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#CDEEF3]/70 rounded-full blur-[80px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#96DFD8]/70 rounded-full blur-[80px] animate-pulse delay-1000" />
                <div className="absolute top-[40%] right-[-20%] w-72 h-72 bg-[#D6E9AA]/60 rounded-full blur-[60px] animate-pulse delay-700" />
                <div className="absolute top-[10%] left-[-10%] w-64 h-64 bg-[#AEE6CB]/60 rounded-full blur-[60px] animate-pulse delay-500" />
                <div className="absolute bottom-[20%] right-[10%] w-48 h-48 bg-[#85D4BE]/50 rounded-full blur-[40px] animate-pulse delay-200" />

                <div className="w-full max-w-sm mx-auto space-y-8 relative z-20">
                    {/* Header */}
                    <div className="text-center">
                        <div className="relative w-28 h-28 mx-auto mb-6 transition-transform hover:scale-105 duration-300">
                            <Image
                                src="/bus_logo.png"
                                alt="BusTicket Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <h1 className="text-3xl font-black text-[#2c3e50] tracking-tight mb-2">Xin chào!</h1>
                        <p className="text-[#64748b] font-medium">Đăng nhập để bắt đầu phiên làm việc</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[#2c3e50] font-bold text-base">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-14 bg-[#f8fafc] border-[#e2e8f0] focus:bg-white focus:ring-4 focus:ring-[#96DFD8]/20 focus:border-[#96DFD8] rounded-2xl transition-all font-medium text-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-[#2c3e50] font-bold text-base">Mật khẩu</Label>
                                <a href="#" className="text-sm font-bold text-[#96DFD8] hover:text-[#85D4BE] hover:underline">
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
                                    className="h-14 bg-[#f8fafc] border-[#e2e8f0] focus:bg-white focus:ring-4 focus:ring-[#96DFD8]/20 focus:border-[#96DFD8] pr-12 rounded-2xl transition-all font-medium text-base"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-6 w-6" />
                                    ) : (
                                        <Eye className="h-6 w-6" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 bg-[#96DFD8] hover:bg-[#85D4BE] text-[#2c3e50] font-extrabold text-lg rounded-2xl shadow-lg hover:shadow-[#96DFD8]/50 hover:-translate-y-1 transition-all duration-300 mt-4"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                    Đang xác thực...
                                </>
                            ) : (
                                "Đăng nhập ngay"
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="text-center pt-6">
                        <p className="text-sm text-gray-400 font-medium">
                            &copy; 2025 BusTicket System.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
