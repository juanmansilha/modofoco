"use client";

import { useState, useEffect } from "react";
import { X, Clock, Calendar, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Meal } from "@/app/health/diet/page";
import { cn } from "@/lib/utils";

interface MealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (meal: Partial<Meal>) => void;
    initialData?: Meal | null;
    defaultDate?: string;
    defaultType?: string;
}

const DAYS = [
    { id: "mon", label: "S" },
    { id: "tue", label: "T" },
    { id: "wed", label: "Q" },
    { id: "thu", label: "Q" },
    { id: "fri", label: "S" },
    { id: "sat", label: "S" },
    { id: "sun", label: "D" },
];

export function MealModal({ isOpen, onClose, onSave, initialData, defaultDate, defaultType }: MealModalProps) {
    const [name, setName] = useState("");
    const [time, setTime] = useState("08:00");
    const [type, setType] = useState<any>("breakfast");
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setTime(initialData.time);
            setType(initialData.type);
            setSelectedDays(initialData.recurrence || []);
        } else {
            setName("");
            setTime("08:00");
            setType(defaultType || "breakfast");
            // Default to selected date's day of week if creating new? 
            // For simplicity, empty means 'just this date', or we can interpret.
            // Let's assume empty recurrence = single instance functionality handled by parent,
            // but if user clicks days, it becomes recurring.
            setSelectedDays([]);
        }
    }, [initialData, defaultType, isOpen]);

    const toggleDay = (dayId: string) => {
        if (selectedDays.includes(dayId)) {
            setSelectedDays(selectedDays.filter(d => d !== dayId));
        } else {
            setSelectedDays([...selectedDays, dayId]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            time,
            type,
            recurrence: selectedDays
        });
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">
                                    {initialData ? "Editar Refeição" : "Nova Refeição"}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                <form id="meal-form" onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">O que você vai comer?</label>
                                        <div className="relative">
                                            <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                            <Input
                                                placeholder="Ex: Omelete com café, Aveia..."
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                className="pl-10 bg-black/20 border-white/10 focus:border-green-500/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-400">Horário</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                                <Input
                                                    type="time"
                                                    value={time}
                                                    onChange={(e) => setTime(e.target.value)}
                                                    className="pl-10 bg-black/20 border-white/10 focus:border-green-500/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-400">Tipo</label>
                                            <select
                                                value={type}
                                                onChange={(e) => setType(e.target.value)}
                                                className="w-full h-10 px-3 rounded-md border border-white/10 bg-black/20 text-sm text-white focus:outline-none focus:border-green-500/50"
                                            >
                                                <option value="breakfast">Café da Manhã</option>
                                                <option value="lunch">Almoço</option>
                                                <option value="snack">Lanche</option>
                                                <option value="dinner">Jantar</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                            <Calendar size={14} /> Repetir nos dias
                                        </label>
                                        <div className="flex justify-between gap-1">
                                            {DAYS.map((day) => {
                                                const isSelected = selectedDays.includes(day.id);
                                                return (
                                                    <button
                                                        key={day.id}
                                                        type="button"
                                                        onClick={() => toggleDay(day.id)}
                                                        className={cn(
                                                            "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border",
                                                            isSelected
                                                                ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/50"
                                                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                                                        )}
                                                    >
                                                        {day.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <p className="text-xs text-zinc-500 text-center">
                                            {selectedDays.length === 0 ? "Apenas hoje" : "Vai repetir semanalmente"}
                                        </p>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-zinc-900/50">
                                <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white">
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    form="meal-form"
                                    className="bg-green-600 hover:bg-green-500 text-white border-0 shadow-lg shadow-green-500/20"
                                >
                                    Salvar Refeição
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
