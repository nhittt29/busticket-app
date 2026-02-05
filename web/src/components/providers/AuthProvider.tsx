"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setToken, logout } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            if (user) {
                // User is signed in or token refreshed
                try {
                    const token = await user.getIdToken();
                    setToken(token);
                    console.log("[AuthProvider] Token synced/refreshed");
                } catch (error) {
                    console.error("[AuthProvider] Failed to get fresh token", error);
                }
            } else {
                // User is signed out
                // Only logout if we had a persistent session that is now invalid
                // However, be careful not to trigger loop if store logout calls firebase signOut
                // Stores usually clear state on logout.
                // If we are here, firebase sdk says no user.
                // We should ensure store is cleared.
                // But wait, if initial load and no user, we shouldn't force logout if we weren't logged in.
                // Check if store thinks we are authenticated
                if (useAuthStore.getState().isAuthenticated) {
                    logout();
                }
            }
        });

        return () => unsubscribe();
    }, [setToken, logout]);

    return <>{children}</>;
}
