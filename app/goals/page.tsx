"use client";

import { useState } from "react";
import { Plus, Target, Mountain } from "lucide-react";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalModal } from "@/components/goals/GoalModal";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { PageBanner } from "@/components/ui/PageBanner";
import { useGamification } from "@/contexts/GamificationContext";
import { FOCO_POINTS } from "@/lib/gamification";

export default function GoalsPage() {
    // Global Data
    const { goals, addGoal, updateGoal, deleteGoal } = useGlobalData();
    const { awardFP } = useGamification();

    // UI State
    const [filter, setFilter] = useState("all"); // 'all', 'in_progress', 'completed'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<any>(null);

    const handleSave = async (goal: any) => {
        try {
            if (editingGoal) {
                await updateGoal({ ...goal, id: editingGoal.id });
                if (goal.status === "completed" && editingGoal.status !== "completed") {
                    awardFP(FOCO_POINTS.COMPLETE_GOAL, "Meta Concluída");
                }
            } else {
                await addGoal({ ...goal, id: Math.random().toString(36).substr(2, 9), tasks: goal.tasks || [] });
                awardFP(FOCO_POINTS.COMPLETE_TASK, "Nova Meta Definida!");
            }
            setIsModalOpen(false);
            setEditingGoal(null);
        } catch (error: any) {
            console.error('Error saving goal:', error);
            alert(`Erro ao salvar meta: ${error.message || "Tente novamente mais tarde."}`);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja desistir desta meta?")) {
            deleteGoal(id);
        }
    };

    const filteredGoals = goals.filter(g => {
        if (filter === "all") return true;
        return g.status === filter;
    });

    const calculateProgress = (tasks: any[]) => {
        if (!tasks || tasks.length === 0) return 0;
        const completed = tasks.filter((t: any) => t.completed).length;
        return Math.round((completed / tasks.length) * 100);
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-background">
            <PageBanner
                title="Minhas Metas"
                subtitle="Defina seus objetivos e acompanhe seu progresso rumo ao topo."
                gradientColor="indigo"
                icon={Mountain}
            />

            <main className="p-8 pb-32 max-w-7xl mx-auto space-y-8">
                <div className="flex justify-end">
                    <button
                        onClick={() => { setEditingGoal(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        <Plus size={20} />
                        Novo Meta
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {[
                        { id: "all", label: "Todas" },
                        { id: "in_progress", label: "Em Progresso" },
                        { id: "completed", label: "Concluídas" },
                        { id: "not_started", label: "A Fazer" },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === f.id
                                ? "bg-white text-black"
                                : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGoals.map((goal) => (
                        <GoalCard
                            key={goal.id}
                            {...goal}
                            // @ts-ignore
                            progress={calculateProgress(goal.tasks)}
                            onEdit={(id) => {
                                setEditingGoal(goals.find(g => g.id === id));
                                setIsModalOpen(true);
                            }}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>

                {filteredGoals.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <Target size={48} className="mb-4 text-zinc-500" />
                        <p className="text-lg font-medium text-white">Nenhuma meta encontrada</p>
                        <p className="text-zinc-500">Ajuste os filtros ou crie uma nova meta.</p>
                    </div>
                )}

                <GoalModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={editingGoal}
                />
            </main>
        </div>
    );
}
