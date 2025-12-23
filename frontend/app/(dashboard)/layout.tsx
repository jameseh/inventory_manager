"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import {
    LayoutDashboard,
    Package,
    Settings,
    LogOut,
    Menu,
    X,
    ScanLine,
    Archive,
    History
} from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-20 lg:w-64 flex-col bg-slate-900 border-r border-slate-800">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Archive className="text-slate-950" size={20} />
                    </div>
                    <span className="text-xl font-bold tracking-tight hidden lg:block text-white">
                        Maker Manager
                    </span>
                </div>

                <nav className="flex-1 px-3 py-6 space-y-2">
                    <NavButton
                        active={pathname === "/"}
                        onClick={() => router.push("/")}
                        icon={<LayoutDashboard size={22} />}
                        label="Dashboard"
                    />
                    <NavButton
                        active={pathname === "/inventory"}
                        onClick={() => router.push("/inventory")}
                        icon={<Package size={22} />}
                        label="Inventory"
                    />
                    <NavButton
                        active={pathname === "/transactions"}
                        onClick={() => router.push("/transactions")}
                        icon={<History size={22} />}
                        label="History"
                    />
                    <NavButton
                        active={pathname === "/inventory/new"}
                        onClick={() => router.push("/inventory/new")}
                        icon={<ScanLine size={22} />}
                        label="Add Item"
                    />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="px-3 py-2 text-slate-400 text-sm mb-2">
                        <span className="hidden lg:block">Logged in as</span>
                        <span className="font-medium text-emerald-400">{user.username}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="hidden lg:block text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <Archive className="text-slate-950" size={18} />
                        </div>
                        <span className="font-bold text-lg">Maker Manager</span>
                    </div>
                    <button
                        onClick={logout}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <LogOut size={20} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </div>

                <Link
                    href="/scanner"
                    className="fixed bottom-8 right-8 p-4 bg-emerald-500 text-slate-950 rounded-full shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:scale-105 transition-all z-50 flex items-center justify-center"
                    title="Open Scanner"
                >
                    <ScanLine size={24} />
                </Link>

                {/* Mobile Bottom Nav */}
                <div className="md:hidden bg-slate-900 border-t border-slate-800 flex justify-around p-3 pb-safe">
                    <MobileNavButton
                        active={pathname === "/"}
                        onClick={() => router.push("/")}
                        icon={<LayoutDashboard size={24} />}
                        label="Home"
                    />
                    <MobileNavButton
                        active={pathname === "/inventory"}
                        onClick={() => router.push("/inventory")}
                        icon={<Package size={24} />}
                        label="Items"
                    />
                    <MobileNavButton
                        active={pathname === "/transactions"}
                        onClick={() => router.push("/transactions")}
                        icon={<History size={24} />}
                        label="History"
                    />
                    <MobileNavButton
                        active={pathname === "/inventory/new"}
                        onClick={() => router.push("/inventory/new")}
                        icon={<ScanLine size={24} />}
                        label="Add"
                    />
                </div>
            </main>
        </div>
    );
}

const NavButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
    >
        <div className={`${active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
            {icon}
        </div>
        <span className="hidden lg:block">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 hidden lg:block" />}
    </button>
);

const MobileNavButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 ${active ? 'text-emerald-400' : 'text-slate-500'}`}
    >
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);
