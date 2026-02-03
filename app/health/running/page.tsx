"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { HealthBanner } from "@/components/health/HealthBanner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WeeklyCalendar } from "@/components/health/WeeklyCalendar";
import { RunModal } from "@/components/health/RunModal";
import { MapPin, Flame, Play, Trophy, Check, CheckCircle2, MoreVertical, PenSquare, Trash2, Clock, Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/contexts/NotificationContext";
import { useGamification } from "@/contexts/GamificationContext";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { FOCO_POINTS } from "@/lib/gamification";
import { RunTracker } from "@/components/health/RunTracker";

// Note: Ensure this matches GlobalDataProvider
export interface RunSession {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM - Schedule
    duration: string; // MM:SS - Duration
    dist: number; // km
    calories: number;
    completed?: boolean;
}

export default function RunningPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRun, setEditingRun] = useState<RunSession | null>(null);
    const [isTrackingMode, setIsTrackingMode] = useState(false);

    const { runSessions, addRunSession, updateRunSession, deleteRunSession, toggleRunCompletion } = useGlobalData();
    const { addNotification } = useNotifications();
    const { awardFP } = useGamification();

    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    const dailyRuns = runSessions.filter(r => r.date === selectedDateStr).sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));

    // Weekly Stats
    const weeklyStats = useMemo(() => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const end = endOfWeek(selectedDate, { weekStartsOn: 1 });

        const weekRuns = runSessions.filter(r => {
            const d = new Date(r.date + "T12:00:00"); // Avoid timezone issues
            return d >= start && d <= end;
        });

        const totalDist = weekRuns.reduce((acc, curr) => acc + curr.dist, 0);

        return { totalDist, count: weekRuns.length };
    }, [runSessions, selectedDate]);

    const calendarDots = runSessions.reduce((acc, curr) => {
        acc[curr.date] = curr.completed ? 'completed' : 'planned';
        return acc;
    }, {} as Record<string, string>);

    const handleAddRun = () => {
        setEditingRun(null);
        setIsModalOpen(true);
    };

    const handleEditRun = (run: RunSession) => {
        setEditingRun(run);
        setIsModalOpen(true);
    };

    const handleSaveRun = (runData: Partial<RunSession>) => {
        if (editingRun) {
            // Edit
            updateRunSession({ ...editingRun, ...runData } as RunSession);
            addNotification("Corrida Atualizada", "Detalhes da corrida salvos com sucesso.");
        } else {
            // Create
            const newRun: RunSession = {
                id: Math.random().toString(),
                title: runData.title || "Corrida Nova",
                date: runData.date || selectedDateStr,
                dist: runData.dist || 0,
                time: runData.time || "06:00",
                duration: runData.duration || "00:00",
                calories: runData.calories || 0,
                completed: false
            };
            addRunSession(newRun);
            addNotification("Corrida Planejada", "Nova sessão de corrida adicionada.");
            // awardZP(50, "Corrida Criada"); // Removed points for creation
        }
        setIsModalOpen(false);
    };

    const handleSaveTracker = (data: { dist: number; duration: string; calories: number }) => {
        const newRun: RunSession = {
            id: Math.random().toString(),
            title: "Corrida com Mapa",
            date: format(new Date(), "yyyy-MM-dd"),
            time: format(new Date(), "HH:mm"),
            dist: data.dist,
            duration: data.duration,
            calories: data.calories,
            completed: true
        };
        addRunSession(newRun);
        addNotification("Treino Salvo!", `Você correu ${data.dist}km.`);
        awardFP(FOCO_POINTS.COMPLETE_RUN, "Corrida com Mapa");
        setIsTrackingMode(false);
    };

    const handleDeleteRun = (id: string) => {
        if (confirm("Deletar esta corrida?")) {
            deleteRunSession(id);
        }
    };

    const handleCompleteRun = (id: string) => {
        const r = runSessions.find(r => r.id === id);
        if (r) {
            if (r.completed) return;
            toggleRunCompletion(id);
            addNotification("Corrida Concluída! 🏃💨", "Parabéns! Mais kms para a conta.");
            awardFP(FOCO_POINTS.COMPLETE_RUN, "Corrida Concluída");
        }
    };

    if (isTrackingMode) {
        return (
            <div className="h-[calc(100vh-64px)] p-4 md:p-8">
                <RunTracker
                    onBack={() => setIsTrackingMode(false)}
                    onSave={handleSaveTracker}
                />
            </div>
        );
    }

    return (
        <div className="pb-20">
            <HealthBanner
                title="Corrida"
                subtitle="A liberdade de ir mais longe."
                gradientColor="orange"
            />

            <RunModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveRun}
                initialData={editingRun}
                defaultDate={selectedDateStr}
            />

            <div className="p-8 space-y-8">

                {/* Weekly Calendar */}
                <WeeklyCalendar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    dots={calendarDots}
                />

                {/* Main Stats & Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Weekly Stats */}
                    <Card className="p-6 bg-zinc-900/50 border-white/5 flex flex-col justify-between">
                        <div>
                            <p className="text-sm text-muted">Distância Semanal</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{weeklyStats.totalDist.toFixed(1)} <span className="text-sm font-normal text-zinc-500">km</span></h3>
                        </div>
                        <div className="w-full bg-zinc-800 h-1 mt-4 rounded-full overflow-hidden">
                            <div
                                className="bg-orange-500 h-full transition-all duration-1000"
                                style={{ width: `${Math.min((weeklyStats.totalDist / 20) * 100, 100)}%` }} // 20km goal
                            />
                        </div>
                    </Card>

                    {/* Manual Entry */}
                    <Card className="p-6 bg-zinc-900/50 border-white/5 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-white/5 transition-all group"
                        onClick={handleAddRun}
                    >
                        <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2 group-hover:scale-110 transition-transform">
                            <PenSquare size={24} />
                        </div>
                        <span className="font-bold text-white">Registro Manual</span>
                    </Card>

                    {/* Map Mode */}
                    <Card className="p-6 bg-gradient-to-br from-orange-600/20 to-orange-900/10 border-orange-500/20 flex flex-col justify-center items-center text-center cursor-pointer hover:border-orange-500/50 transition-all group"
                        onClick={() => setIsTrackingMode(true)}
                    >
                        <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center text-black mb-2 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                            <MapIcon size={24} />
                        </div>
                        <span className="font-bold text-white">Iniciar com Mapa</span>
                    </Card>
                </div>

                {/* Daily List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">Treinos do Dia ({format(selectedDate, "dd/MM")})</h3>
                    </div>

                    {dailyRuns.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
                                <MapPin size={32} />
                            </div>
                            <p className="text-white font-medium mb-1">Dia de Descanso</p>
                            <p className="text-zinc-500 text-sm">Nenhuma corrida registrada para este dia.</p>
                        </div>
                    ) : (
                        dailyRuns.map((run) => (
                            <RunItem
                                key={run.id}
                                run={run}
                                onComplete={handleCompleteRun}
                                onEdit={handleEditRun}
                                onDelete={handleDeleteRun}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

interface RunItemProps {
    run: RunSession;
    onComplete: (id: string) => void;
    onEdit: (run: RunSession) => void;
    onDelete: (id: string) => void;
}

function RunItem({ run, onComplete, onEdit, onDelete }: RunItemProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <Card className={cn("p-4 border-white/5 transition-all group hover:border-white/10", run.completed && "opacity-75 border-emerald-500/20 bg-emerald-900/10")}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className={cn("h-12 w-12 rounded-full flex items-center justify-center transition-colors shrink-0",
                        run.completed ? "bg-emerald-500/20 text-emerald-500" : "bg-orange-900/20 text-orange-500"
                    )}>
                        {run.completed ? <Check size={20} /> : <Trophy size={18} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className={cn("font-bold transition-colors", run.completed ? "text-emerald-400" : "text-white")}>{run.title}</h4>
                            {run.time && (
                                <span className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Clock size={10} /> {run.time}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
                            <span>{run.dist}km</span>
                            {run.duration && run.duration !== "00:00" && (
                                <>
                                    <span>•</span>
                                    <span>{run.duration}</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">

                    <Button
                        size="sm"
                        disabled={run.completed}
                        onClick={() => onComplete(run.id)}
                        className={cn(
                            "h-8 px-3 transition-colors",
                            run.completed
                                ? "bg-zinc-800 text-zinc-500 hover:bg-zinc-800 cursor-not-allowed"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white"
                        )}
                    >
                        {run.completed ? (
                            <><CheckCircle2 size={14} className="mr-2" /> Concluído</>
                        ) : (
                            <><Check size={14} className="mr-2" /> Concluir</>
                        )}
                    </Button>

                    <div className="relative" ref={menuRef}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <MoreVertical size={16} className="text-zinc-500" />
                        </Button>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-[#0A0A0A] border border-white/10 rounded-lg shadow-xl py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                    onClick={() => {
                                        onEdit(run);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 flex items-center gap-2 transition-colors"
                                >
                                    <PenSquare size={14} /> Editar
                                </button>
                                <button
                                    onClick={() => {
                                        onDelete(run.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 size={14} /> Excluir
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
