"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckSquare, Square, FileText, Tag } from "lucide-react";

interface Task {
    id: string;
    text: string;
    completed: boolean;
}

interface Resource {
    id: string;
    title: string;
    type: string;
    description: string;
    tasks?: Task[];
}

interface ResourceViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    resource: Resource | null;
    onToggleTask: (resourceId: string, taskId: string) => void;
    getTypeLabel: (type: string) => string;
}

export function ResourceViewModal({ isOpen, onClose, resource, onToggleTask, getTypeLabel }: ResourceViewModalProps) {
    if (!resource) return null;

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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900">
                            <h2 className="text-xl font-bold text-white truncate pr-4">
                                {resource.title}
                            </h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 custom-scrollbar">
                            <div className="space-y-6">
                                {/* Metadata */}
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm bg-zinc-900 px-3 py-1.5 rounded-lg border border-white/5">
                                        <Tag size={14} />
                                        <span>{getTypeLabel(resource.type)}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                {resource.description && (
                                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                                        <h3 className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                            <FileText size={12} />
                                            Descrição
                                        </h3>
                                        <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                                            {resource.description}
                                        </p>
                                    </div>
                                )}

                                {/* Tasks */}
                                {(resource.tasks && resource.tasks.length > 0) && (
                                    <div>
                                        <h3 className="text-sm font-bold text-zinc-400 mb-3">Tarefas & Itens</h3>
                                        <div className="space-y-2">
                                            {resource.tasks.map(task => (
                                                <button
                                                    key={task.id}
                                                    onClick={() => onToggleTask(resource.id, task.id)}
                                                    className="w-full text-left flex items-start gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors group"
                                                >
                                                    <div className={`mt-0.5 transition-colors ${task.completed ? "text-green-500" : "text-zinc-500 group-hover:text-zinc-400"}`}>
                                                        {task.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                                                    </div>
                                                    <span className={`text-sm leading-relaxed ${task.completed ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                                                        {task.text}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
