"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/api";
import Image from "next/image";

interface ImageUploaderProps {
    onUploaded: (url: string) => void;
    initialUrl?: string;
}

export default function ImageUploader({ onUploaded, initialUrl }: ImageUploaderProps) {
    const getFullUrl = (url?: string) => {
        if (!url) return "";
        if (url.startsWith("/media")) {
            return `http://localhost:8000${url}`;
        }
        return url;
    };

    const [preview, setPreview] = useState<string>(getFullUrl(initialUrl));
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create local preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setLoading(true);

        try {
            const result = await uploadImage(file);
            onUploaded(result.url);
        } catch (error: any) {
            console.error("Upload failed", error);
            const message = error.response?.data?.detail || "Failed to upload image";
            alert(message);
            setPreview(""); // Reset on failure
        } finally {
            setLoading(false);
        }
    };

    const clearImage = () => {
        setPreview("");
        onUploaded("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400 mb-1">
                Component Image
            </label>

            {preview ? (
                <div className="relative w-full h-48 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group">
                    <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                    {loading && (
                        <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                            <Loader2 className="animate-spin text-emerald-500" size={32} />
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-slate-400 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group"
                >
                    <div className="w-10 h-10 bg-slate-900 group-hover:bg-emerald-500/10 rounded-full flex items-center justify-center mb-2 transition-colors">
                        <Upload size={20} className="text-slate-500 group-hover:text-emerald-500" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium group-hover:text-slate-400">
                        Click to upload image
                    </p>
                </div>
            )}

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}
