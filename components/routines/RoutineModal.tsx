"use client";

import { useState, useEffect } from "react";
import { X, Save, Sun, Moon, Coffee, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RoutineStep {
    id: string;
    text: string;
    completed: boolean;
}

interface RoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (routine: any) => void;
    initialData?: any;
}

export function RoutineModal({ isOpen, onClose, onSave, initialData }: RoutineModalProps) {
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("07:00");
    const [icon, setIcon] = useState("sun");
    const [steps, setSteps] = useState<RoutineStep[]>([]);
    const [newStepText, setNewStepText] = useState("");
    const [days, setDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);

    const allDays = [
        { id: "mon", label: "S" },
        { id: "tue", label: "T" },
        { id: "wed", label: "Q" },
        { id: "thu", label: "Q" },
        { id: "fri", label: "S" },
        { id: "sat", label: "S" },
        { id: "sun", label: "D" },
    ];

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setTime(initialData.time);
                setIcon(initialData.icon);
                setSteps(initialData.steps || []);
                setDays(initialData.days || ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
            } else {
                setTitle("");
                setTime("07:00");
                setIcon("sun");
                setSteps([]);
                setDays(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
            }
        }
    }, [isOpen, initialData]);

    const toggleDay = (dayId: string) => {
        setDays(prev =>
            prev.includes(dayId)
                ? prev.filter(d => d !== dayId)
                : [...prev, dayId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title,
            time,
            icon,
            steps,
            days
        });
        onClose();
    };

    const addStep = () => {
        if (!newStepText.trim()) return;
        const newStep: RoutineStep = {
            id: Math.random().toString(36).substr(2, 9),
            text: newStepText,
            completed: false
        };
        setSteps([...steps, newStep]);
        setNewStepText("");
    };

    const removeStep = (id: string) => {
        setSteps(steps.filter(s => s.id !== id));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h2 className="text-xl font-bold text-white">
                                {initialData ? "Editar Rotina" : "Nova Rotina"}
                            </h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 custom-scrollbar">
                            <form id="routine-form" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Título</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder="Ex: Ritual Matinal"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Horário</label>
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Ícone</label>
                                        <div className="flex gap-2">
                                            {[
                                                { id: "sun", icon: Sun },
                                                { id: "coffee", icon: Coffee },
                                                { id: "moon", icon: Moon },
                                            ].map((ic) => (
                                                <button
                                                    key={ic.id}
                                                    type="button"
                                                    onClick={() => setIcon(ic.id)}
                                                    className={`flex-1 flex items-center justify-center py-3 rounded-xl border transition-all ${icon === ic.id
                                                            ? "bg-zinc-800 border-white/20 text-white"
                                                            : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-white"
                                                        }`}
                                                >
                                                    <ic.icon size={20} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Dias da Semana</label>
                                    <div className="flex justify-between gap-1">
                                        {allDays.map((day) => {
                                            const isSelected = days.includes(day.id);
                                            return (
                                                <button
                                                    key={day.id}
                                                    type="button"
                                                    onClick={() => toggleDay(day.id)}
                                                    className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${isSelected
                                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                                            : "bg-zinc-900 border border-white/5 text-zinc-500 hover:bg-zinc-800"
                                                        }`}
                                                >
                                                    {day.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Steps Manager */}
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Passos da Rotina</label>

                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={newStepText}
                                            onChange={(e) => setNewStepText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStep())}
                                            className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            placeholder="Adicionar passo..."
                                        />
                                        <button
                                            type="button"
                                            onClick={addStep}
                                            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                                        {steps.length === 0 && (
                                            <div className="text-center py-4 text-zinc-600 text-xs italic">
                                                Nenhum passo adicionado.
                                            </div>
                                        )}
                                        {steps.map(step => (
                                            <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900 border border-white/5 group">
                                                <span className="flex-1 text-sm text-zinc-300">
                                                    {step.text}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeStep(step.id)}
                                                    className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-zinc-900">
                            <button
                                type="submit"
                                form="routine-form"
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                <Save size={18} />
                                Salvar Rotina
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
