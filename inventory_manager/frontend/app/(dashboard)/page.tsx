"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api";
import {
    LayoutDashboard,
    AlertTriangle,
    TrendingUp,
    Clock,
    Package,
    Activity,
    Brush,
    ArrowRight,
    Search,
    Zap,
    Box
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface DashboardData {
    total_items: number;
    low_stock_items: any[];
    most_used_items: any[];
    recent_items: any[];
    recent_activity: any[];
    maintenance_items: any[];
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/inventory?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 text-glow">Dashboard</h1>
                    <p className="text-slate-400">Overview of your inventory and activity.</p>
                </div>

                {/* Dashboard Search */}
                <form onSubmit={handleSearch} className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all backdrop-blur-sm"
                    />
                </form>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <StatsCard
                    title="Total Items"
                    value={stats.total_items}
                    icon={Package}
                    color="blue"
                    bgClass="bg-blue-500/10"
                    textClass="text-blue-500"
                />
                <StatsCard
                    title="Low Stock"
                    value={stats.low_stock_items.length}
                    icon={AlertTriangle}
                    color="rose"
                    bgClass="bg-rose-500/10"
                    textClass="text-rose-500"
                />
                <StatsCard
                    title="Recent Actions"
                    value={stats.recent_activity.length}
                    icon={Activity}
                    color="emerald"
                    bgClass="bg-emerald-500/10"
                    textClass="text-emerald-500"
                />
                <StatsCard
                    title="Maintenance"
                    value={stats.maintenance_items.length}
                    icon={Brush}
                    color="amber"
                    bgClass="bg-amber-500/10"
                    textClass="text-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Most Popular Items */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp className="text-primary-500" size={20} />
                                Popular Items
                            </h2>
                        </div>
                        <div className="p-6">
                            {stats.most_used_items.length > 0 ? (
                                <div className="space-y-4">
                                    {stats.most_used_items.map((item: any, idx: number) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-white/5 hover:border-primary-500/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 text-slate-400 font-bold text-sm">
                                                    #{idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{item.name}</p>
                                                    <p className="text-xs text-slate-400">{item.count} transactions</p>
                                                </div>
                                            </div>
                                            <Link href={`/inventory/${item.id}`} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
                                                <ArrowRight size={18} />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <Box className="mx-auto text-slate-600 mb-2" size={32} />
                                    <p className="text-slate-500">No popular items yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity Log */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Clock className="text-blue-400" size={20} />
                                Recent Activity
                            </h2>
                            <Link href="/transactions" className="text-xs text-blue-400 hover:text-blue-300 font-medium">View All</Link>
                        </div>
                        <div className="divide-y divide-white/5">
                            {stats.recent_activity.length > 0 ? (
                                stats.recent_activity.map((log: any) => (
                                    <div key={log.id} className="p-4 hover:bg-white/5 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${log.action === "CREATE" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                                log.action === "REMOVE_STOCK" ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" :
                                                    log.action === "ADD_STOCK" ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" :
                                                        "bg-amber-500"
                                                }`} />
                                            <div>
                                                <p className="text-sm text-slate-300">
                                                    <span className="font-semibold text-white">{log.user_name}</span>
                                                    <span className="mx-1 text-slate-500">•</span>
                                                    {log.details}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-center py-8">No recent activity.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Sidebar Column (1/3) */}
                <div className="space-y-8">

                    {/* Low Stock */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <AlertTriangle className="text-rose-500" size={20} />
                                Low Stock
                            </h2>
                        </div>
                        <div className="p-4 space-y-3">
                            {stats.low_stock_items.length > 0 ? (
                                stats.low_stock_items.map((item: any) => (
                                    <Link key={item.id} href={`/inventory/${item.id}`}>
                                        <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 hover:border-rose-500/30 transition-all group">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-medium text-slate-200 group-hover:text-white transition-colors">{item.name}</p>
                                                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 text-xs font-bold rounded-full">
                                                    {item.stock} left
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-rose-500 h-full rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                                                    style={{ width: `${Math.min((item.stock / item.min_stock) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2">Min: {item.min_stock}</p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-6 text-slate-500 flex flex-col items-center">
                                    <Zap className="text-slate-700 mb-2" />
                                    <p>All stock levels healthy!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recently Added */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Package className="text-purple-500" size={20} />
                                Recently Added
                            </h2>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-3">
                            {stats.recent_items.map((item: any) => (
                                <Link key={item.id} href={`/inventory/${item.id}`} className="group">
                                    <div className="aspect-square bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden relative mb-2 group-hover:border-primary-500/50 transition-all">
                                        {item.image_url ? (
                                            <Image
                                                src={item.image_url.startsWith("/media") ? `http://localhost:8000${item.image_url}` : item.image_url}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-700 group-hover:text-primary-500/50 transition-colors">
                                                <Package size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-slate-400 group-hover:text-white truncate text-center transition-colors">{item.name}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, color, bgClass, textClass }: any) {
    return (
        <div className="glass-card p-6 rounded-2xl hover:translate-y-[-2px] transition-transform duration-300">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${bgClass}`}>
                    <Icon className={textClass} size={24} />
                </div>
                <div>
                    <p className="text-slate-400 text-sm font-medium">{title}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                </div>
            </div>
        </div>
    );
}
