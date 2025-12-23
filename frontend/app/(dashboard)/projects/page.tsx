"use client";

import { useEffect, useState } from "react";
import { Project } from "@/lib/api";
import { getProjects } from "@/lib/api";
import Link from "next/link";
import { Plus, Folder, Calendar, ArrowRight } from "lucide-react";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const data = await getProjects();
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
                    <p className="text-slate-400">Manage your builds and track components.</p>
                </div>
                <Link
                    href="/projects/new"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-colors"
                >
                    <Plus size={20} />
                    New Project
                </Link>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 gap-4">
                    <Folder size={48} className="opacity-20" />
                    <p>No projects yet. Start building something!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${project.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" :
                                        project.status === "COMPLETED" ? "bg-blue-500/10 text-blue-500" :
                                            "bg-slate-800 text-slate-400"
                                    }`}>
                                    {project.status}
                                </div>
                                <div className="text-slate-500 group-hover:text-emerald-500 transition-colors">
                                    <ArrowRight size={20} />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                {project.title}
                            </h3>

                            <p className="text-slate-400 text-sm line-clamp-2 mb-6 h-10">
                                {project.description || "No description provided."}
                            </p>

                            <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800">
                                <span className="flex items-center gap-1.5">
                                    <Folder size={14} />
                                    {project.items.length} Items
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    {new Date(project.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
