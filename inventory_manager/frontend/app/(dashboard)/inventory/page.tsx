"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Item } from "@/lib/types";
import { Search, Filter, Plus, Minus, Trash2, MapPin, Zap, Package, Tag, ArrowRight, ArrowDownAZ, ArrowUpAZ, Calendar, Layers, Hash } from "lucide-react";
import api, { getItems, getCategories } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

type SortField = 'name' | 'stock' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function InventoryPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [showFilters, setShowFilters] = useState(false);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize search from URL
    const initialSearch = searchParams.get("q") || "";
    const [search, setSearch] = useState(initialSearch);
    const debouncedSearch = useDebounce(search, 300);

    const fetchItems = useCallback(async (query: string = "") => {
        setLoading(true);
        try {
            const data = await getItems(query);
            setItems(data);
        } catch (error) {
            console.error("Failed to fetch items", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect to handle search changes
    useEffect(() => {
        fetchItems(debouncedSearch);
        // Update URL to match search
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("q", debouncedSearch);
        else params.delete("q");
        router.replace(`/inventory?${params.toString()}`, { scroll: false });
    }, [debouncedSearch, fetchItems, router]);

    // Fetch categories on mount
    useEffect(() => {
        getCategories().then(cats => {
            setCategories(cats.sort());
        }).catch(console.error);
    }, []);

    const filteredAndSortedItems = useMemo(() => {
        let result = items;

        // Filter by Category
        if (selectedCategory !== "All") {
            result = result.filter(item => item.category === selectedCategory);
        }

        // Sort
        return [...result].sort((a, b) => {
            let valA: any = a[sortField];
            let valB: any = b[sortField];

            // Handle string comparisons case-insensitively
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [items, selectedCategory, sortField, sortOrder]);

    const handleUpdateQuantity = async (id: number, delta: number) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const newStock = Math.max(0, item.stock + delta);
        const endpoint = delta > 0 ? `/items/${id}/add/${delta}` : `/items/${id}/remove/${Math.abs(delta)}`;

        try {
            await api.post(endpoint);
            // Optimistic update
            setItems(prev => prev.map(i =>
                i.id === id ? { ...i, stock: newStock } : i
            ));
        } catch (error) {
            console.error("Failed to update quantity", error);
            // Revert on failure
            fetchItems(debouncedSearch);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        try {
            await api.delete(`/items/${id}`);
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            console.error("Failed to delete item", error);
        }
    };

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col pt-2 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-white text-glow">Inventory</h2>
                    <p className="text-slate-400 text-sm">Manage your components and stock.</p>
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, stock..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all backdrop-blur-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2.5 rounded-xl border transition-all ${showFilters ? 'bg-primary-500/20 border-primary-500 text-primary-500' : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'}`}
                        title="Filters & Sorting"
                    >
                        <Filter size={20} />
                    </button>
                    <Link href="/inventory/new">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-all shadow-[0_0_15px_-3px_rgba(0,229,255,0.4)] hover:shadow-[0_0_20px_-3px_rgba(0,229,255,0.6)]">
                            <Plus size={18} />
                            <span className="hidden md:inline">Add Item</span>
                        </button>
                    </Link>
                </div>
            </div>

            {showFilters && (
                <div className="flex flex-col gap-4 p-4 glass-panel rounded-2xl animate-fade-in shrink-0">
                    {/* Categories */}
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Categories</h4>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory("All")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategory === "All" ? 'bg-primary-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategory === cat ? 'bg-primary-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-white/5"></div>

                    {/* Sorting */}
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sort By</h4>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => toggleSort('name')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sortField === 'name' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                <ArrowDownAZ size={14} /> Name
                                {sortField === 'name' && (sortOrder === 'asc' ? <ArrowUpAZ size={12} className="ml-1" /> : <ArrowDownAZ size={12} className="ml-1" />)}
                            </button>
                            <button
                                onClick={() => toggleSort('stock')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sortField === 'stock' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                <Hash size={14} /> Stock
                                {sortField === 'stock' && (sortOrder === 'asc' ? " ↑" : " ↓")}
                            </button>
                            <button
                                onClick={() => toggleSort('created_at')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sortField === 'created_at' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                <Calendar size={14} /> Date
                                {sortField === 'created_at' && (sortOrder === 'asc' ? " ↑" : " ↓")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto pr-1 pb-10">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500"></div>
                    </div>
                ) : filteredAndSortedItems.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-4 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                        <Zap size={48} className="text-slate-700" />
                        <p>No components found matching your search.</p>
                        <button
                            onClick={() => router.push('/inventory/new')}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-colors"
                        >
                            Add New Item
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredAndSortedItems.map(item => (
                            <InventoryCard
                                key={item.id}
                                item={item}
                                onUpdateQuantity={handleUpdateQuantity}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

interface InventoryCardProps {
    item: Item;
    onUpdateQuantity: (id: number, delta: number) => void;
    onDelete: (id: number) => void;
}


const InventoryCard: React.FC<InventoryCardProps> = ({ item, onUpdateQuantity, onDelete }) => {
    const isLowStock = item.stock <= item.min_stock;

    const imageUrl = item.image_url?.startsWith("/media")
        ? `http://localhost:8000${item.image_url}`
        : item.image_url;

    return (
        <div className={`relative glass-card rounded-2xl p-5 border transition-all group hover:-translate-y-1 duration-300 ${isLowStock ? 'border-rose-500/30 shadow-[0_0_15px_-5px_rgba(244,63,94,0.2)]' : 'border-white/5 shadow-sm'}`}>
            <Link href={`/inventory/${item.id}`} className="block">
                <div className="flex justify-between items-start mb-4 cursor-pointer">
                    <div className="flex-1">
                        <div className="flex items-start gap-4">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-slate-900">
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-110 duration-500"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                                        <Package size={24} />
                                    </div>
                                )}
                            </div>

                            <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-800/80 text-slate-400 mb-2 border border-white/5">
                                    <Tag size={10} />
                                    {item.category}
                                </span>
                                <h3 className="font-semibold text-white text-lg leading-tight group-hover:text-primary-400 transition-colors">{item.name}</h3>
                                {item.manufacturer_part_number && (
                                    <p className="text-xs text-slate-400 font-mono mt-0.5">MPN: {item.manufacturer_part_number}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={`flex flex-col items-end ${isLowStock ? 'text-rose-500' : 'text-primary-500'}`}>
                        <span className="text-3xl font-bold font-mono tracking-tight">{item.stock}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">In Stock</span>
                    </div>
                </div>
            </Link>

            <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 bg-slate-900/30 p-2 rounded-lg border border-white/5">
                <MapPin size={12} className="text-slate-400" />
                <span>{item.location || 'No Location'}</span>
                {isLowStock && (
                    <span className="ml-auto text-rose-500 font-bold flex items-center gap-1 animate-pulse">
                        <Zap size={10} /> Low Stock
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center bg-slate-900/80 rounded-xl p-1 border border-white/10">
                    <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-rose-500/20 hover:text-rose-500 text-slate-400 transition-colors"
                    >
                        <Minus size={18} />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                    <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary-500/20 hover:text-primary-500 text-slate-400 transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="flex gap-2">
                    <Link href={`/inventory/${item.id}`}>
                        <button className="h-11 w-11 flex items-center justify-center rounded-xl border border-white/10 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="View Details">
                            <ArrowRight size={18} />
                        </button>
                    </Link>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="h-11 w-11 flex items-center justify-center rounded-xl border border-white/10 bg-slate-900/50 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete Item"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
