"use client";

import { useEffect, useState } from "react";
import { X, Save, Plus, Trash2, CheckSquare, Square, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
    id: string;
    text: string;
    completed: boolean;
}

interface ResourceType {
    id: string;
    label: string;
    icon?: any;
    color?: string;
    isCustom?: boolean;
}

interface CreateResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (resource: { title: string; type: string; description: string; tasks: Task[] }) => void;
    initialData?: { title: string; type: string; description: string; tasks?: Task[] };
    isEditing?: boolean;
    availableTypes: ResourceType[];
    onAddType: (label: string) => void;
    onDeleteType: (id: string) => void;
}

export function CreateResourceModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    isEditing = false,
    availableTypes,
    onAddType,
    onDeleteType
}: CreateResourceModalProps) {
    const [title, setTitle] = useState("");
    const [type, setType] = useState("area");
    const [description, setDescription] = useState("");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskText, setNewTaskText] = useState("");

    // Type creation state
    const [isAddingType, setIsAddingType] = useState(false);
    const [newTypeLabel, setNewTypeLabel] = useState("");

    useEffect(() => {
        if (isOpen && initialData) {
            setTitle(initialData.title);
            setType(initialData.type);
            setDescription(initialData.description);
            setTasks(initialData.tasks || []);
        } else if (isOpen) {
            setTitle("");
            setType(availableTypes[0]?.id || "area");
            setDescription("");
            setTasks([]);
        }
    }, [isOpen, initialData, availableTypes]);

    const handleAddTask = () => {
        if (!newTaskText.trim()) return;
        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            text: newTaskText,
            completed: false
        };
        setTasks([...tasks, newTask]);
        setNewTaskText("");
    };

    const handleRemoveTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    const handleToggleTask = (taskId: string) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    };

    const handleCreateType = () => {
        if (!newTypeLabel.trim()) return;
        onAddType(newTypeLabel);
        setType(newTypeLabel.toLowerCase().replace(/\s+/g, '-')); // Auto select new type
        setNewTypeLabel("");
        setIsAddingType(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, type, description, tasks });
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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900">
                            <h2 className="text-xl font-bold text-white">
                                {isEditing ? "Editar Recurso" : "Novo Recurso"}
                            </h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 custom-scrollbar">
                            <form id="resource-form" onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-1">Nome</label>
                                        <input
                                            type="text"
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-zinc-600"
                                            placeholder="Ex: Lista de Mercado"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-medium text-zinc-400">Tipo</label>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingType(!isAddingType)}
                                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                            >
                                                <PlusCircle size={12} />
                                                Gerenciar
                                            </button>
                                        </div>

                                        {isAddingType && (
                                            <div className="flex gap-2 mb-2 p-2 bg-zinc-900 rounded-xl border border-white/5">
                                                <input
                                                    type="text"
                                                    value={newTypeLabel}
                                                    onChange={(e) => setNewTypeLabel(e.target.value)}
                                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-zinc-600"
                                                    placeholder="Novo tipo..."
                                                />
                                                <button type="button" onClick={handleCreateType} className="text-indigo-400 hover:text-white px-2 text-sm font-bold">Add</button>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-2">
                                            {availableTypes.map(t => (
                                                <div key={t.id} className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => setType(t.id)}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${type === t.id
                                                                ? "bg-zinc-800 border-white/20 text-white shadow-lg"
                                                                : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-white hover:bg-zinc-800"
                                                            }`}
                                                    >
                                                        <span className={`w-2 h-2 rounded-full ${t.color || "bg-zinc-500"}`} />
                                                        <span className="truncate">{t.label}</span>
                                                    </button>
                                                    {t.isCustom && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); onDeleteType(t.id); }}
                                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-1">Descrição</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-24 placeholder:text-zinc-600 custom-scrollbar"
                                            placeholder="Detalhes opcionais..."
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-white/5" />

                                {/* Tasks Section */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Tarefas / Itens</label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={newTaskText}
                                            onChange={(e) => setNewTaskText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
                                            className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            placeholder="Adicionar item..."
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddTask}
                                            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                                        {tasks.length === 0 && (
                                            <p className="text-zinc-600 text-xs italic text-center py-2">Nenhum item adicionado.</p>
                                        )}
                                        {tasks.map(task => (
                                            <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900 border border-white/5 group">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleTask(task.id)}
                                                    className={`transition-colors ${task.completed ? "text-green-500" : "text-zinc-600 hover:text-zinc-400"}`}
                                                >
                                                    {task.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                                                </button>
                                                <span className={`flex-1 text-sm ${task.completed ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                                                    {task.text}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTask(task.id)}
                                                    className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-zinc-900">
                            <button
                                type="submit"
                                form="resource-form"
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                <Save size={18} />
                                Salvar
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
