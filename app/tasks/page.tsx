"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Plus, GripVertical, CheckCircle2, Circle, Eye, Edit, Trash2, Mountain, BookOpen, Folder, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskModal } from "@/components/tasks/TaskModal";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { PageBanner } from "@/components/ui/PageBanner";
import { useGamification } from "@/contexts/GamificationContext";
import { FOCO_POINTS } from "@/lib/gamification";

const TASK_COLUMNS = [
    { id: "todo", label: "A Fazer", color: "zinc" },
    { id: "doing", label: "Fazendo", color: "blue" },
    { id: "done", label: "Concluído", color: "emerald" },
];

export default function TasksPage() {
    // Global Data
    const {
        tasks: nativeTasks, addTask, updateTask, deleteTask,
        goals, subjects, resources,
        updateTaskStatus
    } = useGlobalData();

    const { awardFP } = useGamification();

    // Aggregating all tasks into a unified structure
    const aggregatedTasks = useMemo(() => {
        const all: any[] = [];

        // 1. Native Tasks
        nativeTasks.forEach(t => all.push({ ...t, source: 'native', displayId: t.id }));

        // 2. Goals Tasks
        goals.forEach(goal => {
            goal.tasks.forEach(t => {
                all.push({
                    id: t.id,
                    parentId: goal.id,
                    title: t.title,
                    source: 'goal',
                    displayId: `goal-${goal.id}-${t.id}`,
                    priority: 'medium', // Default for Goal tasks
                    column: t.completed ? 'done' : 'todo', // Map boolean to column
                    parentTitle: goal.title
                });
            });
        });

        // 3. Subjects Tasks
        subjects.forEach(subject => {
            subject.tasks.forEach(t => {
                all.push({
                    id: t.id,
                    parentId: subject.id,
                    title: t.text,
                    source: 'subject',
                    displayId: `subject-${subject.id}-${t.id}`,
                    priority: 'medium',
                    column: t.completed ? 'done' : 'todo',
                    parentTitle: subject.title
                });
            });
        });

        // 4. Resources Tasks
        resources.forEach(resource => {
            resource.tasks.forEach(t => {
                all.push({
                    id: t.id,
                    parentId: resource.id,
                    title: t.text,
                    source: 'resource',
                    displayId: `resource-${resource.id}-${t.id}`,
                    priority: 'low',
                    column: t.completed ? 'done' : 'todo',
                    parentTitle: resource.title
                });
            });
        });

        return all;
    }, [nativeTasks, goals, subjects, resources]);

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
    const [showCompleted, setShowCompleted] = useState(false); // Default hidden as per request

    // Drag State
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    const handleSaveTask = async (taskData: any) => {
        try {
            if (modalMode === 'create') {
                // Remove client-side ID generation, let Supabase handle it
                await addTask({ ...taskData, column: 'todo' });
                awardFP(FOCO_POINTS.ADD_TASK, "Nova Tarefa Adicionada");
            } else {
                await updateTask(taskData);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save task:", error);
            alert("Erro ao salvar tarefa. Verifique sua conexão.");
        }
    };

    const handleDeleteNativeTask = (id: string) => {
        if (confirm("Excluir tarefa?")) {
            deleteTask(id);
        }
    };

    const handleToggleTask = (task: any) => {
        const nextStatus = task.column === 'done' ? 'todo' : 'done';
        updateTaskStatus(task.source, task.parentId, task.id, nextStatus);

        if (nextStatus === 'done') {
            awardFP(FOCO_POINTS.COMPLETE_TASK, "Tarefa Concluída");
        }
    };

    const openModal = (mode: "create" | "edit" | "view", task?: any) => {
        if (task && task.source !== 'native' && mode === 'edit') {
            alert("Esta tarefa deve ser editada no módulo de origem.");
            // Falback to view
            setModalMode('view');
            setSelectedTask(task);
            setIsModalOpen(true);
            return;
        }
        setModalMode(mode);
        setSelectedTask(task || null);
        setIsModalOpen(true);
    };

    const handleCardClick = (task: any) => {
        if (task.source === 'native') {
            openModal('edit', task);
        } else {
            openModal('view', task);
        }
    };

    // --- Drag and Drop Handlers ---

    const handleDragStart = (e: React.DragEvent, task: any) => {
        e.dataTransfer.setData("application/json", JSON.stringify(task));
        e.dataTransfer.effectAllowed = "move";
        setDraggedTaskId(task.displayId);
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setDraggedTaskId(null);
        setIsDragging(false);
        setDragOverColumn(null);
    };

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragOverColumn !== columnId) {
            setDragOverColumn(columnId);
        }
    };

    const handleDrop = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("application/json");
        if (!data) return;

        const task = JSON.parse(data);

        // Optimistic update prevention if same column
        if (task.column === columnId) return;

        updateTaskStatus(task.source, task.parentId, task.id, columnId);

        setDraggedTaskId(null);
        setIsDragging(false);
        setDragOverColumn(null);
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'goal': return <Mountain size={12} className="text-indigo-400" />;
            case 'subject': return <BookOpen size={12} className="text-purple-400" />;
            case 'resource': return <Folder size={12} className="text-emerald-400" />;
            default: return null;
        }
    };

    const getSourceLabel = (source: string) => {
        switch (source) {
            case 'goal': return "Meta";
            case 'subject': return "Estudo";
            case 'resource': return "Recurso";
            default: return "";
        }
    };

    return (
        <div className="h-full flex flex-col bg-background">
            <PageBanner
                title="Tarefas"
                subtitle="Gerencie suas prioridades e execute com clareza."
                gradientColor="zinc"
                icon={CheckSquare}
            />

            <div className="flex-1 flex flex-col p-4 md:p-8 space-y-6 overflow-hidden">
                <div className="flex items-center justify-end shrink-0">
                    <button
                        onClick={() => openModal('create')}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-zinc-200 transition-colors"
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline">Nova Tarefa</span>
                    </button>
                </div>

                {/* Kanban Board */}
                <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-6 h-full min-w-[300px] md:min-w-0">
                        {TASK_COLUMNS.map((col) => {
                            const tasksInColumn = aggregatedTasks.filter(t =>
                                t.column === col.id ||
                                (col.id === 'done' && t.column === 'done') ||
                                (col.id === 'todo' && t.column !== 'done' && t.column !== 'doing' && !t.column) // Fallback
                            ).filter(t => {
                                if (col.id === 'done' && !showCompleted) return false;
                                return true;
                            });

                            return (
                                <div
                                    key={col.id}
                                    className={cn(
                                        "flex-1 min-w-[280px] flex flex-col h-full rounded-2xl p-4 transition-colors border",
                                        dragOverColumn === col.id ? "bg-white/5 border-indigo-500/50" : "bg-transparent border-white/5"
                                    )}
                                    onDragOver={(e) => handleDragOver(e, col.id)}
                                    onDrop={(e) => handleDrop(e, col.id)}
                                >
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-2 h-2 rounded-full", col.id === 'done' ? "bg-emerald-500" : col.id === 'doing' ? "bg-blue-500" : "bg-zinc-500")} />
                                            <h3 className="font-bold text-zinc-300 text-sm">{col.label}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {col.id === 'done' && (
                                                <button
                                                    onClick={() => setShowCompleted(!showCompleted)}
                                                    className="p-1.5 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                                    title={showCompleted ? "Ocultar Concluídos" : "Mostrar Concluídos"}
                                                >
                                                    {showCompleted ? <Eye size={14} /> : <Eye className="text-zinc-700" size={14} />}
                                                </button>
                                            )}
                                            <span className="text-xs text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">
                                                {tasksInColumn.length}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 pb-10">
                                        {tasksInColumn.length === 0 && col.id === 'done' && !showCompleted && (
                                            <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-2 opacity-50">
                                                <CheckCircle2 size={32} />
                                                <p className="text-xs">Concluídos ocultos</p>
                                                <button
                                                    onClick={() => setShowCompleted(true)}
                                                    className="text-[10px] text-zinc-600 hover:text-indigo-400 underline"
                                                >
                                                    Mostrar
                                                </button>
                                            </div>
                                        )}

                                        {tasksInColumn.map((task) => (
                                            <div
                                                key={task.displayId}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, task)}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <Card
                                                    className={cn(
                                                        "p-4 bg-black/40 hover:bg-white/5 border-white/5 cursor-grab active:cursor-grabbing group transition-all relative border border-l-4",
                                                        task.column === 'done' ? "border-l-emerald-500/50 opacity-60" : "border-l-zinc-700 hover:border-l-indigo-500",
                                                        draggedTaskId === task.displayId && "opacity-50 ring-2 ring-indigo-500/50"
                                                    )}
                                                    onClick={() => handleCardClick(task)}
                                                >
                                                    {/* Source Tag */}
                                                    {task.source !== 'native' && (
                                                        <div className="flex items-center gap-1.5 mb-2">
                                                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                                                                {getSourceIcon(task.source)}
                                                                {getSourceLabel(task.source)}
                                                            </span>
                                                            <span className="text-[10px] text-zinc-600 truncate max-w-[150px]">
                                                                • {task.parentTitle}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="absolute top-2 right-2 flex gap-1 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-0.5 border border-white/5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="p-1.5 text-zinc-600 cursor-grab active:cursor-grabbing">
                                                            <GripVertical size={14} />
                                                        </div>
                                                        {task.source === 'native' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteNativeTask(task.id); }}
                                                                className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex items-start gap-3 mt-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleToggleTask(task); }}
                                                            className="text-zinc-700 hover:text-emerald-500 transition-colors shrink-0 pt-0.5"
                                                        >
                                                            {task.column === 'done' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} />}
                                                        </button>
                                                        <div className="flex-1">
                                                            <p className={`text-sm font-medium leading-snug ${task.column === 'done' ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                                                                {task.title}
                                                            </p>

                                                            {task.priority && (
                                                                <div className="mt-2 text-xs">
                                                                    {task.priority === 'high' && <span className="text-red-500 font-bold text-[10px] bg-red-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Alta</span>}
                                                                    {task.priority === 'medium' && <span className="text-amber-500 font-bold text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Média</span>}
                                                                    {task.priority === 'low' && <span className="text-blue-500 font-bold text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Baixa</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTask}
                initialData={selectedTask}
                // @ts-ignore
                mode={modalMode}
            />
        </div>
    );
}
