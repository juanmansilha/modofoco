"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { HealthBanner } from "@/components/health/HealthBanner";
import { WeeklyCalendar } from "@/components/health/WeeklyCalendar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Utensils, Coffee, Moon, Sun, Trash2, PenSquare, Clock, Calendar as CalendarIcon } from "lucide-react";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { MealModal } from "@/components/health/MealModal";
import { useNotifications } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";
import { useGamification } from "@/contexts/GamificationContext";
import { FOCO_POINTS } from "@/lib/gamification";

export interface Meal {
    id: string;
    type: "breakfast" | "lunch" | "dinner" | "snack";
    name: string;
    time: string;
    date: string; // YYYY-MM-DD (initial date)
    recurrence?: string[]; // ['mon', 'wed']
}

const SECTIONS = [
    { id: "breakfast", label: "Café da Manhã", icon: Sun, color: "text-orange-400", bg: "bg-orange-400/10" },
    { id: "lunch", label: "Almoço", icon: Utensils, color: "text-blue-400", bg: "bg-blue-400/10" },
    { id: "snack", label: "Lanche", icon: Coffee, color: "text-purple-400", bg: "bg-purple-400/10" },
    { id: "dinner", label: "Jantar", icon: Moon, color: "text-indigo-400", bg: "bg-indigo-400/10" },
];

// Initial mockup data
export default function DietPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
    const [modalType, setModalType] = useState("breakfast");

    const { dietMeals, addMeal, updateMeal, deleteMeal } = useGlobalData();
    const { addNotification } = useNotifications();
    const { awardFP } = useGamification();

    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    const dayOfWeek = format(selectedDate, "EEE").toLowerCase(); // mon, tue...

    // Filter Logic: Show if exact date match OR if recurrence includes today's day
    const dailyMeals = dietMeals.filter(meal => {
        if (meal.date === selectedDateStr && (!meal.recurrence || meal.recurrence.length === 0)) return true; // One-off for today
        if (meal.recurrence && meal.recurrence.includes(dayOfWeek)) return true; // Recurring today
        return false;
    });

    const calendarDots = dietMeals.reduce((acc, curr) => {
        if (!curr.recurrence || curr.recurrence.length === 0) {
            acc[curr.date] = 'planned';
        }
        return acc;
    }, {} as Record<string, string>);

    const handleAddMeal = (type: string) => {
        setModalType(type);
        setEditingMeal(null);
        setIsModalOpen(true);
    };

    const handleEditMeal = (meal: Meal) => {
        setEditingMeal(meal);
        setModalType(meal.type);
        setIsModalOpen(true);
    };

    const handleDeleteMeal = (id: string) => {
        if (confirm("Remover esta refeição?")) {
            deleteMeal(id);
        }
    };

    const handleSaveMeal = (feed: Partial<Meal>) => {
        if (editingMeal) {
            // Edit
            updateMeal({ ...editingMeal, ...feed } as Meal);
            addNotification("Refeição Atualizada", "Alterações salvas.");
        } else {
            // Create
            const newMeal: Meal = {
                id: Math.random().toString(),
                type: feed.type as any,
                name: feed.name || "Refeição",
                time: feed.time || "12:00",
                date: selectedDateStr,
                recurrence: feed.recurrence
            };
            addMeal(newMeal);
            addNotification("Refeição Adicionada", "Novo plano alimentar registrado.");
            awardFP(FOCO_POINTS.ADD_MEAL, "Refeição Adicionada");
        }
        setIsModalOpen(false);
    };

    return (
        <div className="pb-20">
            <HealthBanner
                title="Alimentação"
                subtitle="Planejamento simples e eficiente."
                gradientColor="green"
            />

            <MealModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveMeal}
                initialData={editingMeal}
                defaultType={modalType}
                defaultDate={selectedDateStr}
            />

            <div className="p-8 space-y-8">

                <WeeklyCalendar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    dots={calendarDots}
                />

                <div className="space-y-6">
                    {SECTIONS.map((section) => {
                        const sectionMeals = dailyMeals.filter(m => m.type === section.id).sort((a, b) => a.time.localeCompare(b.time));
                        const Icon = section.icon;

                        return (
                            <div key={section.id}>
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-lg", section.bg, section.color)}>
                                            <Icon size={20} />
                                        </div>
                                        <h3 className="text-lg font-bold text-white">{section.label}</h3>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-zinc-500 hover:text-white"
                                        onClick={() => handleAddMeal(section.id)}
                                    >
                                        <Plus size={16} className="mr-2" /> Adicionar
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {sectionMeals.length === 0 ? (
                                        <div
                                            onClick={() => handleAddMeal(section.id)}
                                            className="border border-dashed border-white/5 rounded-xl p-4 text-center cursor-pointer hover:border-white/10 hover:bg-white/5 transition-all group"
                                        >
                                            <p className="text-sm text-zinc-600 group-hover:text-zinc-400">Nenhuma refeição planejada</p>
                                        </div>
                                    ) : (
                                        sectionMeals.map(meal => (
                                            <Card key={meal.id} className="p-4 bg-zinc-900/40 border-white/5 hover:border-white/10 transition-colors flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center w-12 pt-1">
                                                        <span className="text-sm font-bold text-zinc-300 block leading-none">{meal.time}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-white text-base">{meal.name}</h4>
                                                        {meal.recurrence && meal.recurrence.length > 0 && (
                                                            <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                                                                <CalendarIcon size={10} />
                                                                <span>Recorrente</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-zinc-500 hover:text-white"
                                                        onClick={() => handleEditMeal(meal)}
                                                    >
                                                        <PenSquare size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-zinc-500 hover:text-red-400"
                                                        onClick={() => handleDeleteMeal(meal.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}

