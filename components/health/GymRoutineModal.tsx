"use client";

import { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GymRoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (routine: any) => void;
    initialData?: any;
    defaultDate?: string;
}

const ALL_DAYS = [
    { id: "mon", label: "Seg" },
    { id: "tue", label: "Ter" },
    { id: "wed", label: "Qua" },
    { id: "thu", label: "Qui" },
    { id: "fri", label: "Sex" },
    { id: "sat", label: "Sáb" },
    { id: "sun", label: "Dom" },
];

export function GymRoutineModal({ isOpen, onClose, onSave, initialData, defaultDate }: GymRoutineModalProps) {
    const [name, setName] = useState("");
    const [focus, setFocus] = useState("");
    const [duration, setDuration] = useState("60");
    const [time, setTime] = useState("07:00");
    const [recurrence, setRecurrence] = useState<string[]>([]);
    const [exercises, setExercises] = useState<any[]>([]);

    // For single-date override or explicit date if no recurrence
    const [specificDate, setSpecificDate] = useState(defaultDate || "");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setFocus(initialData.focus);
                setDuration(initialData.duration);
                setTime(initialData.time || "07:00");
                setRecurrence(initialData.recurrence || []);
                setExercises(initialData.exercises || []);
                setSpecificDate(initialData.date || defaultDate || "");
            } else {
                setName("");
                setFocus("");
                setDuration("60");
                setTime("07:00");
                setRecurrence([]);
                setExercises([]);
                setSpecificDate(defaultDate || "");
            }
        }
    }, [isOpen, initialData, defaultDate]);

    // ... (toggleDay, addExercise, etc) ...

    const toggleDay = (dayId: string) => {
        setRecurrence(prev =>
            prev.includes(dayId)
                ? prev.filter(d => d !== dayId)
                : [...prev, dayId]
        );
    };

    const addExercise = () => {
        setExercises([...exercises, {
            id: `new-${Date.now()}`,
            name: "Novo Exercício",
            sets: "3",
            reps: "10-12",
            weight: "0kg",
            status: "pending"
        }]);
    };

    const updateExercise = (id: string, field: string, value: string) => {
        setExercises(exercises.map(ex =>
            ex.id === id ? { ...ex, [field]: value } : ex
        ));
    };

    const removeExercise = (id: string) => {
        setExercises(exercises.filter(ex => ex.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            focus,
            duration,
            time,
            recurrence,
            exercises,
            date: specificDate
        });
        onClose();
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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h2 className="text-xl font-bold text-white">
                                {initialData ? "Editar Treino" : "Novo Treino"}
                            </h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 custom-scrollbar space-y-6">
                            <form id="gym-routine-form" onSubmit={handleSubmit} className="space-y-4">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nome do Treino</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            placeholder="Ex: Treino A - Peito"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Horário</label>
                                            <input
                                                type="time"
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Duração (min)</label>
                                            <input
                                                type="text"
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                placeholder="Ex: 60"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Foco Muscular</label>
                                        <input
                                            type="text"
                                            value={focus}
                                            onChange={(e) => setFocus(e.target.value)}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            placeholder="Ex: Peito e Tríceps"
                                        />
                                    </div>
                                </div>

                                {/* Recurrence */}
                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                        <Calendar size={14} />
                                        Repetir nos dias:
                                    </label>
                                    <div className="flex justify-between gap-1">
                                        {ALL_DAYS.map((day) => {
                                            const isSelected = recurrence.includes(day.id);
                                            return (
                                                <button
                                                    key={day.id}
                                                    type="button"
                                                    onClick={() => toggleDay(day.id)}
                                                    className={`w-12 h-10 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${isSelected
                                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                                        : "bg-zinc-900 border border-white/5 text-zinc-500 hover:bg-zinc-800"
                                                        }`}
                                                >
                                                    {day.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {recurrence.length === 0 && (
                                        <p className="text-xs text-zinc-500 italic">
                                            Sem repetição. Será agendado apenas para {specificDate.split('-').reverse().join('/')}.
                                        </p>
                                    )}
                                </div>

                                {/* Exercises (Simplified for now) */}
                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Exercícios ({exercises.length})</label>
                                        <button
                                            type="button"
                                            onClick={addExercise}
                                            className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
                                        >
                                            <Plus size={12} /> Adicionar
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                        {exercises.length === 0 && <p className="text-sm text-zinc-600 italic text-center py-4">Nenhum exercício adicionado.</p>}
                                        {exercises.map((ex, idx) => (
                                            <div key={ex.id} className="flex items-center gap-2 bg-zinc-900 p-2 rounded-lg border border-white/5">
                                                <span className="text-xs text-zinc-500 w-4">{idx + 1}.</span>
                                                <input
                                                    value={ex.name}
                                                    onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                                                    className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none"
                                                    placeholder="Nome do exercício"
                                                />
                                                <input
                                                    value={ex.sets}
                                                    onChange={(e) => updateExercise(ex.id, 'sets', e.target.value)}
                                                    className="w-8 bg-black/20 text-center rounded text-xs text-zinc-300 focus:outline-none"
                                                    placeholder="S"
                                                />
                                                <span className="text-zinc-600 text-xs">x</span>
                                                <input
                                                    value={ex.reps}
                                                    onChange={(e) => updateExercise(ex.id, 'reps', e.target.value)}
                                                    className="w-12 bg-black/20 text-center rounded text-xs text-zinc-300 focus:outline-none"
                                                    placeholder="Reps"
                                                />
                                                <button type="button" onClick={() => removeExercise(ex.id)} className="text-zinc-600 hover:text-red-400 p-1">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-zinc-900/50">
                            <button
                                type="submit"
                                form="gym-routine-form"
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                <Save size={18} />
                                Salvar {recurrence.length > 0 ? "Repetições" : "Treino"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
