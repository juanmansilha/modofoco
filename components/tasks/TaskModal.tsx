"use client";

import { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, CheckSquare, Square, Eye, Calendar, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Subtask {
    id: string;
    text: string;
    completed: boolean;
}

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    status: "todo" | "doing" | "done";
    subtasks?: Subtask[];
    dueDate?: string;
}

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (task: Task) => void; // Optional if view only
    initialData?: Partial<Task>;
    mode: "create" | "edit" | "view";
}

export function TaskModal({ isOpen, onClose, onSave, initialData, mode }: TaskModalProps) {
    const isReadOnly = mode === "view";

    // State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
    const [status, setStatus] = useState<"todo" | "doing" | "done">("todo");
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtaskText, setNewSubtaskText] = useState("");
    const [dueDate, setDueDate] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title || "");
                setDescription(initialData.description || "");
                setPriority(initialData.priority || "medium");
                setStatus(initialData.status || "todo");
                setSubtasks(initialData.subtasks || []);
                setDueDate(initialData.dueDate || "");
            } else {
                // Reset defaults
                setTitle("");
                setDescription("");
                setPriority("medium");
                setStatus("todo");
                setSubtasks([]);
                setDueDate("");
            }
        }
    }, [isOpen, initialData]);

    const handleAddSubtask = () => {
        if (!newSubtaskText.trim()) return;
        const newSub: Subtask = {
            id: Math.random().toString(36).substr(2, 9),
            text: newSubtaskText,
            completed: false
        };
        setSubtasks([...subtasks, newSub]);
        setNewSubtaskText("");
    };

    const handleToggleSubtask = (id: string) => {
        // Even in view mode, users might want to check off items? 
        // User request: "visualizar apenas com icon de olho... criar tarefas dentro...".
        // Usually view mode allows interaction with checklists.
        const updated = subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
        setSubtasks(updated);
        // If we want to persist this in view mode, we'd need an onUpdate callback separate from onSave,
        // or just rely on onSave being called for minor updates. 
        // For now, let's allow it in local state.
    };

    const handleDeleteSubtask = (id: string) => {
        if (isReadOnly) return;
        setSubtasks(subtasks.filter(s => s.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSave) {
            onSave({
                id: initialData?.id || Math.random().toString(36).substr(2, 9),
                title,
                description,
                priority,
                status,
                subtasks,
                dueDate
            });
        }
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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {mode === 'view' && <Eye size={20} className="text-indigo-400" />}
                                {mode === 'create' ? "Nova Tarefa" : mode === 'edit' ? "Editar Tarefa" : "Detalhes da Tarefa"}
                            </h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 custom-scrollbar">
                            <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Título</label>
                                    <input
                                        type="text"
                                        readOnly={isReadOnly}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className={`w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${isReadOnly ? "cursor-default" : ""}`}
                                        placeholder="O que precisa ser feito?"
                                        required
                                    />
                                </div>

                                {/* Meta: Priority, Date, Status */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-1">Prioridade</label>
                                        <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/5">
                                            {(['low', 'medium', 'high'] as const).map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    disabled={isReadOnly}
                                                    onClick={() => setPriority(p)}
                                                    className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-lg transition-colors ${priority === p
                                                            ? (p === 'high' ? "bg-red-500 text-white" : p === 'medium' ? "bg-yellow-500 text-black" : "bg-blue-500 text-white")
                                                            : "text-zinc-500 hover:text-white"
                                                        } ${isReadOnly ? "opacity-100 cursor-default" : ""}`}
                                                >
                                                    {p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-1">Data</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                            <input
                                                type="date"
                                                readOnly={isReadOnly}
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                className={`w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${isReadOnly ? "cursor-default" : ""}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Descrição</label>
                                    <textarea
                                        readOnly={isReadOnly}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className={`w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-24 custom-scrollbar ${isReadOnly ? "cursor-default" : ""}`}
                                        placeholder="Detalhes adicionais..."
                                    />
                                </div>

                                {/* Checklist / Subtasks */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-zinc-400">Checklist</label>
                                        <span className="text-xs text-zinc-500">
                                            {subtasks.filter(t => t.completed).length}/{subtasks.length}
                                        </span>
                                    </div>

                                    {!isReadOnly && (
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={newSubtaskText}
                                                onChange={(e) => setNewSubtaskText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                                                className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                placeholder="Adicionar sub-tarefa..."
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddSubtask}
                                                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                                        {subtasks.length === 0 && (
                                            <p className="text-zinc-600 text-xs italic text-center py-2">Nenhum item na lista.</p>
                                        )}
                                        {subtasks.map(sub => (
                                            <div key={sub.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900 border border-white/5 group hover:bg-zinc-800/50 transition-colors">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleSubtask(sub.id)}
                                                    className={`transition-colors ${sub.completed ? "text-green-500" : "text-zinc-600 hover:text-zinc-400"}`}
                                                >
                                                    {sub.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                                                </button>
                                                <span className={`flex-1 text-sm ${sub.completed ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                                                    {sub.text}
                                                </span>
                                                {!isReadOnly && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSubtask(sub.id)}
                                                        className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-zinc-900">
                            {mode === 'view' ? (
                                <button
                                    type="button"
                                    onClick={onClose} // Or switch to edit mode?
                                    className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-colors"
                                >
                                    Fechar
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    form="task-form"
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    <Save size={18} />
                                    Salvar
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
