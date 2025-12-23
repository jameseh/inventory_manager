"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProject, addProjectItem, updateProjectStatus, Project, Item, getItems } from "@/lib/api";
import { ArrowLeft, Plus, Play, CheckCircle, Package, AlertTriangle, Search, X } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState<Item[]>([]);
    const [showAddItem, setShowAddItem] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    useEffect(() => {
        fetchProject();
        fetchInventory();
    }, [params.id]);

    const fetchProject = async () => {
        try {
            const data = await getProject(Number(params.id));
            setProject(data);
        } catch (error) {
            console.error("Failed to fetch project", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInventory = async () => {
        try {
            const data = await getItems();
            setInventory(data);
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        }
    };

    const handleAddItem = async () => {
        if (!selectedItem || !project) return;
        try {
            const updatedProject = await addProjectItem(project.id, {
                item_id: selectedItem.id,
                quantity: quantity
            });
            setProject(updatedProject);
            setShowAddItem(false);
            setSelectedItem(null);
            setQuantity(1);
            setSearch("");
        } catch (error) {
            console.error("Failed to add item", error);
            alert("Failed to add item");
        }
    };

    const handleStatusChange = async (status: string, returnItems: boolean = false) => {
        if (!project) return;
        try {
            const updatedProject = await updateProjectStatus(project.id, status, returnItems);
            setProject(updatedProject);
            setShowCompleteModal(false);
        } catch (error: any) {
            console.error("Failed to update status", error);
            alert(error.response?.data?.detail || "Failed to update status");
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.manufacturer_part_number?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
    );

    if (!project) return <div className="text-center text-red-400 mt-10">Project not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/projects"
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${project.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" :
                                    project.status === "COMPLETED" ? "bg-blue-500/10 text-blue-500" :
                                        "bg-slate-800 text-slate-400"
                                }`}>
                                {project.status}
                            </span>
                            <span className="text-slate-500 text-xs">
                                Created {new Date(project.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            {project.title}
                        </h1>
                    </div>
                </div>

                <div className="flex gap-2">
                    {project.status === "PLANNING" && (
                        <button
                            onClick={() => handleStatusChange("ACTIVE")}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-colors"
                        >
                            <Play size={18} />
                            Start Build
                        </button>
                    )}
                    {project.status === "ACTIVE" && (
                        <button
                            onClick={() => setShowCompleteModal(true)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 transition-colors"
                        >
                            <CheckCircle size={18} />
                            Complete Project
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details & Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                        <p className="text-slate-400 whitespace-pre-wrap">
                            {project.description || "No description provided."}
                        </p>
                    </div>

                    {/* Items List */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Package className="text-emerald-500" size={20} />
                                Components
                            </h3>
                            {project.status === "PLANNING" && (
                                <button
                                    onClick={() => setShowAddItem(true)}
                                    className="text-sm text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1"
                                >
                                    <Plus size={16} /> Add Item
                                </button>
                            )}
                        </div>

                        {project.items.length > 0 ? (
                            <div className="divide-y divide-slate-800">
                                {project.items.map((pItem) => {
                                    // Find item details in inventory (since backend might not populate full item details in list)
                                    // Actually backend schema ProjectItemResponse has item: Optional[ItemResponse]
                                    // So we should have it.
                                    const itemDetails = pItem.item;
                                    return (
                                        <div key={pItem.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                                                    {itemDetails?.image_url ? (
                                                        <img src={itemDetails.image_url.startsWith("/media") ? `http://localhost:8000${itemDetails.image_url}` : itemDetails.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        <Package size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{itemDetails?.name || "Unknown Item"}</p>
                                                    <p className="text-xs text-slate-500">
                                                        Stock: {itemDetails?.stock} | Loc: {itemDetails?.location || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-white">x{pItem.quantity}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">Qty</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-500">
                                <Package size={48} className="mx-auto mb-2 opacity-20" />
                                <p>No components added yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Status Info / Actions */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Project Status</h3>

                        <div className="space-y-4">
                            <div className={`p-4 rounded-xl border ${project.status === "PLANNING" ? "bg-emerald-500/10 border-emerald-500/50" : "bg-slate-950 border-slate-800 opacity-50"}`}>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${project.status === "PLANNING" ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-500"}`}>1</div>
                                    <p className="font-medium text-white">Planning</p>
                                </div>
                                <p className="text-xs text-slate-400 pl-9">Add components and define requirements.</p>
                            </div>

                            <div className={`p-4 rounded-xl border ${project.status === "ACTIVE" ? "bg-emerald-500/10 border-emerald-500/50" : "bg-slate-950 border-slate-800 opacity-50"}`}>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${project.status === "ACTIVE" ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-500"}`}>2</div>
                                    <p className="font-medium text-white">Active Build</p>
                                </div>
                                <p className="text-xs text-slate-400 pl-9">Components are deducted from inventory.</p>
                            </div>

                            <div className={`p-4 rounded-xl border ${project.status === "COMPLETED" ? "bg-blue-500/10 border-blue-500/50" : "bg-slate-950 border-slate-800 opacity-50"}`}>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${project.status === "COMPLETED" ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-500"}`}>3</div>
                                    <p className="font-medium text-white">Completed</p>
                                </div>
                                <p className="text-xs text-slate-400 pl-9">Project finished. Leftover items handled.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Item Modal */}
            {showAddItem && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Add Component</h3>
                            <button onClick={() => setShowAddItem(false)} className="text-slate-500 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {!selectedItem ? (
                                <>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search inventory..."
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 focus:outline-none"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {filteredInventory.slice(0, 10).map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => setSelectedItem(item)}
                                                className="w-full p-3 flex items-center gap-3 hover:bg-slate-800 rounded-xl transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 rounded bg-slate-950 flex items-center justify-center text-slate-500 border border-slate-800">
                                                    <Package size={16} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white text-sm">{item.name}</p>
                                                    <p className="text-xs text-slate-500">Stock: {item.stock}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-800">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{selectedItem.name}</p>
                                            <p className="text-sm text-slate-500">Available: {selectedItem.stock}</p>
                                        </div>
                                        <button onClick={() => setSelectedItem(null)} className="ml-auto text-slate-500 hover:text-white">Change</button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Quantity Needed</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={selectedItem.stock} // Optional constraint
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        />
                                    </div>

                                    <button
                                        onClick={handleAddItem}
                                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-colors"
                                    >
                                        Add to Project
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Project Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-800">
                            <h3 className="text-xl font-bold text-white">Complete Project</h3>
                            <p className="text-slate-400 text-sm mt-1">What should happen to the components?</p>
                        </div>
                        <div className="p-6 space-y-3">
                            <button
                                onClick={() => handleStatusChange("COMPLETED", false)}
                                className="w-full p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 rounded-xl text-left transition-all group"
                            >
                                <p className="font-bold text-white group-hover:text-emerald-400">Consume Components</p>
                                <p className="text-xs text-slate-500 mt-1">Items remain deducted from inventory. Use this if you built something permanent.</p>
                            </button>

                            <button
                                onClick={() => handleStatusChange("COMPLETED", true)}
                                className="w-full p-4 bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 rounded-xl text-left transition-all group"
                            >
                                <p className="font-bold text-white group-hover:text-blue-400">Return Components</p>
                                <p className="text-xs text-slate-500 mt-1">Items are added back to inventory. Use this for prototyping or temporary builds.</p>
                            </button>
                        </div>
                        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
                            <button
                                onClick={() => setShowCompleteModal(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
