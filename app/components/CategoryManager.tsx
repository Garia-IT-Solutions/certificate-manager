"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, Category } from "@/app/services/api";
import {
    X,
    Plus,
    Edit2,
    Trash2,
    Check,
    Stethoscope,
    Anchor,
    Plane,
    Wrench,
    FileText,
    Briefcase,
    Cpu,
    Globe,
    Award,
    BookOpen,
    Sparkles,
    LayoutGrid,
    RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ICONS: Record<string, any> = {
    "Stethoscope": Stethoscope,
    "Anchor": Anchor,
    "Plane": Plane,
    "Wrench": Wrench,
    "FileText": FileText,
    "Briefcase": Briefcase,
    "Cpu": Cpu,
    "Globe": Globe,
    "Award": Award,
    "BookOpen": BookOpen
};

const COLORS = [
    { id: "emerald", class: "bg-emerald-500", border: "border-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bgSoft: "bg-emerald-100 dark:bg-emerald-900/20" },
    { id: "orange", class: "bg-orange-500", border: "border-orange-500", text: "text-orange-600 dark:text-orange-400", bgSoft: "bg-orange-100 dark:bg-orange-900/20" },
    { id: "blue", class: "bg-blue-500", border: "border-blue-500", text: "text-blue-600 dark:text-blue-400", bgSoft: "bg-blue-100 dark:bg-blue-900/20" },
    { id: "purple", class: "bg-purple-500", border: "border-purple-500", text: "text-purple-600 dark:text-purple-400", bgSoft: "bg-purple-100 dark:bg-purple-900/20" },
    { id: "rose", class: "bg-rose-500", border: "border-rose-500", text: "text-rose-600 dark:text-rose-400", bgSoft: "bg-rose-100 dark:bg-rose-900/20" },
    { id: "amber", class: "bg-amber-500", border: "border-amber-500", text: "text-amber-600 dark:text-amber-400", bgSoft: "bg-amber-100 dark:bg-amber-900/20" },
    { id: "indigo", class: "bg-indigo-500", border: "border-indigo-500", text: "text-indigo-600 dark:text-indigo-400", bgSoft: "bg-indigo-100 dark:bg-indigo-900/20" },
    { id: "zinc", class: "bg-zinc-500", border: "border-zinc-500", text: "text-zinc-600 dark:text-zinc-400", bgSoft: "bg-zinc-100 dark:bg-zinc-900/20" },
];

interface CategoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onCategoriesChange: () => void;
    scope?: string;
}

export function CategoryManager({ isOpen, onClose, onCategoriesChange, scope = "document" }: CategoryManagerProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const [label, setLabel] = useState("");
    const [color, setColor] = useState("zinc");
    const [icon, setIcon] = useState("FileText");

    useEffect(() => {
        if (isOpen) fetchCategories();
    }, [isOpen, scope]);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const data = await api.getCategories(scope);
            setCategories(data);
        } catch (e) {
            toast.error("Failed to load categories");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setLabel("");
        setColor("zinc");
        setIcon("FileText");
        setEditingId(null);
    };

    const handleEdit = (cat: Category) => {
        setEditingId(cat.id);
        setLabel(cat.label);
        setColor(cat.color);
        setIcon(cat.icon);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!label.trim()) return toast.error("Label is required");

        try {
            if (editingId) {
                await api.updateCategory(editingId, { label, color, icon });
                toast.success("Category updated");
            } else {
                await api.createCategory({ label, color, icon, scope });
                toast.success("Category created");
            }
            fetchCategories();
            onCategoriesChange();
            resetForm();
        } catch (e) {
            toast.error("Failed to save category");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        try {
            await api.deleteCategory(id);
            toast.success("Category deleted");
            fetchCategories();
            onCategoriesChange();
            if (editingId === id) resetForm();
        } catch (e) {
            toast.error("Failed to delete category");
        }
    };

    // Preview Helpers
    const PreviewIcon = ICONS[icon] || FileText;
    const previewTheme = COLORS.find(c => c.id === color) || COLORS[7];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col h-[85vh] md:h-[700px]"
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-white dark:bg-zinc-950 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center">
                            <LayoutGrid size={20} className="text-zinc-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Category Manager</h3>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Customize Document Classifications</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"><X size={20} className="text-zinc-500" /></button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

                    {/* Left Panel: Category List */}
                    <div className="w-full md:w-1/3 border-r border-zinc-100 dark:border-zinc-900 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/20">
                        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-2">
                            <button
                                onClick={resetForm}
                                className={cn(
                                    "w-full p-3 rounded-xl flex items-center gap-3 transition-all border border-dashed hover:border-solid hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-orange-900/10 group",
                                    !editingId ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10" : "border-zinc-300 dark:border-zinc-700 text-zinc-400"
                                )}
                            >
                                <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-500">
                                    <Plus size={16} />
                                </div>
                                <span className={cn("text-xs font-bold uppercase", !editingId ? "text-orange-600 dark:text-orange-500" : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white")}>Create New</span>
                            </button>

                            {categories.map((cat) => {
                                const theme = COLORS.find(c => c.id === cat.color) || COLORS[7];
                                const IconComp = ICONS[cat.icon as keyof typeof ICONS] || FileText;
                                const isActive = editingId === cat.id;

                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleEdit(cat)}
                                        className={cn(
                                            "w-full p-3 rounded-xl flex items-center justify-between transition-all border text-left group",
                                            isActive
                                                ? "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 shadow-md scale-[1.02]"
                                                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-1.5 rounded-md", theme.bgSoft, theme.text)}>
                                                <IconComp size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className={cn("text-xs font-bold truncate", isActive ? "text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400")}>{cat.label}</p>
                                            </div>
                                        </div>
                                        {isActive && (
                                            <motion.div layoutId="active-dot" className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Panel: Editor & Preview */}
                    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-950 relative">
                        {/* Preview Section - Sticky on top of editor */}
                        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-900 flex justify-center py-8">
                            <div className="relative group cursor-default">
                                <div className={cn(
                                    "w-48 p-4 rounded-2xl flex flex-col items-center gap-3 transition-all duration-300 shadow-xl border",
                                    "bg-white dark:bg-zinc-900",
                                    previewTheme.border
                                )}>
                                    <div className={cn("p-3 rounded-xl transition-colors", previewTheme.bgSoft, previewTheme.text)}>
                                        <PreviewIcon size={24} />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{label || "Category Name"}</h3>
                                        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">0 Documents</p>
                                    </div>
                                    <div className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", previewTheme.bgSoft, previewTheme.text)}>
                                        Preview
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Editor Form */}
                        <div className="p-6 md:p-8 space-y-8 max-w-lg mx-auto w-full">
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-2">
                                    <Edit2 size={12} /> Label
                                </label>
                                <input
                                    type="text"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    placeholder="Enter category name..."
                                    className="w-full text-lg font-bold p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:font-normal"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-2">
                                    <Sparkles size={12} /> Color Theme
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => setColor(c.id)}
                                            className={cn(
                                                "h-12 rounded-xl flex items-center justify-center transition-all border-2",
                                                c.class,
                                                color === c.id
                                                    ? "scale-105 shadow-md border-white dark:border-zinc-950 ring-2 ring-zinc-200 dark:ring-zinc-700"
                                                    : "opacity-40 hover:opacity-100 hover:scale-105 border-transparent"
                                            )}
                                        >
                                            {color === c.id && <Check size={20} className="text-white drop-shadow-md" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-2">
                                    <LayoutGrid size={12} /> Icon
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {Object.entries(ICONS).map(([key, IconComponent]) => (
                                        <button
                                            key={key}
                                            onClick={() => setIcon(key)}
                                            className={cn(
                                                "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all border",
                                                icon === key
                                                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 scale-105 shadow-md"
                                                    : "bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-orange-500 hover:text-orange-500"
                                            )}
                                            title={key}
                                        >
                                            <IconComponent size={20} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 mt-auto border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50 sticky bottom-0">
                            {editingId ? (
                                <button
                                    onClick={() => handleDelete(editingId)}
                                    type="button"
                                    className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                    title="Delete Category"
                                >
                                    <Trash2 size={20} />
                                </button>
                            ) : <div />}

                            <div className="flex gap-3">
                                {editingId && (
                                    <button onClick={resetForm} className="px-6 py-3 rounded-xl font-bold text-xs uppercase text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                                        Cancel
                                    </button>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-xs uppercase shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {editingId ? "Save Changes" : "Create Category"}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </motion.div>
        </div>
    );
}
