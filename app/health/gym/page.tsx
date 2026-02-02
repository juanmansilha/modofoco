"use client";

import { useState } from "react";
import { Plus, Sparkles, Calendar as CalendarIcon, LayoutGrid } from "lucide-react";
import { format, isSameDay, getDay } from "date-fns";
import { Button } from "@/components/ui/Button";
import { HealthBanner } from "@/components/health/HealthBanner";
import { WorkoutWizard } from "@/components/health/WorkoutWizard";
import { WorkoutRoutine, Routine } from "@/components/health/WorkoutRoutine";
import { WeeklyCalendar } from "@/components/health/WeeklyCalendar";
import { GymRoutineModal } from "@/components/health/GymRoutineModal";
import { useNotifications } from "@/contexts/NotificationContext";
import { useGamification } from "@/contexts/GamificationContext";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { FOCO_POINTS } from "@/lib/gamification";

// Helper to get day key (mon, tue, etc)
const getDayKey = (date: Date) => {
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return days[getDay(date)];
};

export default function GymPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState<any | null>(null);

    // Global Data
    const {
        gymRoutines,
        addGymRoutine,
        updateGymRoutine,
        deleteGymRoutine,
        toggleGymCompletion
    } = useGlobalData();

    const { addNotification } = useNotifications();
    const { awardFP } = useGamification();

    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    const selectedDayKey = getDayKey(selectedDate);

    // Filter Logic: Match exact date OR recurrence day
    const dailyRoutines = gymRoutines.filter(r => {
        if (r.date === selectedDateStr && (!r.recurrence || r.recurrence.length === 0)) return true; // One-off
        if (r.recurrence && r.recurrence.includes(selectedDayKey)) return true; // Recurring
        return false;
    }).sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));

    // Calculate dots for calendar (Currently supports explicit dates + Hack for recurrence)
    const calendarDots = gymRoutines.reduce((acc, curr) => {
        if (curr.date) {
            // Prioritize 'completed' status
            if (curr.completed) {
                acc[curr.date] = 'completed';
            } else if (!acc[curr.date]) {
                acc[curr.date] = 'planned';
            }
        }
        return acc;
    }, {} as Record<string, string>);

    const handleGenerate = (newRoutines: Routine[]) => {
        // Adapt generated routines to current date
        const datedRoutines = newRoutines.map(r => ({ ...r, date: selectedDateStr, time: "07:00", completed: false } as any));
        datedRoutines.forEach(r => addGymRoutine(r));
        addNotification("Treino Gerado!", "Seu novo plano de treinos foi criado com IA para hoje.");
        awardFP(FOCO_POINTS.GENERATE_AI_WORKOUT, "Treino Gerado com IA");
    };

    const handleAddRoutine = () => {
        setEditingRoutine(null);
        setIsRoutineModalOpen(true);
    };

    const handleEditRoutine = (routine: any) => {
        setEditingRoutine(routine);
        setIsRoutineModalOpen(true);
    };

    const handleSaveRoutine = (routineData: any) => {
        if (editingRoutine) {
            // Edit existing
            updateGymRoutine({ ...editingRoutine, ...routineData });
            addNotification("Treino Atualizado", "As alterações foram salvas com sucesso.");
        } else {
            // Create new
            const newRoutine = {
                id: `routine-${Date.now()}`,
                ...routineData,
                // Ensure date is set if no recurrence, or fallback
                date: routineData.recurrence.length > 0 ? "" : (routineData.date || selectedDateStr),
                completed: false
            };
            addGymRoutine(newRoutine);
            addNotification("Treino Criado", routineData.recurrence.length > 0 ? "Treino recorrente configurado!" : "Treino agendado para hoje.");
            // Removed points for manual creation
        }
        setIsRoutineModalOpen(false);
    };

    const handleDeleteRoutine = (id: string) => {
        if (confirm("Tem certeza que deseja remover este treino?")) {
            deleteGymRoutine(id);
        }
    };

    const handleCompleteRoutine = (id: string) => {
        const r = gymRoutines.find(r => r.id === id);
        if (r) {
            if (r.completed) return; // Prevent double click / points
            toggleGymCompletion(id, selectedDateStr); // Pass selected date if we want deeper tracking later
            addNotification("Treino Concluído! 💪", "Parabéns! Você finalizou seu treino de hoje.");
            awardFP(FOCO_POINTS.COMPLETE_WORKOUT, "Treino Concluído");
        }
    };

    const handleAddExercise = (routineId: string) => {
        // We probably want to open the modal for this now, but for quick add:
        const routineToEdit = gymRoutines.find(r => r.id === routineId);
        if (routineToEdit) {
            handleEditRoutine(routineToEdit);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <HealthBanner
                title="Academia & Treinos"
                subtitle="Planeje e execute seus treinos diários."
                gradientColor="purple"
            />

            <WorkoutWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onGenerate={handleGenerate}
            />

            <GymRoutineModal
                isOpen={isRoutineModalOpen}
                onClose={() => setIsRoutineModalOpen(false)}
                onSave={handleSaveRoutine}
                initialData={editingRoutine}
                defaultDate={selectedDateStr}
            />

            {/* Weekly Calendar */}
            <div className="px-6">
                <WeeklyCalendar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    dots={calendarDots}
                />
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Treinos do Dia</h2>
                    <p className="text-zinc-500 text-sm">
                        {dailyRoutines.length} treinos planejados para {format(selectedDate, "dd/MM")}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => setIsWizardOpen(true)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-indigo-500/20 flex-1 sm:flex-none"
                    >
                        <Sparkles size={18} className="mr-2" />
                        IA Generator
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleAddRoutine}
                        className="flex-1 sm:flex-none"
                    >
                        <Plus size={18} className="mr-2" />
                        Adicionar
                    </Button>
                </div>
            </div>

            {/* Routines List */}
            <div className="px-6 space-y-6">
                {dailyRoutines.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
                            <CalendarIcon size={32} />
                        </div>
                        <p className="text-white font-medium mb-1">Dia de Descanso?</p>
                        <p className="text-zinc-500 text-sm mb-4">Nenhum treino planejado para este dia.</p>
                        <Button variant="outline" onClick={handleAddRoutine}>Adicionar Treino Manual</Button>
                    </div>
                ) : (
                    dailyRoutines.map((routine) => (
                        <div key={routine.id} className="relative group">
                            {/* Visual Indicator for Recurrence */}
                            {routine.recurrence && routine.recurrence.length > 0 && (
                                <div className="absolute -top-2 right-4 bg-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-t-lg z-10 uppercase tracking-wider">
                                    Recorrente
                                </div>
                            )}
                            <WorkoutRoutine
                                routine={routine}
                                onComplete={handleCompleteRoutine}
                                onDelete={handleDeleteRoutine}
                                onAddExercise={() => handleAddExercise(routine.id)}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
