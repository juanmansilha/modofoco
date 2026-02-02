"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { PageBanner } from "@/components/ui/PageBanner"; // Migrating to PageBanner for consistency
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Timer, Zap, Play, Square, Utensils, Flame, History, ChevronRight } from "lucide-react";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { useNotifications } from "@/contexts/NotificationContext";
import { useGamification } from "@/contexts/GamificationContext";
import { FOCO_POINTS } from "@/lib/gamification";

export default function FastingPage() {
    const { fastingState, updateFastingState } = useGlobalData();
    const { awardFP } = useGamification();
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const { addNotification } = useNotifications();

    const PLANS = [
        { id: "16-8", label: "16:8", fast: 16, eat: 8, desc: "LeanGains: Padrão ouro para iniciantes." },
        { id: "18-6", label: "18:6", fast: 18, eat: 6, desc: "Warrior: Resultados acelerados." },
        { id: "20-4", label: "20:4", fast: 20, eat: 4, desc: "Extreme: Para usuários avançados." },
        { id: "omad", label: "OMAD", fast: 23, eat: 1, desc: "One Meal: Uma refeição por dia." },
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const updateTimer = () => {
            if (fastingState.isActive && fastingState.startTime) {
                const plan = PLANS.find(p => p.id === fastingState.planId) || PLANS[0];
                const endTime = fastingState.startTime + (plan.fast * 3600 * 1000); // ms
                const now = Date.now();
                const diff = Math.floor((endTime - now) / 1000); // seconds

                if (diff > 0) {
                    setTimeLeft(diff);
                } else if (diff <= 0) {
                    // Finished
                    updateFastingState({ ...fastingState, isActive: false, startTime: null });
                    setTimeLeft(null);
                    addNotification("Jejum Concluído! 🎉", "Você completou seu objetivo de jejum.");
                    awardFP(FOCO_POINTS.COMPLETE_FASTING, "Jejum Concluído");
                }
            } else {
                setTimeLeft(null);
            }
        };

        if (fastingState.isActive) {
            updateTimer(); // Initial call
            interval = setInterval(updateTimer, 1000);
        }

        return () => clearInterval(interval);
    }, [fastingState, addNotification, updateFastingState]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        updateFastingState({
            isActive: true,
            startTime: Date.now(),
            planId: fastingState.planId,
            elapsedSeconds: 0
        });
        addNotification("Jejum Iniciado", "Contador ativado.");
    };

    const handleStop = () => {
        updateFastingState({ ...fastingState, isActive: false, startTime: null });
    };

    const handleSelectPlan = (id: string) => {
        if (!fastingState.isActive) {
            updateFastingState({ ...fastingState, planId: id });
        }
    };

    // Derived state for UI
    const currentPlan = PLANS.find(p => p.id === fastingState.planId);
    const totalSeconds = currentPlan ? currentPlan.fast * 3600 : 1;
    const progress = timeLeft !== null ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

    return (
        <div className="pb-20 bg-background min-h-screen custom-scrollbar">
            <PageBanner
                title="Jejum Intermitente"
                subtitle="Controle suas janelas metabólicas e potencialize sua saúde."
                gradientColor="emerald"
                icon={Zap}
            // image="/banner-health.png" 
            />

            <div className="max-w-4xl mx-auto p-6 space-y-12">

                {/* Timer Section */}
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative w-72 h-72 flex items-center justify-center">
                        {/* Progress Circle container */}
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            {/* Background Circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#27272a" // zinc-800
                                strokeWidth="8"
                            />
                            {/* Progress Circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#10b981" // emerald-500
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray="283" // 2 * pi * 45
                                strokeDashoffset={283 - (283 * progress) / 100}
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4">
                            {fastingState.isActive ? (
                                <>
                                    <p className="text-zinc-400 text-sm mb-2 font-medium uppercase tracking-wider">Tempo Restante</p>
                                    <h2 className="text-5xl font-mono font-bold text-white tracking-widest tabular-nums leading-none">
                                        {timeLeft !== null ? formatTime(timeLeft) : "00:00:00"}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-pulse">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        <span className="text-emerald-500 text-xs font-bold uppercase tracking-wide">Em Jejum</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-zinc-400 text-xs mb-2 uppercase tracking-wide">Pronto para Iniciar?</p>
                                    <h2 className="text-4xl font-bold text-white">
                                        {currentPlan?.fast}h <span className="text-zinc-600 text-2xl mx-1 font-light">/</span> {currentPlan?.eat}h
                                    </h2>
                                    <p className="text-zinc-500 text-xs mt-2 max-w-[150px] leading-tight">{currentPlan?.desc}</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-10 flex gap-4">
                        {!fastingState.isActive ? (
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-500 text-white min-w-[200px] h-12 text-lg shadow-lg shadow-emerald-500/20"
                                onClick={handleStart}
                            >
                                <Play size={20} className="mr-2" fill="currentColor" /> Iniciar Jejum
                            </Button>
                        ) : (
                            <Button
                                variant="destructive"
                                className="min-w-[200px] h-12 text-lg opacity-90 hover:opacity-100"
                                onClick={handleStop}
                            >
                                <Square size={20} className="mr-2" fill="currentColor" /> Encerrar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Plan Selector */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Timer size={20} className="text-emerald-500" />
                        Escolha seu Protocolo
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {PLANS.map(plan => (
                            <button
                                key={plan.id}
                                disabled={fastingState.isActive}
                                onClick={() => handleSelectPlan(plan.id)}
                                className={`
                                    p-4 rounded-xl border transition-all text-left relative overflow-hidden group
                                    ${fastingState.planId === plan.id
                                        ? "bg-emerald-500/10 border-emerald-500 text-white ring-1 ring-emerald-500/50"
                                        : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                                    }
                                    ${fastingState.isActive ? "opacity-50 cursor-not-allowed" : ""}
                                `}
                            >
                                <div className="font-bold text-xl mb-1 flex items-center justify-between">
                                    {plan.label}
                                    {fastingState.planId === plan.id && <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />}
                                </div>
                                <div className="text-xs opacity-70 leading-relaxed">{plan.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status/Infos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-zinc-900/50 border-white/5 flex items-start gap-4 hover:border-white/10 transition-colors">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mt-1 shrink-0">
                            <Utensils size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-1">Janela de Alimentação</h4>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                {fastingState.isActive
                                    ? "Durante o jejum, evite calorias. Água, café e chá sem açúcar estão liberados."
                                    : `No protocolo ${currentPlan?.label}, você tem uma janela de ${currentPlan?.eat} horas para realizar suas refeições planejadas.`
                                }
                            </p>
                        </div>
                    </Card>
                    <Card className="p-6 bg-zinc-900/50 border-white/5 flex items-start gap-4 hover:border-white/10 transition-colors">
                        <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 mt-1 shrink-0">
                            <Flame size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-1">Estado Metabólico</h4>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                {fastingState.isActive
                                    ? "Seu corpo inicia a queima de gordura (cetose) após cerca de 12 horas de jejum."
                                    : "O jejum intermitente ajuda a regular a insulina e promove a renovação celular (autofagia)."
                                }
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Recent History Placeholder */}
                <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <History size={20} className="text-zinc-500" />
                            Últimos Jejuns
                        </h3>
                        <Button variant="link" size="sm" className="text-emerald-500 h-auto p-0 hover:text-emerald-400">Ver todos</Button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <Zap size={18} fill="currentColor" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">16:8 - Concluído</p>
                                    <p className="text-xs text-zinc-500">Ontem, 20:00 - 12:00</p>
                                </div>
                            </div>
                            <span className="font-mono text-emerald-400 font-bold">16h 02m</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 rounded-xl opacity-60">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center">
                                    <Zap size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-zinc-300">16:8 - Concluído</p>
                                    <p className="text-xs text-zinc-600">Terça, 19:30 - 11:30</p>
                                </div>
                            </div>
                            <span className="font-mono text-zinc-500">16h 00m</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
