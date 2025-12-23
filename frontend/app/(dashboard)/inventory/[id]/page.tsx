"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api, { getCategories } from "@/lib/api";
import { ArrowLeft, Minus, Plus, Trash2, Save, MapPin, Zap, Package, Tag } from "lucide-react";
import Link from "next/link";
import { Item } from "@/lib/types";
import ImageUploader from "@/components/ImageUploader";
import AttachmentsSection from "@/components/AttachmentsSection";
import Image from "next/image";

export default function ItemDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [item, setItem] = useState<Item | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stockChange, setStockChange] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Item | null>(null);

    useEffect(() => {
        fetchItem();
        getCategories().then(setCategories).catch(console.error);
    }, [params.id]);

    const fetchItem = async () => {
        try {
            const response = await api.get(`/items/${params.id}`);
            setItem(response.data);
            setEditForm(response.data);
        } catch (error) {
            console.error("Failed to fetch item", error);
            setError("Item not found");
        } finally {
            setLoading(false);
        }
    };

    // ... (existing code)


    const handleStockUpdate = async (type: "add" | "remove") => {
        if (!item) return;
        try {
            const response = await api.post(
                `/items/${item.id}/${type}/${stockChange}`
            );
            setItem(response.data);
            setEditForm(response.data);
        } catch (error) {
            console.error("Failed to update stock", error);
            alert("Failed to update stock. Ensure you have admin privileges.");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            await api.delete(`/items/${params.id}`);
            router.push("/inventory");
        } catch (error) {
            console.error("Failed to delete item", error);
            alert("Failed to delete item. Ensure you have admin privileges.");
        }
    };

    const handleSave = async () => {
        if (!editForm) return;
        try {
            const response = await api.put(`/items/${params.id}`, {
                name: editForm.name,
                manufacturer_part_number: editForm.manufacturer_part_number,
                category: editForm.category,
                description: editForm.description,
                image_url: editForm.image_url,
                location: editForm.location,
                min_stock: editForm.min_stock,
                stock: editForm.stock,
                attachments: editForm.attachments,
            });
            setItem(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update item", error);
            alert("Failed to update item. Ensure you have admin privileges.");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-500"></div>
        </div>
    );

    if (error || !item) return <div className="text-center text-red-400 mt-10">{error}</div>;

    const imageUrl = item.image_url?.startsWith("/media")
        ? `http://localhost:8000${item.image_url}`
        : item.image_url;

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/inventory"
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-xs font-bold uppercase tracking-wider">
                                {item.category}
                            </span>
                            {item.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} /> {item.location}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            {item.name}
                        </h1>
                    </div>
                </div>

                <div className="flex gap-2">
                    {!isEditing && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/20 transition-colors font-medium"
                            >
                                Edit Details
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-colors"
                                title="Delete Item"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Image & Stock */}
                <div className="space-y-6">
                    {/* Image Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 overflow-hidden">
                        {isEditing ? (
                            <div className="p-4">
                                <ImageUploader
                                    onUploaded={(url) => setEditForm({ ...editForm!, image_url: url })}
                                    initialUrl={editForm?.image_url}
                                />
                            </div>
                        ) : (
                            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950">
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                                        <Package size={48} className="opacity-20" />
                                        <span className="text-sm">No image available</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stock Control Card */}
                    {!isEditing && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Package className="text-emerald-500" size={20} />
                                Stock Level
                            </h3>

                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Current Quantity</p>
                                    <p className={`text-4xl font-bold font-mono ${item.stock <= item.min_stock ? "text-amber-500" : "text-white"}`}>
                                        {item.stock}
                                    </p>
                                </div>
                                {item.stock <= item.min_stock && (
                                    <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-bold flex items-center gap-1.5">
                                        <Zap size={14} /> Low Stock
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => handleStockUpdate("remove")}
                                    className="p-3 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                                >
                                    <Minus size={20} />
                                </button>
                                <div className="flex-1 border-x border-slate-800 px-2">
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full bg-transparent text-center text-white font-mono focus:outline-none"
                                        value={stockChange}
                                        onChange={(e) => setStockChange(Math.max(1, parseInt(e.target.value) || 1))}
                                    />
                                </div>
                                <button
                                    onClick={() => handleStockUpdate("add")}
                                    className="p-3 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Details & Edit Form */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 h-full">
                        {isEditing ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                                            value={editForm?.name || ""}
                                            onChange={(e) => setEditForm({ ...editForm!, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Manufacturer Part Number</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none font-mono"
                                            value={editForm?.manufacturer_part_number || ""}
                                            onChange={(e) => setEditForm({ ...editForm!, manufacturer_part_number: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                list="category-suggestions"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                                                value={editForm?.category || "Misc"}
                                                onChange={(e) => setEditForm({ ...editForm!, category: e.target.value })}
                                            />
                                            <datalist id="category-suggestions">
                                                {categories.map(c => <option key={c} value={c} />)}
                                            </datalist>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Location</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                                            value={editForm?.location || ""}
                                            onChange={(e) => setEditForm({ ...editForm!, location: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Stock</label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                                                value={editForm?.stock || 0}
                                                onChange={(e) => setEditForm({ ...editForm!, stock: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Min Stock</label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                                                value={editForm?.min_stock || 0}
                                                onChange={(e) => setEditForm({ ...editForm!, min_stock: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                    <textarea
                                        rows={6}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none resize-none"
                                        value={editForm?.description || ""}
                                        onChange={(e) => setEditForm({ ...editForm!, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <AttachmentsSection
                                        attachments={editForm?.attachments || []}
                                        onUpdate={(newAttachments) => setEditForm({ ...editForm!, attachments: newAttachments })}
                                        isEditing={true}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditForm(item);
                                        }}
                                        className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-6 py-3 bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-600 transition-colors font-bold flex items-center gap-2"
                                    >
                                        <Save size={18} />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Tag className="text-blue-400" size={20} />
                                        Details
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Category</p>
                                            <p className="font-medium text-slate-200">{item.category}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 col-span-2 md:col-span-1">
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Manufacturer Part Number</p>
                                            <p className="font-medium text-slate-200 font-mono break-all">{item.manufacturer_part_number || "N/A"}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Location</p>
                                            <p className="font-medium text-slate-200">{item.location || "Unassigned"}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Min Stock</p>
                                            <p className="font-medium text-slate-200">{item.min_stock}</p>
                                        </div>
                                    </div>
                                </div>

                                {item.qr_code_url && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-4">QR Code</h3>
                                        <div className="flex items-center gap-6 p-6 rounded-xl bg-slate-950 border border-slate-800">
                                            <div className="relative w-32 h-32 bg-white rounded-lg p-2">
                                                <Image
                                                    src={`http://localhost:8000${item.qr_code_url}`}
                                                    alt="Item QR Code"
                                                    fill
                                                    className="object-contain"
                                                    unoptimized
                                                />
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-sm mb-3">
                                                    Scan to quickly access this item.
                                                </p>
                                                <a
                                                    href={`http://localhost:8000${item.qr_code_url}`}
                                                    download={`qr-${item.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-sm font-medium"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Download QR Code
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
                                    <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 min-h-[150px]">
                                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {item.description || "No description provided."}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-800">
                                    <AttachmentsSection
                                        attachments={item.attachments || []}
                                        onUpdate={() => { }} // Read-only in view mode
                                        isEditing={false}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
