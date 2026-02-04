"use client";

import { useState, useEffect } from "react";
import { X, Save, Book, GraduationCap, PlayCircle, Folder, Plus, Trash2, CheckCircle2, Circle, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
    id: string;
    text: string;
    completed: boolean;
}

interface SubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (subject: any) => void;
    initialData?: any;
}

export function SubjectModal({ isOpen, onClose, onSave, initialData }: SubjectModalProps) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("course");
    const [progress, setProgress] = useState(0);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskText, setNewTaskText] = useState("");
    const [dueDate, setDueDate] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setCategory(initialData.category);
                setProgress(initialData.progress);
                setTasks(initialData.tasks || []);
                // Ensure date is YYYY-MM-DD for input
                const dateStr = initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : "";
                setDueDate(dateStr);
            } else {
                setTitle("");
                setCategory("course");
                setProgress(0);
                setTasks([]);
                setDueDate("");
            }
        }
    }, [isOpen, initialData]);

    const calculateProgress = (currentTasks: Task[]) => {
        if (currentTasks.length === 0) return 0;
        const completed = currentTasks.filter(t => t.completed).length;
        return Math.round((completed / currentTasks.length) * 100);
    };

    const handleAddTask = () => {
        if (!newTaskText.trim()) return;
        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            text: newTaskText,
            completed: false
        };
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        setProgress(calculateProgress(updatedTasks)); // Auto update progress
        setNewTaskText("");
    };

    const handleRemoveTask = (taskId: string) => {
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        setTasks(updatedTasks);
        setProgress(calculateProgress(updatedTasks));
    };

    const handleToggleTask = (taskId: string) => {
        const updatedTasks = tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        setTasks(updatedTasks);
        setProgress(calculateProgress(updatedTasks));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title,
            category,
            progress,
            tasks,
            dueDate,
            totalHours: initialData?.totalHours || 0,
            lastStudied: initialData?.lastStudied
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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900 sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-white">
                                {initialData ? "Editar Tópico" : "Novo Tópico"}
                            </h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 custom-scrollbar">
                            <form id="subject-form" onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Título</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            placeholder="Ex: Curso de Next.js, Prova Cálculo..."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Categoria</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: "course", icon: PlayCircle, label: "Curso" },
                                                { id: "college", icon: GraduationCap, label: "Faculdade" },
                                                { id: "book", icon: Book, label: "Leitura" },
                                                { id: "other", icon: Folder, label: "Outro" },
                                            ].map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setCategory(cat.id)}
                                                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border transition-all ${category === cat.id
                                                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                                        : "bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-800"
                                                        }`}
                                                >
                                                    <cat.icon size={18} />
                                                    <span className="text-sm font-medium">{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Date Input */}
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Data / Prazo (Opcional)</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                            <input
                                                type="date"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 [color-scheme:dark]"
                                            />
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">Útil para datas de provas ou entregas.</p>
                                    </div>
                                </div>

                                <div className="h-px bg-white/5"></div>

                                {/* Tasks Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm text-zinc-400">Tarefas / Conteúdos</label>
                                        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                                            {progress}% Concluído
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newTaskText}
                                            onChange={(e) => setNewTaskText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
                                            className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            placeholder="Adicionar tarefa..."
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddTask}
                                            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                                        {tasks.length === 0 && (
                                            <div className="text-center py-6 border border-dashed border-white/5 rounded-xl bg-zinc-900/50">
                                                <p className="text-zinc-500 text-xs italic">Nenhuma tarefa adicionada.</p>
                                            </div>
                                        )}
                                        {tasks.map(task => (
                                            <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-white/5 group hover:border-white/10 transition-colors">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleTask(task.id)}
                                                    className={`transition-colors ${task.completed ? "text-green-500" : "text-zinc-600 hover:text-zinc-400"}`}
                                                >
                                                    {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                                </button>
                                                <span className={`flex-1 text-sm ${task.completed ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                                                    {task.text}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTask(task.id)}
                                                    className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-zinc-900 sticky bottom-0">
                            <button
                                type="submit"
                                form="subject-form"
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                <Save size={18} />
                                Salvar Alterações
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
