import React from 'react';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    onRatingChange?: (rating: number) => void;
    editable?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function StarRating({
    rating,
    maxRating = 5,
    onRatingChange,
    editable = false,
    size = 'md'
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = React.useState(0);

    const handleMouseEnter = (index: number) => {
        if (editable) {
            setHoverRating(index);
        }
    };

    const handleMouseLeave = () => {
        if (editable) {
            setHoverRating(0);
        }
    };

    const handleClick = (index: number) => {
        if (editable && onRatingChange) {
            onRatingChange(index);
        }
    };

    const sizeClasses = {
        sm: 'text-base',
        md: 'text-2xl',
        lg: 'text-4xl'
    };

    return (
        <div className="flex gap-1">
            {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`${sizeClasses[size]} transition-colors focus:outline-none ${(hoverRating || rating) >= star
                            ? 'text-yellow-400'
                            : 'text-slate-300 dark:text-slate-600'
                        } ${editable ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}`}
                    onMouseEnter={() => handleMouseEnter(star)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(star)}
                    disabled={!editable}
                >
                    <span className="material-symbols-outlined fill-current">star</span>
                </button>
            ))}
        </div>
    );
}
