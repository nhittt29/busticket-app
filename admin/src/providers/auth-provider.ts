"use client";

import { AuthProvider } from "@refinedev/core";
import { signInWithEmailAndPassword, signOut, User, setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "../lib/firebase";

export const authProvider: AuthProvider = {
    login: async ({ email, password }) => {
        try {
            // Thiết lập persistence là SESSION (đóng tab là hết phiên đăng nhập)
            await setPersistence(auth, browserSessionPersistence);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const token = await user.getIdToken();

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
            const response = await fetch(`${apiUrl}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                await signOut(auth);
                throw new Error("Không thể xác thực thông tin người dùng");
            }

            const userData = await response.json();

            if (userData?.role?.name !== "ADMIN") {
                await signOut(auth);
                throw new Error("Bạn không có quyền truy cập vào trang quản trị");
            }

            return {
                success: true,
                redirectTo: "/",
            };
        } catch (error: any) {
            // Nếu lỗi là do mình throw thì giữ nguyên message
            if (error.message === "Bạn không có quyền truy cập vào trang quản trị" || error.message === "Không thể xác thực thông tin người dùng") {
                throw error;
            }
            throw new Error("Email hoặc mật khẩu không chính xác");
        }
    },
    logout: async () => {
        try {
            await signOut(auth);
            return {
                success: true,
                redirectTo: "/login",
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    name: "LogoutError",
                    message: "Could not logout",
                },
            };
        }
    },
    check: async () => {
        try {
            const user = await new Promise<User | null>((resolve) => {
                const unsubscribe = auth.onAuthStateChanged((user) => {
                    unsubscribe();
                    resolve(user);
                });
            });

            if (user) {
                return {
                    authenticated: true,
                };
            } else {
                return {
                    authenticated: false,
                    redirectTo: "/login",
                };
            }
        } catch (error) {
            return {
                authenticated: false,
                redirectTo: "/login",
            };
        }
    },
    getPermissions: async () => {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdTokenResult();
            return token.claims.role;
        }
        return null;
    },
    getIdentity: async () => {
        const user = auth.currentUser;
        if (user) {
            return {
                id: user.uid,
                name: user.displayName || user.email,
                avatar: user.photoURL,
            };
        }
        return null;
    },
    onError: async (error) => {
        console.error(error);
        return { error };
    },
};
