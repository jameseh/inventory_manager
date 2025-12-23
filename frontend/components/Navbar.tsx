"use client";

import { useAuth } from "@/context/AuthContext";

export function Navbar() {
    const { user } = useAuth();

    return (
        <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
            <div className="flex items-center">
                {/* Placeholder for breadcrumbs or page title */}
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                    {user ? `Welcome, ${user.username}` : "Guest"}
                </span>
                {/* Add profile dropdown or other actions here */}
            </div>
        </div>
    );
}
