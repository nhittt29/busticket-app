"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { UserAvatar } from "@/components/ui/UserAvatar";

export default function ProfilePage() {
    const { user, login } = useAuthStore(); // login used here to update store with new data
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "", // Assuming address is in user object, if not need to add to interface
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            if (!user?.id) return;

            let avatarUrl = user.avatar;

            // 1. Upload Avatar if selected
            if (selectedFile) {
                const formDataUpload = new FormData();
                formDataUpload.append('file', selectedFile);

                try {
                    console.log('Starting upload for file:', selectedFile.name);
                    const uploadRes = await api.post<{ url: string }>('/upload/avatar', formDataUpload, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    console.log('Upload response:', uploadRes.data);
                    avatarUrl = uploadRes.data.url;
                } catch (err: any) {
                    console.error('Avatar upload failed details:', err.response?.data || err.message);
                    setMessage({ type: 'error', text: `Lỗi: ${err.response?.data?.message || err.message}` });
                    setIsLoading(false);
                    return;
                }
            }

            // 2. Update User Profile
            const updatePayload = {
                ...formData,
                avatar: avatarUrl,
            };

            const response = await api.put(`/users/${user.id}`, updatePayload);

            // 3. Update Local Store
            if (response.data) {
                // Assuming useAuthStore has an updateUser method (I just added it)
                const { updateUser } = useAuthStore.getState();
                if (updateUser) {
                    updateUser(response.data);
                } else {
                    // Fallback if updateUser is missing for some reason (shouldn't happen)
                    // Reload page or re-fetch profile
                    window.location.reload();
                }
            }

            setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
        } catch (error: any) {
            console.error("Update profile error:", error);
            const msg = error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
            setMessage({ type: "error", text: msg });
        } finally {
            setIsLoading(false);
        }
    };

    // Determine avatar source


    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Thông tin tài khoản</h1>
                <p className="text-slate-500 text-sm mt-1">Quản lý thông tin cá nhân của bạn</p>
            </div>

            <div className="p-6 md:p-8">
                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <UserAvatar
                                src={previewUrl || user?.avatar}
                                alt="Avatar"
                                className="w-32 h-32 rounded-full border-4 border-slate-100 dark:border-slate-800"
                                size={128}
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white">camera_alt</span>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <p className="text-xs text-slate-500">Nhấn vào ảnh để thay đổi</p>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="flex-1 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Họ và tên</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                                    placeholder="Nhập họ tên của bạn"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed text-sm"
                            />
                            <p className="text-xs text-slate-400">Không thể thay đổi địa chỉ email.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                                placeholder="Nhập địa chỉ"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2.5 bg-primary hover:bg-sky-600 text-white font-bold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

