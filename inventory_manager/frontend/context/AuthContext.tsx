"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
    id: number;
    username: string;
    is_admin: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    console.log("AuthContext: Verifying token...");
                    const response = await api.get("/users/me");
                    console.log("AuthContext: User verified", response.data.username);
                    setUser(response.data);
                } catch (error: any) {
                    console.error("AuthContext: Auth check failed", error);
                    // Only logout on 401 (Unauthorized)
                    if (error.response && error.response.status === 401) {
                        console.log("AuthContext: 401 received, clearing token");
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        setUser(null);
                    } else {
                        // For other errors (network, 500), keep the token but maybe set error state?
                        // For now, doing nothing is safer than logging out.
                        console.log("AuthContext: Non-401 error, keeping token.");
                        // We still assume user is null until verified, which blocks access. 
                        // But we shouldn't delete the token.
                        // Actually, if we leave user as null, layout redirects to login.
                        // We need a better way to handle "Offline" state or retry.
                        // But preventing immediate token deletion allows retry on reload.
                        setUser(null);
                    }
                }
            } else {
                console.log("AuthContext: No token found in localStorage");
                setUser(null);
            }
            setIsLoading(false);
        };

        checkAuth();

        // Listen for 401 events from api interceptor
        const handleUnauthorized = () => {
            console.log("AuthContext: Received auth:unauthorized event, logging out");
            logout();
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);

        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, []);

    const login = async (token: string) => {
        localStorage.setItem("token", token);
        try {
            const response = await api.get("/users/me");
            setUser(response.data);
            // Optional: Store user in localStorage if needed for immediate access before hydration, 
            // but relying on state is safer for consistency.
            localStorage.setItem("user", JSON.stringify(response.data));
        } catch (error) {
            console.error("Login fetch user failed", error);
            // If fetching user fails, we shouldn't consider them logged in
            logout();
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
