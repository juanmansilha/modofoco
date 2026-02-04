"use client";

import { Book, Clock, GraduationCap, MoreHorizontal, PlayCircle, Folder, CheckCircle2, Circle, Eye, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Task {
    id: string;
    text: string;
    completed: boolean;
}

interface SubjectCardProps {
    id: string;
    title: string;
    category: "college" | "course" | "book" | "other";
    progress: number;
    totalHours: number;
    lastStudied?: string;
    tasks?: Task[];
    dueDate?: string; // ISO date string
    onEdit: () => void;
    onDelete?: () => void;
    onStartSession?: () => void;
    onView?: () => void;
    onToggleTask?: (taskId: string) => void;
}

const categoryConfig = {
    college: { icon: GraduationCap, color: "text-blue-400", bg: "bg-blue-400/10", label: "Faculdade" },
    course: { icon: PlayCircle, color: "text-purple-400", bg: "bg-purple-400/10", label: "Curso" },
    book: { icon: Book, color: "text-amber-400", bg: "bg-amber-400/10", label: "Leitura" },
    other: { icon: Folder, color: "text-zinc-400", bg: "bg-zinc-400/10", label: "Outro" },
};

export function SubjectCard({
    id,
    title,
    category,
    progress,
    totalHours,
    lastStudied,
    tasks = [], // Default to empty array
    dueDate,
    onEdit,
    onDelete,
    onStartSession,
    onView,
    onToggleTask
}: SubjectCardProps) {
    const config = categoryConfig[category];
    const Icon = config.icon;

    // Get next uncompleted task
    const nextTask = tasks.find(t => !t.completed);
    const completedCount = tasks.filter(t => t.completed).length;

    // Progress is now strictly calculated if tasks exist, otherwise fallback to prop (legacy/manual)
    const displayProgress = tasks.length > 0
        ? Math.round((completedCount / tasks.length) * 100)
        : progress;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-zinc-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all hover:bg-zinc-900/80 hover:shadow-xl hover:shadow-black/20"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${config.bg} ${config.color}`}>
                    <Icon size={24} />
                </div>
                <div className="flex gap-1">
                    {onView && (
                        <button
                            onClick={onView}
                            className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="Visualizar"
                        >
                            <Eye size={20} />
                        </button>
                    )}
                    <button
                        onClick={onEdit}
                        className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider block ${config.color}`}>
                        {config.label}
                    </span>
                    {dueDate && (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            <Calendar size={10} />
                            <span>{format(new Date(dueDate), "d MMM", { locale: ptBR })}</span>
                        </div>
                    )}
                </div>
                <h3 className="text-lg font-bold text-white leading-tight mb-1 truncate" title={title}>
                    {title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock size={12} />
                    <span>{totalHours}h estudadas</span>
                    {lastStudied && (
                        <>
                            <span>•</span>
                            <span>Última vez: {lastStudied}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Tasks Preview */}
            {tasks.length > 0 && (
                <div className="mb-4 p-3 bg-black/20 rounded-xl border border-white/5 space-y-2">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Tarefas</p>
                    {tasks.slice(0, 3).map(task => ( // Show up to 3 tasks
                        <div
                            key={task.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleTask) onToggleTask(task.id);
                            }}
                            className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/5 p-1 rounded transition-colors"
                        >
                            {task.completed ? (
                                <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                            ) : (
                                <Circle size={14} className="text-zinc-500 shrink-0 group-hover/item:text-indigo-400" />
                            )}
                            <span className={`truncate ${task.completed ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                                {task.text}
                            </span>
                        </div>
                    ))}
                    {tasks.length > 3 && (
                        <p className="text-[10px] text-zinc-500 text-center pt-1">
                            + {tasks.length - 3} tarefas
                        </p>
                    )}
                </div>
            )}

            <div className="space-y-2">
                <div className="flex justify-between items-end text-xs">
                    <span className="text-zinc-400 font-medium">Progresso</span>
                    <span className="text-white font-bold">{displayProgress}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${displayProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${displayProgress === 100 ? "bg-green-500" : "bg-indigo-500"}`}
                    />
                </div>
            </div>

            {onStartSession && (
                <button
                    onClick={onStartSession}
                    className="w-full mt-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-sm font-medium transition-colors border border-white/5 hover:border-white/10"
                >
                    Iniciar Sessão
                </button>
            )}
        </motion.div>
    );
}
