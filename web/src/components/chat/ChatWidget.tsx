"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import defaultAvatar from "@/assets/uploads/default.png";
import api from "@/lib/api";
import { aiApi } from "@/lib/api/ai";
import { useRouter } from "next/navigation";

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ id: number; text: string; isBot: boolean }[]>([
        { id: 1, text: "Xin chào! Mình là trợ lý AI BusTicket. Mình có thể giúp gì cho bạn hôm nay?", isBot: true },
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();

    const router = useRouter();

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now(), text: inputText, isBot: false };
        // Optimistic update
        setMessages((prev) => [...prev, userMsg]);
        setInputText("");
        setIsTyping(true);

        try {
            // Prepare history for backend
            let formattedHistory = messages.map(m => ({
                role: m.isBot ? 'model' : 'user',
                parts: m.text
            })).filter(h => !h.parts.includes("SEARCH_TRIP")); // Filter out raw JSON from history

            // Gemini Rule: First message in history must be from 'user'.
            // Remove leading 'model' messages (like the Welcome message).
            while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
                formattedHistory.shift();
            }

            const answer = await aiApi.chat(userMsg.text, formattedHistory);

            // Check if answer is JSON (Action Command)
            if (answer.trim().startsWith('{') && answer.trim().endsWith('}')) {
                try {
                    const command = JSON.parse(answer);
                    if (command.action === 'SEARCH_TRIP') {

                        const botMsg = {
                            id: Date.now() + 1,
                            text: `Đang tìm chuyến xe từ ${command.from} đến ${command.to} ngày ${command.date}...`,
                            isBot: true
                        };
                        setMessages((prev) => [...prev, botMsg]);

                        // Redirect to search
                        const queryUpdated = new URLSearchParams({
                            from: command.from,
                            to: command.to,
                            date: command.date
                        }).toString();

                        setTimeout(() => {
                            router.push(`/?${queryUpdated}`);
                        }, 1500);
                    }
                } catch (e) {
                    // Not valid JSON, treat as text
                    setMessages((prev) => [...prev, { id: Date.now() + 1, text: answer, isBot: true }]);
                }
            } else {
                setMessages((prev) => [...prev, { id: Date.now() + 1, text: answer, isBot: true }]);
            }

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [...prev, { id: Date.now() + 1, text: "Xin lỗi, hiện tại hệ thống đang bận. Vui lòng thử lại sau.", isBot: true }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            <div
                className={`mb-4 w-[350px] md:w-[380px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 origin-bottom-right transform ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
                    }`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-sky-600 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <span className="material-symbols-outlined text-white text-lg">smart_toy</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">BusTicket AI</h3>
                            <p className="text-blue-100 text-xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Messages Body */}
                <div className="h-[400px] overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/50 space-y-4 scroll-smooth">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
                        >
                            {msg.isBot && (
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                                </div>
                            )}
                            <div
                                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.isBot
                                    ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm"
                                    : "bg-primary text-white rounded-tr-none shadow-md shadow-primary/20"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 flex-shrink-0">
                                <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                            </div>
                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none dark:text-white placeholder-slate-400"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isTyping}
                            className="p-2.5 bg-primary text-white rounded-full hover:bg-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-90"
                        >
                            <span className="material-symbols-outlined text-xl">send</span>
                        </button>
                    </form>
                </div>
            </div>

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen
                    ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rotate-90"
                    : "bg-gradient-to-r from-primary to-sky-500 text-white animate-bounce-slow"
                    }`}
            >
                {isOpen ? (
                    <span className="material-symbols-outlined text-2xl">close</span>
                ) : (
                    <span className="material-symbols-outlined text-2xl">chat_bubble</span>
                )}
            </button>
        </div>
    );
}
