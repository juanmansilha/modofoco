"use client";

import { useState } from "react";
import { format } from "date-fns";
import { PageBanner } from "@/components/ui/PageBanner";
import { WeeklyCalendar } from "@/components/health/WeeklyCalendar";
import { useGlobalData, TimelineItem } from "@/contexts/GlobalDataProvider";
import { CheckCircle2, Circle, Clock, Dumbbell, Utensils, Footprints, Sun, Calendar as CalendarIcon, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/contexts/NotificationContext";
import { useGamification } from "@/contexts/GamificationContext";
import { FOCO_POINTS } from "@/lib/gamification";

export default function RoutinesPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { getItemsForDate, toggleGymCompletion, toggleRunCompletion } = useGlobalData();
    const { addNotification } = useNotifications();
    const { awardFP } = useGamification();

    const timelineItems = getItemsForDate(selectedDate);

    // Mock "dots" for calendar (simple view)
    const calendarDots = timelineItems.reduce((acc, curr) => {
        if (curr.isCompleted) acc[format(selectedDate, "yyyy-MM-dd")] = "completed";
        else acc[format(selectedDate, "yyyy-MM-dd")] = "planned"; // Simple: if *any* exist
        return acc;
    }, {} as Record<string, string>);

    const handleToggleItem = (item: TimelineItem) => {
        if (item.type === "gym") {
            toggleGymCompletion(item.originalId, format(selectedDate, "yyyy-MM-dd"));
            if (!item.isCompleted) {
                addNotification("Treino Concluído!", "Parabéns por finalizar seu treino.");
                awardFP(FOCO_POINTS.COMPLETE_WORKOUT, "Treino Concluído");
            }
        } else if (item.type === "run") {
            toggleRunCompletion(item.originalId);
            if (!item.isCompleted) {
                addNotification("Corrida Concluída!", "Excelente trabalho na corrida!");
                awardFP(FOCO_POINTS.COMPLETE_RUN, "Corrida Concluída");
            }
        } else {
            // Routine or Meal - Logic not fully implemented for daily toggle persistence in MVP
            addNotification("Ação Registrada", "Item marcado (simulação para MVP).");
            // If it's a routine, award partial/full logic here maybe? 
            // For now just basic logging, will need "Routines" specific logic later.
        }
    };

    const getIcon = (type: string, iconName?: string) => {
        switch (type) {
            case "gym": return <Dumbbell size={20} />;
            case "run": return <Footprints size={20} />;
            case "meal": return <Utensils size={20} />;
            case "routine": return <Sun size={20} />; // Fallback, could use iconName
            default: return <Clock size={20} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "gym": return "text-indigo-400 bg-indigo-400/10 border-indigo-400/20";
            case "run": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            case "meal": return "text-green-400 bg-green-400/10 border-green-400/20";
            case "routine": return "text-orange-400 bg-orange-400/10 border-orange-400/20";
            default: return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
        }
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-background pb-32">
            <PageBanner
                title="Minha Rotina"
                subtitle="Visualizar e gerenciar seu dia em um só lugar."
                gradientColor="orange"
                icon={CalendarIcon}
            />

            <div className="p-6 max-w-4xl mx-auto space-y-8">

                <WeeklyCalendar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    dots={calendarDots}
                />

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Cronograma do Dia</h2>
                        <span className="text-sm text-zinc-500">{timelineItems.length} atividades</span>
                    </div>

                    <div className="relative border-l border-white/10 ml-6 space-y-8">
                        {timelineItems.length === 0 ? (
                            <div className="ml-8 text-zinc-500 italic py-8">
                                Nenhuma atividade planejada para hoje.
                            </div>
                        ) : (
                            timelineItems.map((item, index) => (
                                <div key={item.id} className="relative ml-8 group">
                                    {/* Timeline Dot */}
                                    <div className={cn(
                                        "absolute -left-[45px] top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-zinc-950 transition-colors z-10",
                                        item.isCompleted ? "border-emerald-500 text-emerald-500" : "border-zinc-700 text-zinc-500 group-hover:border-zinc-500"
                                    )}>
                                        {item.isCompleted ? <CheckCircle2 size={12} fill="currentColor" className="text-emerald-950" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                    </div>

                                    {/* Time Label */}
                                    <div className="absolute -left-[100px] top-4 text-xs font-mono text-zinc-500 w-12 text-right">
                                        {item.time}
                                    </div>

                                    <Card className={cn(
                                        "p-4 transition-all hover:border-white/10 flex items-start justify-between gap-4 cursor-pointer",
                                        item.isCompleted ? "bg-emerald-950/10 border-emerald-900/20 opacity-75" : "bg-zinc-900/40 border-white/5",
                                        getTypeColor(item.type).split(' ')[2] // Apply border color based on type
                                    )}
                                        onClick={() => handleToggleItem(item)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={cn("p-2 rounded-lg mt-0.5", getTypeColor(item.type).split(' ').slice(0, 2).join(' '))}>
                                                {getIcon(item.type)}
                                            </div>
                                            <div>
                                                <h3 className={cn("font-bold text-base transition-colors", item.isCompleted ? "text-emerald-400 line-through" : "text-white")}>
                                                    {item.title}
                                                </h3>
                                                {item.subtitle && (
                                                    <p className="text-sm text-zinc-500 mt-0.5">{item.subtitle}</p>
                                                )}
                                                {/* Mini tag for type */}
                                                <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-bold opacity-50 px-2 py-0.5 rounded-full border border-white/10">
                                                    {item.type === 'gym' ? 'Treino' : item.type === 'run' ? 'Corrida' : item.type === 'meal' ? 'Dieta' : 'Rotina'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <div className={cn(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                item.isCompleted ? "border-emerald-500 bg-emerald-500 text-black" : "border-zinc-600 text-transparent hover:border-zinc-400"
                                            )}>
                                                <CheckCircle2 size={16} />
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
