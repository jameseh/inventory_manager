"use client";

import { useState } from "react";
import { Plus, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { uploadImage } from "@/lib/api";

interface AttachmentsSectionProps {
    attachments: string[];
    onUpdate: (newAttachments: string[]) => void;
    isEditing: boolean;
}

export default function AttachmentsSection({ attachments = [], onUpdate, isEditing }: AttachmentsSectionProps) {
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (attachments.length >= 5) {
            alert("Maximum 5 attachments allowed");
            return;
        }

        setUploading(true);
        try {
            const result = await uploadImage(file);
            onUpdate([...attachments, result.url]);
        } catch (error: any) {
            console.error("Upload failed", error);
            const message = error.response?.data?.detail || "Failed to upload attachment";
            alert(message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (index: number) => {
        if (!confirm("Delete this attachment?")) return;
        const newAttachments = [...attachments];
        newAttachments.splice(index, 1);
        onUpdate(newAttachments);
    };

    const getImageUrl = (url: string) => {
        return url.startsWith("/media") ? `http://localhost:8000${url}` : url;
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <ImageIcon className="text-blue-400" size={20} />
                Attachments
                <span className="text-xs font-normal text-slate-500 ml-2">
                    ({attachments.length}/5)
                </span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {attachments.map((url, index) => (
                    <div key={index} className="group relative aspect-square bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                        <Image
                            src={getImageUrl(url)}
                            alt={`Attachment ${index + 1}`}
                            fill
                            className="object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedImage(getImageUrl(url))}
                            unoptimized
                        />
                        {isEditing && (
                            <button
                                onClick={() => handleDelete(index)}
                                className="absolute top-2 right-2 p-1.5 bg-rose-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                ))}

                {isEditing && attachments.length < 5 && (
                    <label className="relative aspect-square bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900 transition-all group">
                        {uploading ? (
                            <Loader2 className="animate-spin text-emerald-500" size={24} />
                        ) : (
                            <>
                                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center mb-2 group-hover:bg-emerald-500/10 transition-colors">
                                    <Plus size={16} className="text-slate-500 group-hover:text-emerald-500" />
                                </div>
                                <span className="text-xs text-slate-500 font-medium group-hover:text-slate-400">Add Image</span>
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                    </label>
                )}
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
                    >
                        <X size={32} />
                    </button>
                    <div className="relative w-full max-w-5xl h-full max-h-[90vh]">
                        <Image
                            src={selectedImage}
                            alt="Full size attachment"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
