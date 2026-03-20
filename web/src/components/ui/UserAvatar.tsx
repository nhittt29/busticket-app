"use client";

import { useState, useEffect } from "react";
// import Image from "next/image"; // Not used currently
// import defaultAvatar from "@/assets/uploads/default.png"; // Removed import

// Tự động nhận diện IP của trình duyệt (Localhost hoặc Radmin) cho file tĩnh
let BACKEND_URL = "http://localhost:4000";
if (typeof window !== 'undefined') {
    BACKEND_URL = `http://${window.location.hostname}:4000`;
}
const DEFAULT_AVATAR_PATH = "/default-avatar.png";

interface UserAvatarProps {
    src?: string | null;
    alt?: string;
    className?: string; // Expects rounded-full etc.
    size?: number;
}

export function UserAvatar({ src, alt = "User Avatar", className = "", size = 40 }: UserAvatarProps) {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [src]);

    // Validation
    const isValidSrc = src && src !== "null" && src !== "undefined" && src.trim() !== "";

    // URL Logic:
    // 1. If it starts with http/https, use as is.
    // 2. If it implies a relative path (e.g. "uploads/"), prepend backend URL.
    // 3. Otherwise rely on browser (or it might be a data URI).
    let finalSrc = DEFAULT_AVATAR_PATH;

    if (isValidSrc && !hasError) {
        if (src!.startsWith("http") || src!.startsWith("blob:")) {
            finalSrc = src!;
        } else if (src!.startsWith("/")) {
            // If it starts with / but not in public... assume backend?
            // Actually, usually uploads are just "uploads/..." or "/uploads/..."
            // Let's safe bet: if it doesn't look like a public asset, prepend backend
            finalSrc = `${BACKEND_URL}${src}`;
        } else {
            // e.g. "uploads/avatar.png"
            finalSrc = `${BACKEND_URL}/${src}`;
        }
    }

    return (
        <div
            className={`relative overflow-hidden ${className} bg-slate-100 flex-shrink-0`}
            style={{ width: size ? undefined : 32, height: size ? undefined : 32 }} // Fallback size if no class
        >
            {/*
                TRICK TO FIX WHITE FLASH:
                Render the default avatar as a background layer.
                If the top image loads, it covers this.
                If the top image fails or is loading transparently, this shows.
             */}
            <img
                src={DEFAULT_AVATAR_PATH}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                aria-hidden="true"
            />

            {/* Real Image */}
            {isValidSrc && !hasError && (
                <img
                    src={finalSrc}
                    alt={alt}
                    className="absolute inset-0 w-full h-full object-cover relative z-10"
                    onError={() => setHasError(true)}
                />
            )}
        </div>
    );
}
