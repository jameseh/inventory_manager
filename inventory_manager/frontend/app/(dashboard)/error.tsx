"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Dashboard Error Boundary caught error:", error);
    }, [error]);

    return (
        <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-rose-500">Something went wrong!</h2>
            <p className="text-slate-400 max-w-md">
                {error.message || "An unexpected error occurred."}
            </p>
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-left overflow-auto max-w-lg w-full max-h-48">
                <code className="text-xs text-rose-400 font-mono">
                    {error.stack}
                </code>
            </div>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
            >
                Try again
            </button>
        </div>
    );
}
