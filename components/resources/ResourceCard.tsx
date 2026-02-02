"use client";

import { Edit, Trash2, Folder, Users, List, Box, Eye, CheckCircle2 } from "lucide-react";

interface ResourceCardProps {
    id: string;
    title: string;
    type: string;
    description?: string;
    tasks?: { completed: boolean }[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onView: (id: string) => void;
    getTypeLabel: (type: string) => string;
}

const TypeIcon = ({ type }: { type: string }) => {
    // We'll let the parent handle custom type icons logic effectively, 
    // but for now we fallback to Box for unknown types in this isolated component unless we pass Icon.
    // Simplifying for now:
    switch (type) {
        case "family": return <Users className="text-pink-500" size={24} />;
        case "list": return <List className="text-emerald-500" size={24} />;
        case "area": return <Folder className="text-blue-500" size={24} />;
        default: return <Box className="text-zinc-500" size={24} />;
    }
};

export function ResourceCard({ id, title, type, description, tasks = [], onEdit, onDelete, onView, getTypeLabel }: ResourceCardProps) {
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="group bg-zinc-900/50 border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all hover:bg-white/[0.02] flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                    <TypeIcon type={type} />
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onView(id)}
                        className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                        title="Visualizar"
                    >
                        <Eye size={18} />
                    </button>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onEdit(id)}
                            className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => onDelete(id)}
                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-auto">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 border border-white/5 px-2 py-0.5 rounded-full">
                        {getTypeLabel(type)}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {title}
                </h3>
                {description && (
                    <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
                        {description}
                    </p>
                )}
            </div>

            {totalTasks > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                        <span>{completedTasks}/{totalTasks} itens</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}
        </div>
    );
}
