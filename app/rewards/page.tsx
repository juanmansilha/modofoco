"use client";

import { useGamification } from "@/contexts/GamificationContext";
import { PageBanner } from "@/components/ui/PageBanner";
import { Card } from "@/components/ui/Card";
import { Trophy, Lock, Unlock, Gift, Crown, Award, List, Medal, Clock, Activity, ScrollText, Play, Dumbbell, BookOpen, Wallet, Archive, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CoinAnimation } from "@/components/rewards/CoinAnimation";
import { FOCO_POINTS, REWARDS_CATALOG } from "@/lib/gamification";

// Local constants replaced by imports

// Mock Ranking Data
const RANKING_DATA = [
    { id: 1, name: "Mike Dev", points: 12500, level: 5, avatar: null },
    { id: 2, name: "Ana Code", points: 11200, level: 4, avatar: null },
    { id: 3, name: "You", points: 0, level: 1, avatar: null }, // Placeholder for user
    { id: 4, name: "Julia UI", points: 9800, level: 4, avatar: null },
    { id: 5, name: "Pedro Fullstack", points: 8750, level: 3, avatar: null },
];

export default function RewardsPage() {
    const { fp, lifetimeFP, progress, level, levelData, nextLevelFP, history, spendFP } = useGamification();
    const [activeTab, setActiveTab] = useState<"earn" | "rewards" | "ranking" | "history">("rewards");

    // Update user in ranking mock
    const sortedRanking = RANKING_DATA.map(user =>
        user.name === "You" ? { ...user, points: lifetimeFP, level: level, avatar: null } : user
    ).sort((a, b) => b.points - a.points);

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-background text-foreground pb-32">

            {/* Hero Section */}
            <div className={`relative overflow-hidden border-b border-white/5 pb-12 pt-8 ${levelData?.bg ? levelData.bg.replace("bg-", "bg-opacity-10 bg-") : ""}`}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black pointer-events-none" />

                <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <CoinAnimation points={fp} />
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 mb-2">
                        {fp.toLocaleString()} <span className={`text-2xl md:text-3xl ${levelData?.text || "text-indigo-400"}`}>FP</span>
                    </h1>
                    <p className={`font-medium mb-6 flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 ${levelData?.text}`}>
                        <Trophy size={14} />
                        Nível {level} - {levelData?.name}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-sm flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-zinc-500 font-mono uppercase tracking-wider">
                            <span>{lifetimeFP} XP</span>
                            <span>{nextLevelFP} XP</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden relative">
                            <motion.div
                                className={`h-full ${levelData?.color === 'gold-gradient' ? 'bg-gradient-to-r from-yellow-300 to-yellow-600' : (levelData?.bg || 'bg-indigo-500')}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                        <p className="text-xs text-zinc-500 text-center mt-1">
                            Faltam <span className="text-white font-bold">{nextLevelFP - lifetimeFP}</span> pontos para o próximo nível
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-white/5 py-4 px-6 mb-8 flex items-center justify-center">
                <div className="bg-white/5 p-1 rounded-full flex overflow-x-auto max-w-full no-scrollbar">
                    {[
                        { id: "rewards", label: "Loja de Prêmios", icon: Gift },
                        { id: "earn", label: "Como Ganhar", icon: Info },
                        { id: "ranking", label: "Ranking", icon: Medal },
                        { id: "history", label: "Extrato", icon: Clock },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-white text-black shadow-lg"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-6xl mx-auto px-6 min-h-[500px]">
                <AnimatePresence mode="wait">

                    {/* --- REWARDS TAB --- */}
                    {activeTab === "rewards" && (
                        <motion.div
                            key="rewards"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {REWARDS_CATALOG.map((reward) => {
                                const isUnlocked = fp >= reward.cost;
                                const Icon = reward.type === 'physical' ? Gift : Trophy;

                                return (
                                    <div
                                        key={reward.id}
                                        className={cn(
                                            "group relative rounded-3xl p-6 border transition-all duration-300 flex flex-col h-full",
                                            isUnlocked
                                                ? "bg-zinc-900 border-white/10 hover:border-white/20 hover:shadow-2xl"
                                                : "bg-black/40 border-white/5 opacity-60"
                                        )}
                                    >
                                        <div className="mb-6 relative">
                                            <div className={cn(
                                                "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 transition-transform group-hover:scale-110 duration-500",
                                                isUnlocked ? "bg-white/5 text-white" : "bg-zinc-800 text-zinc-600"
                                            )}>
                                                <Icon size={32} />
                                            </div>
                                            <div className="absolute top-0 right-0">
                                                {isUnlocked ? (
                                                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                                                        <Unlock size={10} /> POSSÍVEL
                                                    </span>
                                                ) : (
                                                    <span className="bg-zinc-800 text-zinc-500 text-[10px] font-bold px-2 py-1 rounded-full border border-zinc-700 flex items-center gap-1">
                                                        <Lock size={10} /> FALTA FP
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-bold text-xl text-white mb-2">{reward.title}</h3>
                                            <p className="text-sm text-zinc-400 leading-relaxed mb-6">Recompensa física oficial.</p>
                                        </div>

                                        <Button
                                            disabled={!isUnlocked}
                                            onClick={() => {
                                                if (confirm(`Deseja resgatar "${reward.title}" por ${reward.cost} FP?`)) {
                                                    spendFP(reward.cost, `Resgate: ${reward.title}`);
                                                }
                                            }}
                                            className={cn(
                                                "w-full h-12 rounded-xl font-bold tracking-wide",
                                                isUnlocked
                                                    ? "bg-white text-black hover:bg-zinc-200"
                                                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                            )}
                                        >
                                            {isUnlocked ? "RESGATAR AGORA" : `${reward.cost.toLocaleString()} FP`}
                                        </Button>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* --- EARN TAB --- */}
                    {activeTab === "earn" && (
                        <motion.div
                            key="earn"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="text-center max-w-2xl mx-auto mb-12">
                                <h2 className="text-2xl font-bold text-white mb-2">Tabela de Pontos</h2>
                                <p className="text-zinc-400">O sistema privilegia a constância sobre a intensidade.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { action: "Tarefa Simples", points: FOCO_POINTS.TASK_SIMPLE, icon: List, sub: "Max 5/dia" },
                                    { action: "Tarefa Média", points: FOCO_POINTS.TASK_MEDIUM, icon: List, sub: "30-90 min" },
                                    { action: "Tarefa Difícil", points: FOCO_POINTS.TASK_HARD, icon: List, sub: "Alta carga" },
                                    { action: "Meta Diária", points: FOCO_POINTS.DAILY_GOAL, icon: Trophy, sub: "Conclusão chave" },

                                    { action: "Sessão Estudo", points: FOCO_POINTS.STUDY_SESSION, icon: BookOpen, sub: "Pomodoro 25min" },
                                    { action: "Estudo Bônus", points: FOCO_POINTS.STUDY_BONUS, icon: BookOpen, sub: "2+ sessões" },

                                    { action: "Treino / Corrida", points: FOCO_POINTS.WORKOUT_RUN, icon: Dumbbell, sub: "Atividade física" },
                                    { action: "Jejum", points: FOCO_POINTS.FASTING, icon: Clock, sub: "Concluído" },

                                    { action: "Streak 7 Dias", points: FOCO_POINTS.STREAK_7, icon: Activity, sub: "Semana perfeita" },
                                    { action: "Streak 30 Dias", points: FOCO_POINTS.STREAK_30, icon: Crown, sub: "Mês perfeito" },
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-zinc-900/60 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                                                <item.icon size={20} />
                                            </div>
                                            <div>
                                                <span className="font-medium text-zinc-300 block">{item.action}</span>
                                                <span className="text-xs text-zinc-500">{item.sub}</span>
                                            </div>
                                        </div>
                                        <div className="font-bold text-white bg-white/10 px-3 py-1 rounded-lg">
                                            +{item.points} FP
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* --- RANKING TAB --- */}
                    {activeTab === "ranking" && (
                        <motion.div
                            key="ranking"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-3xl mx-auto"
                        >
                            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                                <div className="p-6 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-b border-white/5">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Trophy size={20} className="text-yellow-500" /> Leaderboard da Comunidade
                                    </h3>
                                </div>

                                <div className="divide-y divide-white/5">
                                    {sortedRanking.map((user, index) => (
                                        <div
                                            key={user.id}
                                            className={cn(
                                                "p-6 grid grid-cols-12 gap-4 items-center transition-all",
                                                user.name === "You"
                                                    ? "bg-indigo-500/10 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]"
                                                    : "hover:bg-white/5"
                                            )}
                                        >
                                            <div className="col-span-2 md:col-span-1 flex justify-center">
                                                {index === 0 && <div className="h-8 w-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center border border-yellow-500/50"><Crown size={18} /></div>}
                                                {index === 1 && <div className="h-8 w-8 rounded-full bg-zinc-400/20 text-zinc-400 flex items-center justify-center border border-zinc-400/50"><Medal size={18} /></div>}
                                                {index === 2 && <div className="h-8 w-8 rounded-full bg-amber-700/20 text-amber-700 flex items-center justify-center border border-amber-700/50"><Medal size={18} /></div>}
                                                {index > 2 && <span className="text-zinc-500 font-bold text-lg">{index + 1}</span>}
                                            </div>

                                            <div className="col-span-6 md:col-span-7 flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border-2 border-white/5" />
                                                <div>
                                                    <p className={cn("font-bold text-base", user.name === "You" ? "text-indigo-400" : "text-white")}>
                                                        {user.name} {user.name === "You" && <span className="text-xs bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-300 ml-2">VOCÊ</span>}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">Nível {user.level} • Membro VIP</p>
                                                </div>
                                            </div>

                                            <div className="col-span-4 md:col-span-4 text-right">
                                                <div className="font-black text-white text-lg tracking-tight">
                                                    {user.points.toLocaleString()} <span className="text-sm font-normal text-zinc-500">FP</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* --- HISTORY TAB --- */}
                    {activeTab === "history" && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-3xl mx-auto"
                        >
                            {history.length === 0 ? (
                                <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
                                    <div className="h-20 w-20 rounded-full bg-zinc-900 mx-auto flex items-center justify-center mb-6">
                                        <Clock size={32} className="text-zinc-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Sem atividade recente</h3>
                                    <p className="text-zinc-500 max-w-sm mx-auto">Suas atividades e pontos ganhos aparecerão aqui. Comece a usar o app para gerar histórico!</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                    {history.map((item) => {
                                        const isSpend = item.type === 'spend' || item.amount < 0;
                                        return (
                                            <div key={item.id} className="flex items-center justify-between p-5 bg-zinc-900/40 border border-white/5 rounded-2xl hover:bg-zinc-900/60 transition-colors group">
                                                <div className="flex items-center gap-5">
                                                    <div className={cn(
                                                        "h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border",
                                                        isSpend
                                                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    )}>
                                                        {isSpend ? <Wallet size={20} /> : <Activity size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-lg">{item.reason}</p>
                                                        <p className="text-xs text-zinc-500 font-mono mt-1">
                                                            {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "font-black text-xl tracking-tight",
                                                    isSpend ? "text-red-400" : "text-emerald-400"
                                                )}>
                                                    {isSpend ? '' : '+'}{item.amount} <span className={cn("text-sm font-normal", isSpend ? "text-red-500/70" : "text-emerald-500/70")}>FP</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
