"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, ChevronRight, Activity, Calendar, Ruler, Weight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { Routine } from "@/components/health/WorkoutRoutine";
import { generateWorkoutPlan, Goal, ExperienceLevel } from "@/lib/workout-intelligence";

interface WorkoutWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (routines: any[]) => void;
}

type Step = "personal" | "goal" | "experience" | "processing" | "result";

export function WorkoutWizard({ isOpen, onClose, onGenerate }: WorkoutWizardProps) {
    const [step, setStep] = useState<Step>("personal");
    const [processingText, setProcessingText] = useState("Analisando perfil biométrico...");
    const [generatedRoutines, setGeneratedRoutines] = useState<any[]>([]);

    // Form Data
    const [formData, setFormData] = useState({
        age: "",
        weight: "",
        height: "",
        goal: "" as Goal | "",
        level: "" as ExperienceLevel | "",
        days: "",
    });

    const goalsMap: { label: string; value: Goal }[] = [
        { label: "Hipertrofia (Ganho de Massa)", value: "hypertrophy" },
        { label: "Emagrecimento (Perda de Gordura)", value: "weight_loss" },
        { label: "Força Pura", value: "strength" },
        { label: "Saúde e Condicionamento", value: "general_health" }
    ];

    const levelsMap: { label: string; value: ExperienceLevel }[] = [
        { label: "Iniciante", value: "beginner" },
        { label: "Intermediário", value: "intermediate" },
        { label: "Avançado", value: "advanced" }
    ];

    // AI Processing
    useEffect(() => {
        if (step === "processing") {
            const texts = [
                "Analisando perfil biométrico...",
                "Consultando base de cinesiologia...",
                "Calculando volume de treino ideal...",
                "Distribuindo grupos musculares...",
                "Otimizando descanso e recuperação...",
                "Gerando periodização semanal...",
            ];
            let i = 0;
            const interval = setInterval(() => {
                i++;
                if (i < texts.length) {
                    setProcessingText(texts[i]);
                } else {
                    clearInterval(interval);
                    generateRealRoutines();
                    setTimeout(() => setStep("result"), 800);
                }
            }, 800);
            return () => clearInterval(interval);
        }
    }, [step]);

    const generateRealRoutines = () => {
        if (!formData.goal || !formData.level || !formData.days) return;

        const routines = generateWorkoutPlan({
            daysPerWeek: parseInt(formData.days),
            goal: formData.goal,
            level: formData.level
        });

        setGeneratedRoutines(routines);
    };

    const handleNext = () => {
        if (step === "personal") setStep("goal");
        else if (step === "goal") setStep("experience");
        else if (step === "experience") setStep("processing");
    };

    const handleFinish = () => {
        onGenerate(generatedRoutines);
        onClose();
        // Reset
        setTimeout(() => {
            setStep("personal");
            setFormData({ age: "", weight: "", height: "", goal: "", level: "", days: "" });
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <Bot className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">ModoFoco AI Trainer</h2>
                            <p className="text-xs text-zinc-400">Prescrição de treino inteligente</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {step === "personal" && (
                            <motion.div
                                key="personal"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-2xl font-bold text-white mb-2">Vamos começar com o básico.</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400 flex items-center gap-2"><Calendar size={14} /> Idade</label>
                                        <Input
                                            type="number"
                                            placeholder="Anos"
                                            value={formData.age}
                                            onChange={e => setFormData({ ...formData, age: e.target.value })}
                                            className="bg-zinc-900/50 border-white/10 text-white h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400 flex items-center gap-2"><Weight size={14} /> Peso (kg)</label>
                                        <Input
                                            type="number"
                                            placeholder="kg"
                                            value={formData.weight}
                                            onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                            className="bg-zinc-900/50 border-white/10 text-white h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400 flex items-center gap-2"><Ruler size={14} /> Altura (cm)</label>
                                        <Input
                                            type="number"
                                            placeholder="cm"
                                            value={formData.height}
                                            onChange={e => setFormData({ ...formData, height: e.target.value })}
                                            className="bg-zinc-900/50 border-white/10 text-white h-12"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === "goal" && (
                            <motion.div
                                key="goal"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-2xl font-bold text-white mb-2">Qual é o seu objetivo principal?</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {goalsMap.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setFormData({ ...formData, goal: option.value })}
                                            className={cn(
                                                "p-4 rounded-xl border text-left transition-all flex items-center justify-between group",
                                                formData.goal === option.value
                                                    ? "bg-indigo-500/20 border-indigo-500 text-white"
                                                    : "bg-zinc-900/50 border-white/10 text-zinc-400 hover:bg-zinc-800"
                                            )}
                                        >
                                            <span className="font-medium">{option.label}</span>
                                            {formData.goal === option.value && <div className="h-3 w-3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === "experience" && (
                            <motion.div
                                key="experience"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-2xl font-bold text-white mb-2">Experiência e Frequência</h3>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-zinc-300">Nível de Experiência</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {levelsMap.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setFormData({ ...formData, level: option.value })}
                                                className={cn(
                                                    "p-3 rounded-xl border text-center text-sm transition-all",
                                                    formData.level === option.value
                                                        ? "bg-indigo-500/20 border-indigo-500 text-white"
                                                        : "bg-zinc-900/50 border-white/10 text-zinc-400 hover:bg-zinc-800"
                                                )}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <label className="text-sm font-bold text-zinc-300">Dias por Semana</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[2, 3, 4, 5].map((days) => (
                                            <button
                                                key={days}
                                                onClick={() => setFormData({ ...formData, days: days.toString() })}
                                                className={cn(
                                                    "p-3 rounded-xl border text-center font-bold transition-all",
                                                    formData.days === days.toString()
                                                        ? "bg-indigo-500/20 border-indigo-500 text-white"
                                                        : "bg-zinc-900/50 border-white/10 text-zinc-400 hover:bg-zinc-800"
                                                )}
                                            >
                                                {days}x
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-zinc-500 text-center">
                                        *Para 6x/semana (PPLPPL), selecione 5x e adapte o último dia depois.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {step === "processing" && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-12 space-y-6 text-center h-full"
                            >
                                <div className="relative h-24 w-24">
                                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-pulse" />
                                    <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Bot className="text-indigo-400" size={40} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <motion.h3
                                        key={processingText}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xl font-bold text-white"
                                    >
                                        {processingText}
                                    </motion.h3>
                                    <p className="text-sm text-zinc-500">Calculando variáveis e periodização...</p>
                                </div>
                            </motion.div>
                        )}

                        {step === "result" && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 text-green-500 mb-4 border border-green-500/30">
                                        <Activity size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Treino Prescrito com Sucesso!</h3>
                                    <p className="text-zinc-400">
                                        Montamos um plano <strong>{formData.days}x {goalsMap.find(g => g.value === formData.goal)?.label.split('(')[0]}</strong> para seu nível {levelsMap.find(l => l.value === formData.level)?.label.toLowerCase()}.
                                    </p>
                                </div>

                                <div className="grid gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {generatedRoutines.map((routine, i) => (
                                        <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-white">{routine.name} - {routine.focus}</span>
                                                <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded uppercase font-bold">
                                                    {(routine.recurrence?.[0] || "").toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="text-xs text-zinc-500">
                                                {routine.exercises.length} exercícios • {routine.duration}
                                            </div>
                                            <div className="mt-2 text-xs text-zinc-600 line-clamp-2">
                                                {routine.exercises.map((e: any) => e.name).join(", ")}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 h-12 text-lg transform hover:scale-[1.02] transition-all" onClick={handleFinish}>
                                    Aplicar Plano à Agenda
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer buttons */}
                {step !== "processing" && step !== "result" && (
                    <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-zinc-900/50">
                        {step !== "personal" && (
                            <Button variant="ghost" onClick={() => {
                                if (step === "goal") setStep("personal");
                                if (step === "experience") setStep("goal");
                            }}>
                                Voltar
                            </Button>
                        )}
                        <Button
                            onClick={handleNext}
                            className="bg-white text-black hover:bg-zinc-200 px-8"
                            disabled={
                                (step === "personal" && (!formData.age || !formData.weight)) ||
                                (step === "goal" && !formData.goal) ||
                                (step === "experience" && (!formData.level || !formData.days))
                            }
                        >
                            {step === "experience" ? "Gerar Prescrição" : "Próximo"} <ChevronRight size={16} className="ml-2" />
                        </Button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
