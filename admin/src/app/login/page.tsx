"use client";

import { useLogin } from "@refinedev/core";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Moon, Sun, Bus } from "lucide-react";

const Typewriter = ({ text, className = "", delay = 50, startDelay = 0 }: { text: string, className?: string, delay?: number, startDelay?: number }) => {
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setStarted(true);
        }, startDelay);
        return () => clearTimeout(timeout);
    }, [startDelay]);

    useEffect(() => {
        if (!started) return;

        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setCurrentText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, delay);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, delay, text, started]);

    return <span className={className}>{currentText}</span>;
};

export default function LoginPage() {
    const { mutate: login, isPending } = useLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

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
        <div className={`min-h-screen w-full flex font-sans overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
            <style jsx global>{`
                @keyframes drive {
                    0% { transform: translateX(-50px); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateX(250px); opacity: 0; }
                }
                .animate-drive {
                    animation: drive 1.5s infinite linear;
                }
            `}</style>

            {/* Left Side - Image Section (Full Screen) */}
            <div className={`hidden lg:block relative w-[65%] h-screen overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#DAF1DE]'}`}>
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: `radial-gradient(${isDarkMode ? '#ffffff' : '#2c3e50'} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

                {/* Floating Travel Icons */}
                <div className="absolute top-[15%] right-[8%] text-[#4A9EFF]/40 animate-bounce duration-[3000ms]">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" /></svg>
                </div>
                <div className="absolute bottom-[20%] left-[5%] text-[#FF9A3C]/40 animate-bounce delay-700 duration-[4000ms]">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                </div>
                <div className="absolute top-[5%] left-[10%] text-[#4CAF50]/30 animate-spin duration-[8000ms]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56c1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" /></svg>
                </div>

                <Image
                    src="/logo_bg.png"
                    alt="BusTicket Background"
                    fill
                    className="object-contain relative z-10"
                    priority
                />
                {/* Gradient Overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/10 via-transparent to-transparent z-20" />
            </div>

            {/* Right Side - Login Form (Full Screen) */}
            <div className={`w-full lg:w-[35%] h-screen flex flex-col justify-center px-8 sm:px-12 xl:px-16 shadow-2xl relative z-10 overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>

                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className={`absolute top-6 right-6 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-white text-orange-500 hover:bg-gray-50'}`}
                >
                    {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                </button>

                {/* Decorative Background Blobs */}
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#CDEEF3]/70 rounded-full blur-[80px] animate-pulse pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#96DFD8]/70 rounded-full blur-[80px] animate-pulse delay-1000 pointer-events-none" />
                <div className="absolute top-[40%] right-[-20%] w-72 h-72 bg-[#D6E9AA]/60 rounded-full blur-[60px] animate-pulse delay-700 pointer-events-none" />
                <div className="absolute top-[10%] left-[-10%] w-64 h-64 bg-[#AEE6CB]/60 rounded-full blur-[60px] animate-pulse delay-500 pointer-events-none" />
                <div className="absolute bottom-[20%] right-[10%] w-48 h-48 bg-[#85D4BE]/50 rounded-full blur-[40px] animate-pulse delay-200 pointer-events-none" />

                {/* Additional Blobs for Depth */}
                <div className="absolute top-[30%] left-[15%] w-32 h-32 bg-[#FF9A3C]/10 rounded-full blur-[30px] animate-pulse delay-300 pointer-events-none" />
                <div className="absolute bottom-[40%] right-[20%] w-40 h-40 bg-[#4A9EFF]/10 rounded-full blur-[30px] animate-pulse delay-600 pointer-events-none" />

                <div className="w-full max-w-sm mx-auto space-y-8 relative z-20">
                    {/* Header */}
                    <div className="text-center">
                        <div className={`p-6 rounded-3xl shadow-2xl border w-fit mx-auto mb-8 transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-white/90 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.15)]' : 'bg-white border-gray-100'}`}>
                            <div className="relative w-32 h-32">
                                <Image
                                    src="/bus_logo.png"
                                    alt="BusTicket Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        <h1 className={`text-3xl font-black tracking-tight mb-2 min-h-[36px] transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-[#2c3e50]'}`}>
                            <Typewriter text="Xin chào!" delay={150} />
                            <span className="animate-pulse text-[#96DFD8]">|</span>
                        </h1>
                        <p className={`font-medium min-h-[24px] transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-[#64748b]'}`}>
                            <Typewriter text="Đăng nhập để bắt đầu phiên làm việc" delay={50} startDelay={1500} />
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className={`font-bold text-base transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-[#2c3e50]'}`}>Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={`h-14 rounded-2xl transition-all font-medium text-base focus:ring-4 focus:ring-[#96DFD8]/20 focus:border-[#96DFD8] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-800' : 'bg-[#f8fafc] border-[#e2e8f0] focus:bg-white'}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className={`font-bold text-base transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-[#2c3e50]'}`}>Mật khẩu</Label>
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
                                    className={`h-14 pr-12 rounded-2xl transition-all font-medium text-base focus:ring-4 focus:ring-[#96DFD8]/20 focus:border-[#96DFD8] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-800' : 'bg-[#f8fafc] border-[#e2e8f0] focus:bg-white'}`}
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
                            className="w-full h-14 bg-[#96DFD8] hover:bg-[#85D4BE] text-[#2c3e50] font-extrabold text-lg rounded-2xl shadow-lg hover:shadow-[#96DFD8]/50 hover:-translate-y-1 transition-all duration-300 mt-4 relative overflow-hidden"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <div className="absolute inset-0 flex items-center justify-start px-4">
                                    <div className="animate-drive text-[#2c3e50]">
                                        <Bus className="h-8 w-8" />
                                    </div>
                                    <span className="ml-auto mr-auto">Đang khởi hành...</span>
                                </div>
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
