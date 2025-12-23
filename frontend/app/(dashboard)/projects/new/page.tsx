"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/api";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function CreateProjectPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const project = await createProject(formData);
            router.push(`/projects/${project.id}`);
        } catch (err: any) {
            console.error(err);
            setError("Failed to create project.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Link
                    href="/projects"
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">New Project</h1>
                    <p className="text-slate-400 mt-1">Start a new build</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-400 mb-1">
                            Project Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="e.g., Robot Arm v2"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-400 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            rows={4}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none resize-none"
                            placeholder="What are you building?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <Save size={20} />
                        {loading ? "Creating..." : "Create Project"}
                    </button>
                </form>
            </div>
        </div>
    );
}
