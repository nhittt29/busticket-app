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
    const [isDobFocused, setIsDobFocused] = useState(false);

    // Face ID States
    const faceInputRef = useRef<HTMLInputElement>(null);
    const [facePreviewUrl, setFacePreviewUrl] = useState<string | null>(null);
    const [selectedFaceFile, setSelectedFaceFile] = useState<File | null>(null);
    const [isUploadingFace, setIsUploadingFace] = useState(false);

    // Webcam States
    const [isWebcamOpen, setIsWebcamOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        dob: "",
        gender: "OTHER",
    });

    useEffect(() => {
        // Fetch fresh profile on mount to prevent stale data after F5
        const fetchFreshProfile = async () => {
            if (user?.id) {
                try {
                    const response = await api.get('/auth/me');
                    if (response.data) {
                        useAuthStore.getState().updateUser(response.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch fresh profile:", error);
                }
            }
        };
        fetchFreshProfile();
    }, []); // Run only once on mount

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                dob: user.dob ? user.dob.split('T')[0] : "", // Safely handle formatting
                gender: user.gender || "OTHER",
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

    const handleFaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFaceFile(file);
            setFacePreviewUrl(URL.createObjectURL(file));
            closeWebcam(); // Close webcam if open
        }
    };

    const openWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraStream(stream);
            setIsWebcamOpen(true);
            setSelectedFaceFile(null); // Clear selected file when opening webcam
            setFacePreviewUrl(null);
            // Binding is now handled by useEffect since videoRef doesn't exist yet
        } catch (err: any) {
            console.error("Camera access error:", err);
            setMessage({ type: 'error', text: 'Không thể truy cập Camera. Vui lòng cấp quyền hoặc dùng tính năng Tải ảnh lên.' });
        }
    };

    const closeWebcam = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setIsWebcamOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Draw video frame to canvas
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert canvas to Blob (File)
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `web_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                        setSelectedFaceFile(file);
                        setFacePreviewUrl(URL.createObjectURL(file));
                        closeWebcam(); // Close webcam after capturing
                    }
                }, 'image/jpeg', 0.95); // High quality
            }
        }
    };

    // Make sure to clean up stream on unmount
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    // Bind stream to video element when modal opens
    useEffect(() => {
        if (isWebcamOpen && videoRef.current && cameraStream) {
            videoRef.current.srcObject = cameraStream;
        }
    }, [isWebcamOpen, cameraStream]);

    const handleFaceUpload = async () => {
        if (!selectedFaceFile || !user?.id) return;
        setIsUploadingFace(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('faceImage', selectedFaceFile);

            // Gửi API cập nhật FaceID (sẽ đi qua bước kiểm duyệt của DeepFace ở Backend)
            const response = await api.put('/auth/update-face-auth', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Nếu update thành công, xoá file đệm hiển thị thông báo
            setSelectedFaceFile(null);
            setMessage({ type: 'success', text: 'Cập nhật khuôn mặt thành công!' });

            // Cập nhật lại Auth Store để lấy tấm hình FaceID vừa lưu
            const { updateUser } = useAuthStore.getState();
            if (updateUser && response.data) {
                updateUser(response.data);
            }
        } catch (error: any) {
            console.error('Face ID Error:', error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật khuôn mặt.';
            setMessage({ type: 'error', text: msg });
        } finally {
            setIsUploadingFace(false);
        }
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ngày sinh</label>
                                <input
                                    type={isDobFocused ? "date" : "text"}
                                    name="dob"
                                    value={isDobFocused ? formData.dob : (formData.dob ? formData.dob.split('-').reverse().join('-') : '')}
                                    onFocus={() => setIsDobFocused(true)}
                                    onBlur={() => setIsDobFocused(false)}
                                    onChange={handleChange}
                                    placeholder="dd-mm-yyyy"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Giới tính</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={(e: any) => handleChange(e)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                                >
                                    <option value="MALE">Nam</option>
                                    <option value="FEMALE">Nữ</option>
                                    <option value="OTHER">Khác</option>
                                </select>
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

            {/* FACE ID REGISTRATION SECTION */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 mt-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">face_recognition</span>
                    Xác thực khuôn mặt (Face ID)
                </h2>
                <p className="text-slate-500 text-sm mt-1 mb-6">Đăng ký khuôn mặt để quét khi lên xe thay thế mã QR.</p>

                <div className="flex flex-col items-center sm:flex-row gap-6">
                    <div className="relative group mx-auto sm:mx-0 w-full sm:w-auto flex justify-center">
                        <div
                            className={`w-40 h-40 md:w-48 md:h-48 rounded-2xl border-2 overflow-hidden flex items-center justify-center bg-white dark:bg-surface-dark ${selectedFaceFile || user?.faceUrl ? 'border-primary' : 'border-dashed border-slate-300 dark:border-slate-700'}`}
                        >
                            {facePreviewUrl || user?.faceUrl ? (
                                <img
                                    src={facePreviewUrl || (user?.faceUrl?.startsWith('http') ? user?.faceUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/${user?.faceUrl}`)}
                                    alt="Face ID Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center text-slate-400 p-4">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">account_box</span>
                                    <p className="text-xs">Chưa đăng ký khuôn mặt</p>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={faceInputRef}
                            className="hidden"
                            accept="image/*"
                            // Cho phép bật camera chụp liền nếu đang duyệt web bằng Mobile
                            capture="user"
                            onChange={handleFaceFileChange}
                        />
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-3 w-full sm:w-auto">
                        <div className="p-4 bg-sky-50 dark:bg-sky-900/20 text-sky-800 dark:text-sky-300 rounded-lg border border-sky-100 dark:border-sky-800 text-sm">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Chỉ cung cấp hình ảnh có <strong>đúng 1 khuôn mặt</strong>.</li>
                                <li>Đảm bảo nơi chụp <strong>đủ sáng</strong>, chụp thẳng xoáy vào ngũ quan.</li>
                                <li>Ảnh của bạn sẽ được hệ thống AI DeepFace kiểm định trước khi lưu trữ.</li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-2">
                            <button
                                type="button"
                                onClick={openWebcam}
                                className="px-5 py-2.5 bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium rounded-lg transition-all"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                                    Chụp ảnh trực tiếp
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => faceInputRef.current?.click()}
                                className="px-5 py-2.5 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-white font-medium rounded-lg transition-all"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                                    Tải ảnh mặt lên
                                </span>
                            </button>

                            {selectedFaceFile && (
                                <button
                                    type="button"
                                    onClick={handleFaceUpload}
                                    disabled={isUploadingFace}
                                    className="px-5 py-2.5 bg-primary hover:bg-sky-600 text-white font-bold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 flex-1 sm:flex-none"
                                >
                                    {isUploadingFace ? "Đang xử lý AI..." : "Lưu khuôn mặt"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* WEBCAM MODAL */}
            {isWebcamOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Chụp ảnh Face ID trực tiếp</h3>
                            <button onClick={closeWebcam} className="text-slate-400 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 relative bg-black flex flex-col items-center justify-center">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-[400px] object-cover rounded-xl transform scale-x-[-1]"
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Overlay frame guide */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-56 h-72 border-2 border-white/60 rounded-full border-dashed shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"></div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-center gap-4">
                            <button
                                type="button"
                                onClick={closeWebcam}
                                className="px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-all font-medium"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                onClick={capturePhoto}
                                className="px-6 py-2.5 bg-primary hover:bg-sky-600 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                                Chụp ảnh
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

