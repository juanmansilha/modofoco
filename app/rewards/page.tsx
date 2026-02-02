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
import { FOCO_POINTS } from "@/lib/gamification";

interface Reward {
    id: string;
    title: string;
    description: string;
    cost: number;
    icon: any;
    image?: string;
}

const REWARDS: Reward[] = [
    {
        id: "cert-1",
        title: "Certificado Digital: Membro Fundador",
        description: "Certificado oficial de participação com selo dourado.",
        cost: 1000,
        icon: Award
    },
    {
        id: "plaque-5k",
        title: "Placa Física ModoFoco",
        description: "Placa de metal escovado enviada para sua casa.",
        cost: 5000,
        icon: Trophy
    },
    {
        id: "item-10k",
        title: "Kit Exclusivo (Hoodie + Garrafa)",
        description: "Merch oficial edição limitada 'Night Mode'.",
        cost: 10000,
        icon: Gift
    },
    {
        id: "vip-20k",
        title: "Acesso Vitalício & Mentorias",
        description: "Status VIP permanente e chamadas mensais com fundadores.",
        cost: 20000,
        icon: Crown
    }
];

// Mock Ranking Data
const RANKING_DATA = [
    { id: 1, name: "Mike Dev", points: 12500, level: 5, avatar: null },
    { id: 2, name: "Ana Code", points: 11200, level: 4, avatar: null },
    { id: 3, name: "You", points: 0, level: 1, avatar: null }, // Placeholder for user
    { id: 4, name: "Julia UI", points: 9800, level: 4, avatar: null },
    { id: 5, name: "Pedro Fullstack", points: 8750, level: 3, avatar: null },
];

export default function RewardsPage() {
    const { fp, progress, level, nextLevelFP, history } = useGamification();
    const [activeTab, setActiveTab] = useState<"earn" | "rewards" | "ranking" | "history">("rewards");

    // Update user in ranking mock
    const sortedRanking = RANKING_DATA.map(user =>
        user.name === "You" ? { ...user, points: fp, level: level } : user
    ).sort((a, b) => b.points - a.points);

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-background text-foreground pb-32">

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-black/40 border-b border-white/5 pb-12 pt-8">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

                <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <CoinAnimation points={fp} />
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 mb-2">
                        {fp.toLocaleString()} <span className="text-2xl md:text-3xl text-indigo-400">FP</span>
                    </h1>
                    <p className="text-zinc-400 font-medium mb-6 flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                        <Trophy size={14} className="text-yellow-500" />
                        Nível {level}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-sm flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-zinc-500 font-mono uppercase tracking-wider">
                            <span>{fp} FP</span>
                            <span>{nextLevelFP} FP</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden relative">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                        <p className="text-xs text-zinc-500 text-center mt-1">
                            Faltam <span className="text-white font-bold">{nextLevelFP - fp}</span> pontos para o próximo nível
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-white/5 py-4 px-6 mb-8 flex items-center justify-center">
                <div className="bg-white/5 p-1 rounded-full flex overflow-x-auto max-w-full no-scrollbar">
                    {[
                        { id: "rewards", label: "Prêmios", icon: Gift },
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
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
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
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {REWARDS.map((reward) => {
                                const isUnlocked = fp >= reward.cost;
                                const Icon = reward.icon;

                                return (
                                    <div
                                        key={reward.id}
                                        className={cn(
                                            "group relative rounded-3xl p-6 border transition-all duration-300 flex flex-col h-full",
                                            isUnlocked
                                                ? "bg-zinc-900 border-white/10 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10"
                                                : "bg-black/40 border-white/5 opacity-60"
                                        )}
                                    >
                                        <div className="mb-6 relative">
                                            <div className={cn(
                                                "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-110 duration-500",
                                                isUnlocked ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400" : "bg-zinc-800 text-zinc-600"
                                            )}>
                                                <Icon size={32} />
                                            </div>
                                            <div className="absolute top-0 right-0">
                                                {isUnlocked ? (
                                                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                                                        <Unlock size={10} /> DISPONÍVEL
                                                    </span>
                                                ) : (
                                                    <span className="bg-zinc-800 text-zinc-500 text-[10px] font-bold px-2 py-1 rounded-full border border-zinc-700 flex items-center gap-1">
                                                        <Lock size={10} /> BLOQUEADO
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-bold text-xl text-white mb-2">{reward.title}</h3>
                                            <p className="text-sm text-zinc-400 leading-relaxed mb-6">{reward.description}</p>
                                        </div>

                                        <Button
                                            disabled={!isUnlocked}
                                            className={cn(
                                                "w-full h-12 rounded-xl font-bold tracking-wide",
                                                isUnlocked
                                                    ? "bg-white text-black hover:bg-zinc-200"
                                                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                            )}
                                        >
                                            {isUnlocked ? "RESGATAR PRÊMIO" : `${reward.cost.toLocaleString()} FP`}
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
                                <h2 className="text-2xl font-bold text-white mb-2">Como Ganhar FocoPoints</h2>
                                <p className="text-zinc-400">Realize atividades diárias para acumular pontos e subir no ranking. A constância é a chave.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { action: "Treino na Academia", points: FOCO_POINTS.COMPLETE_WORKOUT, icon: Dumbbell, color: "text-indigo-400" },
                                    { action: "Corrida / Cardio", points: FOCO_POINTS.COMPLETE_RUN, icon: Play, color: "text-blue-400" },
                                    { action: "Concluir Jejum", points: FOCO_POINTS.COMPLETE_FASTING, icon: Clock, color: "text-orange-400" },
                                    { action: "Registrar Refeição", points: FOCO_POINTS.ADD_MEAL, icon: Sparkles, color: "text-green-400" },
                                    { action: "Registrar Sono", points: FOCO_POINTS.REGISTER_SLEEP, icon: Activity, color: "text-purple-400" },
                                    { action: "Concluir Tarefa", points: FOCO_POINTS.COMPLETE_TASK, icon: List, color: "text-pink-400" },
                                    { action: "Atingir Meta", points: FOCO_POINTS.COMPLETE_GOAL, icon: Trophy, color: "text-yellow-400" },
                                    { action: "Sessão de Estudo", points: FOCO_POINTS.COMPLETE_STUDY_SESSION, icon: BookOpen, color: "text-cyan-400" },
                                    { action: "Registro Financeiro", points: FOCO_POINTS.ADD_FINANCE_ENTRY, icon: Wallet, color: "text-emerald-400" },
                                    { action: "Adicionar Item ao Baú", points: FOCO_POINTS.ADD_VAULT_ITEM, icon: Archive, color: "text-fuchsia-400" },
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-zinc-900/60 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                                                <item.icon size={20} className={item.color} />
                                            </div>
                                            <span className="font-medium text-zinc-300">{item.action}</span>
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
                                <div className="space-y-4">
                                    {history.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-5 bg-zinc-900/40 border border-white/5 rounded-2xl hover:bg-zinc-900/60 transition-colors group">
                                            <div className="flex items-center gap-5">
                                                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20">
                                                    <Activity size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-lg">{item.reason}</p>
                                                    <p className="text-xs text-zinc-500 font-mono mt-1">
                                                        {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="font-black text-emerald-400 text-xl tracking-tight">
                                                +{item.amount} <span className="text-sm font-normal text-emerald-500/70">FP</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
