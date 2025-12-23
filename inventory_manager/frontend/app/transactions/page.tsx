"use client";

import { useEffect, useState } from "react";
import { getTransactions } from "@/lib/api";
import { Transaction } from "@/lib/types";
import {
    Table,
    ArrowLeft,
    ArrowRight,
    Search,
    Filter,
    Clock,
    User,
    Package,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCw
} from "lucide-react";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const LIMIT = 20;

    useEffect(() => {
        console.log("TransactionsPage: Fetching transactions for page", page);
        fetchTransactions();
    }, [page]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const data = await getTransactions(page * LIMIT, LIMIT);
            setTransactions(data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 text-glow">Transaction History</h1>
                <p className="text-slate-400">Detailed log of all inventory movements.</p>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="min-w-full overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 border-b border-white/5 text-xs uppercase text-slate-400 font-semibold tracking-wider">
                            <tr>
                                <th className="p-4 pl-6">Type</th>
                                <th className="p-4">Item</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 pr-6">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4 pl-6"><div className="h-4 w-20 bg-slate-800 rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-32 bg-slate-800 rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-12 bg-slate-800 rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-slate-800 rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-32 bg-slate-800 rounded"></div></td>
                                        <td className="p-4 pr-6"><div className="h-4 w-48 bg-slate-800 rounded"></div></td>
                                    </tr>
                                ))
                            ) : transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${tx.transaction_type === "CREATE" ? "bg-emerald-500/10 text-emerald-500" :
                                                    tx.transaction_type === "REMOVE_STOCK" ? "bg-rose-500/10 text-rose-500" :
                                                        tx.transaction_type === "ADD_STOCK" ? "bg-blue-500/10 text-blue-500" :
                                                            "bg-amber-500/10 text-amber-500"
                                                    }`}>
                                                    {tx.transaction_type === "ADD_STOCK" ? <ArrowDownLeft size={16} /> :
                                                        tx.transaction_type === "REMOVE_STOCK" ? <ArrowUpRight size={16} /> :
                                                            <RefreshCw size={16} />}
                                                </div>
                                                <span className="text-sm font-medium text-slate-300">
                                                    {tx.transaction_type.replace("_", " ")}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-white font-medium">{tx.item_name || "Unknown Item"}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`font-mono font-bold ${tx.transaction_type === "REMOVE_STOCK" ? "text-rose-400" :
                                                tx.transaction_type === "ADD_STOCK" ? "text-blue-400" : "text-emerald-400"
                                                }`}>
                                                {tx.transaction_type === "REMOVE_STOCK" ? "-" : "+"}{tx.amount}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400 text-sm">
                                            {tx.user_name || "Unknown"}
                                        </td>
                                        <td className="p-4 text-slate-400 text-sm">
                                            <span suppressHydrationWarning>{new Date(tx.timestamp).toLocaleString()}</span>
                                        </td>
                                        <td className="p-4 pr-6 text-slate-500 text-sm max-w-xs truncate" title={tx.notes || ""}>
                                            {tx.notes || "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-white/5 flex items-center justify-between">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
                    >
                        <ArrowLeft size={16} /> Previous
                    </button>
                    <span className="text-slate-500 text-sm">Page {page + 1}</span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={transactions.length < LIMIT || loading}
                        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
                    >
                        Next <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
