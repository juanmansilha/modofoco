"use client";

import { useState } from "react";
import { Edit, Trash2, Key, FileText, Copy, Eye, EyeOff, Lightbulb, Maximize2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VaultItemProps {
    id: string;
    type: "idea" | "access" | "note";
    title: string;
    content?: string;
    username?: string;
    password?: string;
    url?: string;
    createdAt: Date;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onView?: (id: string) => void;
}

const getIcon = (type: string) => {
    switch (type) {
        case "idea": return Lightbulb;
        case "access": return Key;
        default: return FileText;
    }
};

const getColor = (type: string) => {
    switch (type) {
        case "idea": return "text-yellow-400 bg-yellow-400/10";
        case "access": return "text-blue-400 bg-blue-400/10";
        default: return "text-zinc-400 bg-zinc-800";
    }
};

export function VaultCard({ id, type, title, content, username, password, url, createdAt, onEdit, onDelete, onView }: VaultItemProps) {
    const Icon = getIcon(type);
    const colorClass = getColor(type);
    const [showPassword, setShowPassword] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Toast logic could go here
    };

    return (
        <div className="group relative bg-zinc-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all hover:bg-zinc-800/30">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon size={24} />
                </div>
                <div className="flex gap-2">
                    {onView && (
                        <button
                            onClick={() => onView(id)}
                            className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="Visualizar"
                        >
                            <Eye size={16} />
                        </button>
                    )}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(id)} className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <Edit size={16} />
                        </button>
                        <button onClick={() => onDelete(id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>

            {type === "access" && (
                <div className="space-y-3 mt-4">
                    {url && (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="block text-xs text-indigo-400 hover:underline truncate mb-2">
                            {url}
                        </a>
                    )}
                    <div className="bg-black/40 rounded-lg p-2 flex items-center justify-between border border-white/5">
                        <span className="text-xs text-zinc-400 truncate pr-2 select-all">{username}</span>
                        <button onClick={() => copyToClipboard(username || "")} className="text-zinc-500 hover:text-white" title="Copiar Usuário">
                            <Copy size={12} />
                        </button>
                    </div>
                    <div className="bg-black/40 rounded-lg p-2 flex items-center justify-between border border-white/5">
                        <span className="text-xs text-zinc-400 truncate pr-2 font-mono">
                            {showPassword ? password : "••••••••••••"}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => setShowPassword(!showPassword)} className="text-zinc-500 hover:text-white" title={showPassword ? "Ocultar" : "Mostrar"}>
                                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            <button onClick={() => copyToClipboard(password || "")} className="text-zinc-500 hover:text-white" title="Copiar Senha">
                                <Copy size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {(type === "idea" || type === "note") && content && (
                <p className="text-sm text-zinc-400 line-clamp-4 leading-relaxed">
                    {content}
                </p>
            )}

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-600">
                    {type === "access" ? "Acesso" : type === "idea" ? "Ideia" : "Nota"}
                </span>
                <span className="text-xs text-zinc-600">
                    {format(new Date(createdAt), "d MMM", { locale: ptBR })}
                </span>
            </div>
        </div>
    );
}
