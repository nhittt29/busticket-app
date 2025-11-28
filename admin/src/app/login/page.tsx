"use client";

import { useLogin } from "@refinedev/core";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import { BusFront, Eye, EyeOff } from "lucide-react";

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
        <div className="w-full h-screen lg:grid lg:grid-cols-2">
            {/* Left Side - Hero Image */}
            <div className="hidden lg:flex relative h-full w-full flex-col bg-muted p-10 text-white dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="absolute inset-0">
                    <Image
                        src="/login-hero.png"
                        alt="Bus Ticket Admin"
                        fill
                        className="object-cover opacity-80"
                        priority
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/90 to-[#2c3e50]/30 mix-blend-multiply" />
                </div>

                <div className="relative z-20 flex items-center text-lg font-medium">
                    <div className="relative w-8 h-8 mr-2">
                        <Image src="/icon.png" alt="Logo" fill className="object-contain" />
                    </div>
                    busticket-app Admin
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            "Hệ thống quản lý vé xe khách hiện đại, chuyên nghiệp và hiệu quả nhất Việt Nam."
                        </p>
                        <footer className="text-sm">Admin Team</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center py-12 bg-white">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold text-[#2c3e50]">Đăng nhập</h1>
                        <p className="text-balance text-muted-foreground">
                            Nhập email và mật khẩu để truy cập hệ thống
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 focus-visible:ring-[#96DFD8]"
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Mật khẩu</Label>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11 focus-visible:ring-[#96DFD8] pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11 bg-[#96DFD8] hover:bg-[#85D4BE] text-white font-semibold text-base transition-all shadow-sm hover:shadow-md"
                            disabled={isPending}
                        >
                            {isPending ? "Đang xử lý..." : "Đăng nhập"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        Bạn quên mật khẩu?{" "}
                        <a href="#" className="underline underline-offset-4 hover:text-primary">
                            Liên hệ IT
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
