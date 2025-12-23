"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Plus } from "lucide-react";

interface CategoryInputProps {
    value: string;
    onChange: (value: string) => void;
    categories: string[];
    placeholder?: string;
}

export default function CategoryInput({ value, onChange, categories, placeholder = "Select or create..." }: CategoryInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync internal search state with external value prop
    useEffect(() => {
        setSearch(value);
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredCategories = categories.filter(c =>
        c.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (category: string) => {
        onChange(category);
        setSearch(category);
        setIsOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearch(newValue);
        onChange(newValue);
        setIsOpen(true);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative">
                <input
                    type="text"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white placeholder-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all backdrop-blur-sm"
                    placeholder={placeholder}
                    value={search}
                    onChange={handleChange}
                    onFocus={() => setIsOpen(true)}
                />
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fade-in custom-scrollbar">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                onClick={() => handleSelect(category)}
                                className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-between group"
                            >
                                {category}
                                {value === category && <Check size={14} className="text-primary-500" />}
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-slate-500 italic">
                            {search ? (
                                <span className="flex items-center gap-2">
                                    <Plus size={14} /> Create "{search}"
                                </span>
                            ) : "Start typing..."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
