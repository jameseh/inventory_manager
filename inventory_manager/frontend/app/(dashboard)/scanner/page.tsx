"use client";

import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Package, Plus, Minus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Item } from "@/lib/types";

export default function ScannerPage() {
    const router = useRouter();
    const [data, setData] = useState<string | null>(null);
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mode, setMode] = useState<"in" | "out">("out");
    const [quantity, setQuantity] = useState(1);
    const [processing, setProcessing] = useState(false);

    const handleScan = async (detectedCodes: any[]) => {
        if (detectedCodes && detectedCodes.length > 0) {
            const result = detectedCodes[0].rawValue;
            if (result && result !== data) {
                setData(result);
                // Extract ID from URL: http://localhost:3000/inventory/1 -> 1
                const match = result.match(/\/inventory\/(\d+)$/);
                if (match) {
                    fetchItem(match[1]);
                } else {
                    setError("Invalid QR Code format");
                }
            }
        }
    };

    const fetchItem = async (id: string) => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get(`/items/${id}`);
            setItem(response.data);
        } catch (err) {
            console.error(err);
            setError("Item not found");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!item) return;
        setProcessing(true);
        try {
            const endpoint = mode === "in" ? "add" : "remove";
            await api.post(`/items/${item.id}/${endpoint}/${quantity}`);
            alert(`Successfully ${mode === "in" ? "added" : "removed"} ${quantity} items.`);
            // Reset
            setItem(null);
            setData(null);
            setQuantity(1);
        } catch (err) {
            console.error(err);
            alert("Failed to update stock. Ensure you have permission.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Link
                    href="/inventory"
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-2xl font-bold text-white">Scanner</h1>
            </div>

            {!item ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4">
                    <div className="aspect-square bg-black rounded-xl overflow-hidden relative">
                        <Scanner
                            onScan={handleScan}
                            onError={(error: unknown) => console.log(error)}
                            constraints={{ facingMode: "environment" }}
                            styles={{
                                container: { width: "100%", height: "100%" },
                                video: { objectFit: "cover" }
                            }}
                        />
                        <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-xl pointer-events-none"></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-48 h-48 border-2 border-emerald-500 rounded-lg"></div>
                        </div>
                    </div>
                    <p className="text-center text-slate-400 mt-4 text-sm">
                        Point camera at an item QR code
                    </p>
                    {error && <p className="text-center text-red-400 mt-2 text-sm">{error}</p>}
                    {loading && <p className="text-center text-emerald-400 mt-2 text-sm">Fetching item...</p>}
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-800 rounded-xl">
                            <Package className="text-emerald-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{item.name}</h2>
                            <p className="text-slate-400 text-sm">Current Stock: {item.stock}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                        <button
                            onClick={() => setMode("out")}
                            className={`py-2 rounded-lg text-sm font-medium transition-all ${mode === "out"
                                ? "bg-rose-500/20 text-rose-400 shadow-sm"
                                : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            Scan Out (Withdraw)
                        </button>
                        <button
                            onClick={() => setMode("in")}
                            className={`py-2 rounded-lg text-sm font-medium transition-all ${mode === "in"
                                ? "bg-emerald-500/20 text-emerald-400 shadow-sm"
                                : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            Scan In (Deposit)
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                        >
                            <Minus size={20} />
                        </button>
                        <div className="flex-1 text-center">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Quantity</p>
                            <p className="text-3xl font-mono font-bold text-white">{quantity}</p>
                        </div>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => {
                                setItem(null);
                                setData(null);
                            }}
                            className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={processing}
                            className={`flex-1 py-3 rounded-xl font-bold text-slate-950 transition-colors flex items-center justify-center gap-2 ${mode === "in"
                                ? "bg-emerald-500 hover:bg-emerald-600"
                                : "bg-rose-500 hover:bg-rose-600"
                                }`}
                        >
                            {processing ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                "Confirm"
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
