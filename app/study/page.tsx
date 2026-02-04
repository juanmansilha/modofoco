"use client";

import { useState } from "react";
import { Plus, BookOpen, LayoutGrid, Calendar as CalendarIcon, Clock } from "lucide-react";
import { SubjectCard } from "@/components/study/SubjectCard";
import { SubjectModal } from "@/components/study/SubjectModal";
import { FocusTimer } from "@/components/study/FocusTimer";
import { StudyCalendar } from "@/components/study/StudyCalendar";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { PageBanner } from "@/components/ui/PageBanner";
import { useGamification } from "@/contexts/GamificationContext";
import { FOCO_POINTS } from "@/lib/gamification";

export default function StudyPage() {
    const { subjects, addSubject, updateSubject, deleteSubject, toggleExternalTask } = useGlobalData();
    const { awardFP } = useGamification();

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<any>(null);
    const [isTimerOpen, setIsTimerOpen] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");

    const totalHours = subjects.reduce((acc, sub) => acc + sub.totalHours, 0);

    const handleSave = async (subjectData: any) => {
        try {
            if (editingSubject) {
                await updateSubject({ ...subjectData, id: editingSubject.id });
            } else {
                // Let the backend generate the ID
                await addSubject(subjectData);
            }
            setIsModalOpen(false);
            setEditingSubject(null);
        } catch (error) {
            console.error("Failed to save subject:", error);
            alert("Erro ao salvar tópico. Tente novamente.");
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja excluir este tópico?")) {
            deleteSubject(id);
        }
    };

    const handleStartFocus = (id: string) => {
        setSelectedSubjectId(id);
        setIsTimerOpen(true);
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-background">
            <PageBanner
                title="Estudos & Foco"
                subtitle="Gerencie seu aprendizado e mantenha o foco total."
                gradientColor="purple"
                icon={BookOpen}
            />

            <main className="p-8 pb-32 max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex bg-zinc-900 border border-white/5 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode("calendar")}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <CalendarIcon size={20} />
                            </button>
                        </div>

                        <button
                            onClick={() => { setEditingSubject(null); setIsModalOpen(true); }}
                            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
                        >
                            <Plus size={20} />
                            Novo Tópico
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Total Estudado</p>
                            <p className="text-2xl font-bold text-white">{totalHours.toFixed(1)}h</p>
                        </div>
                    </div>
                </div>

                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {subjects.map(subject => (
                                <SubjectCard
                                    key={subject.id}
                                    {...subject}
                                    onEdit={() => {
                                        setEditingSubject(subject);
                                        setIsModalOpen(true);
                                    }}
                                    onDelete={() => handleDelete(subject.id)}
                                    onStartSession={() => handleStartFocus(subject.id)}
                                    onToggleTask={(taskId) => toggleExternalTask('subject', subject.id, taskId)}
                                />
                            ))}
                        </AnimatePresence>

                        {/* Add Button Card */}
                        <button
                            onClick={() => { setEditingSubject(null); setIsModalOpen(true); }}
                            className="group flex flex-col items-center justify-center gap-4 min-h-[280px] rounded-2xl border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
                        >
                            <div className="w-16 h-16 rounded-full bg-zinc-900 group-hover:bg-indigo-500/10 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 transition-colors">
                                <Plus size={32} />
                            </div>
                            <span className="text-zinc-500 font-medium group-hover:text-zinc-300">Adicionar Novo Tópico</span>
                        </button>
                    </div>
                ) : (
                    <StudyCalendar subjects={subjects} />
                )}

                <SubjectModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={editingSubject}
                />

                <FocusTimer
                    isOpen={isTimerOpen}
                    onClose={() => {
                        setIsTimerOpen(false);
                        setSelectedSubjectId(null);
                    }}
                    subjectName={subjects.find(s => s.id === selectedSubjectId)?.title}
                    onComplete={(duration) => {
                        console.log(`Focus session completed: ${duration} minutes`);
                        // Here we could update global stats via context
                        awardFP(FOCO_POINTS.COMPLETE_STUDY_SESSION, "Sessão de Estudo Concluída");
                        setIsTimerOpen(false);
                        setSelectedSubjectId(null);
                    }}
                />
            </main>
        </div>
    );
}
