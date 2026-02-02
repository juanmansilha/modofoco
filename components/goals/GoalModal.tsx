"use client";

import { useState, useEffect } from "react";
import { X, Save, Image as ImageIcon, Plus, Trash2, CheckSquare, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
    id: string;
    title: string;
    completed: boolean;
}

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: any) => void;
    initialData?: any;
}

export function GoalModal({ isOpen, onClose, onSave, initialData }: GoalModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [status, setStatus] = useState("not_started");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    useEffect(() => {
        if (isOpen && initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description);
            setTargetDate(initialData.targetDate ? new Date(initialData.targetDate).toISOString().split('T')[0] : "");
            setImageUrl(initialData.imageUrl);
            setStatus(initialData.status);
            setTasks(initialData.tasks || []);
        } else if (isOpen) {
            setTitle("");
            setDescription("");
            setTargetDate("");
            setImageUrl("");
            setStatus("not_started");
            setTasks([]);
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title,
            description,
            targetDate, // Pass as string (YYYY-MM-DD)
            imageUrl,
            status,
            tasks
        });
        onClose();
    };

    const addTask = () => {
        if (!newTaskTitle.trim()) return;
        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            title: newTaskTitle,
            completed: false
        };
        setTasks([...tasks, newTask]);
        setNewTaskTitle("");
    };

    const toggleTask = (taskId: string) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    };

    const removeTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    // Auto-calculate progress for display
    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h2 className="text-xl font-bold text-white">
                                {initialData ? "Editar Meta" : "Nova Meta"}
                            </h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 custom-scrollbar">
                            <form id="goal-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column: Details */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-1">Título</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                placeholder="Ex: Viajar para o Japão"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-1">Data Alvo</label>
                                            <input
                                                type="date"
                                                value={targetDate}
                                                onChange={(e) => setTargetDate(e.target.value)}
                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-1">Status</label>
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            >
                                                <option value="not_started">A Fazer</option>
                                                <option value="in_progress">Em Progresso</option>
                                                <option value="completed">Concluída</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm text-zinc-400">Imagem de Capa</label>
                                            <div
                                                className="relative h-32 w-full rounded-xl bg-zinc-900 border border-white/10 overflow-hidden cursor-pointer group hover:border-indigo-500/50 transition-colors"
                                                onClick={() => document.getElementById("hidden-file-input")?.click()}
                                            >
                                                {imageUrl ? (
                                                    <div className="relative h-full w-full">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-xs text-white">Trocar imagem</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full w-full flex flex-col items-center justify-center text-zinc-600 group-hover:text-zinc-400">
                                                        <ImageIcon size={24} className="mb-2 opacity-50" />
                                                        <span className="text-xs">Clique para fazer upload</span>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                id="hidden-file-input"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 3 * 1024 * 1024) {
                                                            alert("A imagem deve ser menor que 3MB.");
                                                            return;
                                                        }
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setImageUrl(reader.result as string);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            {imageUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => setImageUrl("")}
                                                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-1"
                                                >
                                                    <Trash2 size={12} /> Remover imagem
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column: Tasks & Description */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-1">Descrição</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-24 text-sm"
                                                placeholder="Detalhes..."
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm text-zinc-400">Tarefas Vinculadas</label>
                                                <span className="text-xs font-bold text-indigo-400">
                                                    {completedCount}/{tasks.length} ({progress}%)
                                                </span>
                                            </div>

                                            <div className="flex gap-2 mb-3">
                                                <input
                                                    type="text"
                                                    value={newTaskTitle}
                                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTask())}
                                                    className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                    placeholder="Adicionar tarefa..."
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addTask}
                                                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>

                                            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                                                {tasks.length === 0 && (
                                                    <div className="text-center py-4 text-zinc-600 text-xs italic">
                                                        Nenhuma tarefa vinculada.
                                                    </div>
                                                )}
                                                {tasks.map(task => (
                                                    <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900 transition-colors group">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleTask(task.id)}
                                                            className={`text-zinc-500 hover:text-indigo-400 transition-colors ${task.completed ? "text-indigo-500" : ""}`}
                                                        >
                                                            {task.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                                                        </button>
                                                        <span className={`flex-1 text-sm ${task.completed ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                                                            {task.title}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTask(task.id)}
                                                            className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-zinc-900">
                            <button
                                type="submit"
                                form="goal-form"
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                <Save size={18} />
                                Salvar Meta
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
