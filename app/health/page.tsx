"use client";

import { useMemo } from "react";
import { PageBanner } from "@/components/ui/PageBanner";
import { Card } from "@/components/ui/Card";
import { Activity, Flame, Heart, Timer, Zap, Moon } from "lucide-react";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HealthPage() {
    const {
        gymRoutines,
        runSessions,
        getItemsForDate
    } = useGlobalData();

    // Today's Date
    const today = new Date();
    const todayItems = getItemsForDate(today);

    // Stats Calculations
    // Helper to parse duration string to minutes
    const parseDurationToMinutes = (durationStr: string | undefined): number => {
        if (!durationStr) return 0;

        // Handle "HH:MM" format
        if (durationStr.includes(':')) {
            const parts = durationStr.split(':');
            if (parts.length === 2) {
                return parseInt(parts[0]) * 60 + parseInt(parts[1]);
            }
        }

        // Handle "60 min", "1h", etc.
        const lower = durationStr.toLowerCase();
        if (lower.includes('h')) {
            const hours = parseInt(lower.replace(/[^0-9]/g, ''));
            return isNaN(hours) ? 0 : hours * 60;
        }
        if (lower.includes('min') || lower.includes('m')) {
            const mins = parseInt(lower.replace(/[^0-9]/g, ''));
            return isNaN(mins) ? 0 : mins;
        }

        // Fallback: try parsing exact number
        const val = parseInt(durationStr);
        return isNaN(val) ? 0 : val;
    };

    // Stats Calculations (Real Data)
    const todayCals = useMemo(() => {
        let calories = 0;
        todayItems.forEach(item => {
            if (item.isCompleted) {
                if (item.type === 'run' && item.data.calories) {
                    calories += Number(item.data.calories);
                } else if (item.type === 'gym') {
                    // Estimate: 5 kcal/min for gym
                    const duration = parseDurationToMinutes(item.data.duration);
                    // Default to 45 min if no duration set, to avoid 0 calories for completed workout
                    const effectiveDuration = duration || 45;
                    calories += effectiveDuration * 5;
                }
            }
        });
        return Math.round(calories);
    }, [todayItems]);

    const activeExerciseTime = useMemo(() => {
        let minutes = 0;
        todayItems.forEach(item => {
            if (item.isCompleted) {
                if (item.type === 'gym' || item.type === 'run') {
                    minutes += parseDurationToMinutes(item.data.duration);
                }
            }
        });
        return minutes;
    }, [todayItems]);



    const nextActivity = todayItems.find(item => !item.isCompleted && (item.type === 'gym' || item.type === 'run'));

    return (
        <div className="pb-20 bg-background min-h-screen custom-scrollbar">
            <PageBanner
                title="Corpo & Mente"
                subtitle="O templo que você constrói todos os dias."
                gradientColor="green"
                image="/banner-health.png"
                imagePosition="center 20%"
                icon={Activity}
            />

            <div className="max-w-7xl mx-auto p-6 space-y-8">

                {/* Highlight Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-zinc-900/50 border-white/5 flex flex-col items-center justify-center gap-2 group hover:border-emerald-500/30 transition-all">
                        <Flame size={24} className="text-orange-500" />
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-white">{todayCals}</span>
                            <span className="text-xs text-muted uppercase tracking-wider">Kcal Hoje</span>
                        </div>
                    </Card>
                    <Card className="p-4 bg-zinc-900/50 border-white/5 flex flex-col items-center justify-center gap-2 group hover:border-emerald-500/30 transition-all">
                        <Timer size={24} className="text-blue-500" />
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-white">{activeExerciseTime}m</span>
                            <span className="text-xs text-muted uppercase tracking-wider">Exercício</span>
                        </div>
                    </Card>
                </div>

                {/* Dashboard Grid */}
                <div className="space-y-6">

                    {/* Next Up / Main Focus */}
                    {nextActivity ? (
                        <Card className="p-6 bg-gradient-to-r from-emerald-900/20 to-zinc-900/50 border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-emerald-500/40 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                    <Activity size={32} />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 block">Próximo na Agenda</span>
                                    <h3 className="text-xl font-bold text-white mb-1">{nextActivity.title}</h3>
                                    <p className="text-sm text-zinc-400">
                                        {format(today, "EEEE", { locale: ptBR })} • {nextActivity.time} • {nextActivity.subtitle}
                                    </p>
                                </div>
                            </div>
                            <div className="text-emerald-500 font-bold text-sm bg-emerald-500/10 px-4 py-2 rounded-full">
                                Programado
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-6 bg-zinc-900/30 border-white/5 flex items-center justify-center gap-4 text-zinc-500">
                            <Activity size={24} />
                            <span>Tudo feito por hoje! Descanse.</span>
                        </Card>
                    )}

                    {/* Recent History / Log */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Resumo do Dia</h3>
                            <span className="text-xs text-zinc-500 uppercase tracking-wider">{format(today, "dd 'de' MMMM", { locale: ptBR })}</span>
                        </div>
                        <div className="space-y-2">
                            {todayItems.length === 0 && (
                                <p className="text-sm text-zinc-500 text-center py-8">Nenhuma atividade registrada.</p>
                            )}
                            {todayItems.map((item) => (
                                <Card key={item.id} className={`p-4 flex items-center justify-between border-white/5 transition-colors ${item.isCompleted ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-zinc-900/30'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.isCompleted ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                            {item.type === 'gym' && <Activity size={18} />}
                                            {item.type === 'run' && <Flame size={18} />}
                                            {item.type === 'meal' && <Heart size={18} />}
                                            {item.type === 'routine' && <Timer size={18} />}
                                        </div>
                                        <div>
                                            <p className={`font-medium ${item.isCompleted ? 'text-white' : 'text-zinc-400'}`}>{item.title}</p>
                                            <p className="text-xs text-muted">{item.time} • {item.subtitle}</p>
                                        </div>
                                    </div>
                                    {item.isCompleted && <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Feito</span>}
                                </Card>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
