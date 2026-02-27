import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StarRating } from '@/components/ui/star-rating';
import { reviewApi } from '@/lib/api/review';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface WriteReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticketId: number;
    onSuccess?: () => void;
}

export function WriteReviewModal({ isOpen, onClose, ticketId, onSuccess }: WriteReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (images.length >= 3) {
            toast.error("Chỉ được tải lên tối đa 3 ảnh");
            return;
        }

        setIsUploading(true);
        try {
            const url = await reviewApi.uploadImage(file);
            setImages(prev => [...prev, url]);
            toast.success("Tải ảnh thành công");
        } catch (error) {
            toast.error("Lỗi tải ảnh lên");
            console.error(error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Vui lòng chọn số sao");
            return;
        }

        setIsSubmitting(true);
        try {
            await reviewApi.create({
                ticketId,
                rating,
                comment,
                images
            });

            toast.success("Đánh giá thành công!", {
                description: "Cảm ơn bạn đã chia sẻ trải nghiệm.",
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            toast.error("Có lỗi xảy ra", {
                description: error.message || "Không thể gửi đánh giá",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Đánh giá chuyến đi</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-medium text-slate-500">Bạn cảm thấy chuyến đi thế nào?</span>
                        <StarRating rating={rating} onRatingChange={setRating} editable size="lg" />
                        <span className="text-sm font-bold text-primary">
                            {rating === 5 && "Tuyệt vời!"}
                            {rating === 4 && "Rất tốt"}
                            {rating === 3 && "Bình thường"}
                            {rating === 2 && "Tệ"}
                            {rating === 1 && "Rất tệ"}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nhận xét (tùy chọn)</label>
                            <Textarea
                                placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex justify-between">
                                <span>Hình ảnh ({images.length}/3)</span>
                                {isUploading && <span className="text-xs text-blue-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Đang tải...</span>}
                            </label>

                            <div className="flex gap-3 flex-wrap">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group">
                                        <Image src={img} alt="Review" fill className="object-cover" />
                                        <button
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                {images.length < 3 && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                                    >
                                        <ImageIcon className="w-6 h-6 mb-1" />
                                        <span className="text-[10px] font-bold">Thêm ảnh</span>
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || isUploading}>
                        {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
