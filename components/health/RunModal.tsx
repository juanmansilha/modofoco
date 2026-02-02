"use client";

import { useState, useEffect } from "react";
import { X, Calendar, MapPin, Trophy, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { format } from "date-fns";
import { RunSession } from "@/app/health/running/page";

interface RunModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (run: Partial<RunSession>) => void;
    initialData?: RunSession | null;
    defaultDate?: string;
}

export function RunModal({ isOpen, onClose, onSave, initialData, defaultDate }: RunModalProps) {
    const [formData, setFormData] = useState<Partial<RunSession>>({
        title: "",
        date: defaultDate || format(new Date(), "yyyy-MM-dd"),
        time: "06:00",
        duration: "00:00",
        dist: 0,
        calories: 0
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                title: "",
                date: defaultDate || format(new Date(), "yyyy-MM-dd"),
                time: "06:00",
                duration: "00:00",
                dist: 0,
                calories: 0
            });
        }
    }, [initialData, defaultDate, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">
                                    {initialData ? "Editar Corrida" : "Nova Corrida"}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <form id="run-form" onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-400">Nome do Treino</label>
                                            <Input
                                                placeholder="Ex: Corrida Leve, Tiro de 1km..."
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                                className="bg-black/20 border-white/10 focus:border-orange-500/50"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-400">Data</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                                    <Input
                                                        type="date"
                                                        value={formData.date}
                                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                        className="pl-10 bg-black/20 border-white/10 focus:border-orange-500/50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-400">Horário</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                                    <Input
                                                        type="time"
                                                        value={formData.time}
                                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                        className="pl-10 bg-black/20 border-white/10 focus:border-orange-500/50"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-400">Distância (km)</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.0"
                                                        value={formData.dist || ""}
                                                        onChange={(e) => setFormData({ ...formData, dist: parseFloat(e.target.value) })}
                                                        className="pl-10 bg-black/20 border-white/10 focus:border-orange-500/50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-400">Duração (Opcional)</label>
                                                <Input
                                                    placeholder="MM:SS"
                                                    value={formData.duration}
                                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                    className="bg-black/20 border-white/10 focus:border-orange-500/50"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-400">Calorias (Opcional)</label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={formData.calories || ""}
                                                onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                                                className="bg-black/20 border-white/10 focus:border-orange-500/50"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-zinc-900/50">
                                <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white">
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    form="run-form"
                                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white border-0 shadow-lg shadow-orange-500/20"
                                >
                                    <Trophy size={18} className="mr-2" />
                                    Salvar Corrida
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
