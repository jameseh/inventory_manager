"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Save, Sparkles, Tag } from "lucide-react";
import Link from "next/link";
import AttachmentsSection from "@/components/AttachmentsSection";
import ImageUploader from "@/components/ImageUploader";
import { getCategories } from "@/lib/api";
import CategoryInput from "@/components/CategoryInput";

export default function CreateItemPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        category: "", // Empty to encourage typing or selecting
        description: "",
        stock: 0,
        min_stock: 5,
        location: "",
        image_url: "",
        manufacturer_part_number: "",
        attachments: [] as string[],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Default to "Misc" if empty
        const finalData = {
            ...formData,
            category: formData.category.trim() || "Misc"
        };

        try {
            await api.post("/items", finalData);
            router.push("/inventory");
        } catch (err: any) {
            console.error(err);
            setError("Failed to create item. Ensure you have admin privileges.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
            <div className="flex items-center gap-4">
                <Link
                    href="/inventory"
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white text-glow">Add Component</h1>
                    <p className="text-slate-400 text-sm">Create a new item in your inventory.</p>
                </div>
            </div>

            <div className="glass-card rounded-2xl p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                Component Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-medium backdrop-blur-sm"
                                placeholder="e.g., 10kΩ Resistor 1/4W"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="manufacturer_part_number" className="block text-sm font-medium text-slate-300 mb-2">
                                Manufacturer Part Number
                            </label>
                            <input
                                type="text"
                                name="manufacturer_part_number"
                                id="manufacturer_part_number"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-mono backdrop-blur-sm"
                                placeholder="e.g., NE555P"
                                value={formData.manufacturer_part_number || ""}
                                onChange={(e) => setFormData({ ...formData, manufacturer_part_number: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                                Category <span className="text-primary-400 text-xs ml-1">(Type or Select)</span>
                            </label>
                            <CategoryInput
                                value={formData.category}
                                onChange={(val) => setFormData({ ...formData, category: val })}
                                categories={categories}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-white/5 my-6"></div>

                    {/* Stock & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                id="location"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all backdrop-blur-sm"
                                placeholder="e.g., Box A1"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-slate-300 mb-2">
                                Initial Stock <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="stock"
                                id="stock"
                                min="0"
                                required
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all backdrop-blur-sm"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div>
                            <label htmlFor="min_stock" className="block text-sm font-medium text-slate-300 mb-2">
                                Min Stock Alert
                            </label>
                            <input
                                type="number"
                                name="min_stock"
                                id="min_stock"
                                min="0"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all backdrop-blur-sm"
                                value={formData.min_stock}
                                onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-white/5 my-6"></div>

                    {/* Details */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            rows={3}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all resize-none backdrop-blur-sm"
                            placeholder="Additional details, usage notes, etc..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Image</label>
                            <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/30">
                                <ImageUploader
                                    onUploaded={(url) => setFormData({ ...formData, image_url: url })}
                                    initialUrl={formData.image_url}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Attachments</label>
                            <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/30">
                                <AttachmentsSection
                                    attachments={formData.attachments}
                                    onUpdate={(newAttachments) => setFormData({ ...formData, attachments: newAttachments })}
                                    isEditing={true}
                                />
                            </div>
                        </div>
                    </div>

                    {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-2">
                        <Sparkles className="text-red-500" size={16} />
                        {error}
                    </div>}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_-5px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(0,229,255,0.5)] transform hover:-translate-y-0.5"
                        >
                            <Save size={20} />
                            {loading ? "Creating..." : "Save Component"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
