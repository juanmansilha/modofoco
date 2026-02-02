"use client";

import { useState, useEffect } from "react";
import { X, Save, Key, Lightbulb, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VaultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: any) => void;
    initialData?: any;
    initialType?: "idea" | "access" | "note";
}

export function VaultModal({ isOpen, onClose, onSave, initialData, initialType = "idea" }: VaultModalProps) {
    const [type, setType] = useState<"idea" | "access" | "note">(initialType);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [url, setUrl] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setType(initialData.type);
                setTitle(initialData.title);
                setContent(initialData.content || "");
                setUsername(initialData.username || "");
                setPassword(initialData.password || "");
                setUrl(initialData.url || "");
            } else {
                setType(initialType);
                setTitle("");
                setContent("");
                setUsername("");
                setPassword("");
                setUrl("");
            }
        }
    }, [isOpen, initialData, initialType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            type,
            title,
            content,
            username,
            password,
            url,
            createdAt: initialData?.createdAt || new Date()
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h2 className="text-xl font-bold text-white">
                                {initialData ? "Editar Item" : "Novo Item"}
                            </h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Type Selection */}
                                <div className="grid grid-cols-3 gap-2 bg-zinc-900 p-1 rounded-xl border border-white/5 mb-4">
                                    {[
                                        { id: "idea", icon: Lightbulb, label: "Ideia" },
                                        { id: "access", icon: Key, label: "Acesso" },
                                        { id: "note", icon: FileText, label: "Nota" },
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setType(t.id as any)}
                                            className={`flex flex-col items-center justify-center py-2 rounded-lg text-xs font-medium transition-all ${type === t.id
                                                    ? "bg-zinc-800 text-white shadow-sm"
                                                    : "text-zinc-500 hover:text-zinc-300"
                                                }`}
                                        >
                                            <t.icon size={16} className="mb-1" />
                                            {t.label}
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Título</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder={type === "access" ? "Ex: Netflix" : "Ex: Nova ideia de app"}
                                        required
                                    />
                                </div>

                                {type === "access" && (
                                    <>
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-1">URL (Opcional)</label>
                                            <input
                                                type="url"
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-zinc-400 mb-1">Usuário / Email</label>
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-zinc-400 mb-1">Senha</label>
                                                <input
                                                    type="text"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {(type === "idea" || type === "note") && (
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Conteúdo</label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-32"
                                            placeholder="Escreva aqui..."
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors mt-4"
                                >
                                    <Save size={18} />
                                    Salvar
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
