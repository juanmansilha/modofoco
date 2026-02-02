"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, MoreVertical, Trash2, PenSquare, ChevronDown, ChevronUp, Clock, Dumbbell, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface Exercise {
    id: string;
    name: string;
    sets: string;
    reps: string;
    weight: string;
    status: "pending" | "current" | "completed";
}

export interface Routine {
    id: string;
    name: string; // e.g. "Treino A"
    focus: string; // e.g. "Peito e Tríceps"
    duration: string; // e.g. "45-60 min"
    lastPerformed?: string;
    exercises: Exercise[];
    completed?: boolean;
    recurrence?: string[];
}

interface WorkoutRoutineProps {
    routine: Routine;
    onComplete: (id: string) => void;
    onDelete: (id: string) => void;
    onAddExercise: (routineId: string) => void;
}

export function WorkoutRoutine({ routine, onComplete, onDelete, onAddExercise }: WorkoutRoutineProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <Card className={cn("bg-zinc-900/40 border-white/5 overflow-hidden transition-all hover:border-white/10", routine.completed && "opacity-75 border-emerald-500/20")}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/5 bg-zinc-900/50">
                <div
                    className="flex items-center gap-4 cursor-pointer flex-1"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center border font-bold transition-colors",
                        routine.completed
                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                            : "bg-indigo-500/20 border-indigo-500/30 text-indigo-400"
                    )}>
                        {routine.completed ? <Check size={20} /> : routine.name.charAt(routine.name.length - 1)}
                    </div>
                    <div>
                        <h3 className={cn("font-bold flex items-center gap-2", routine.completed ? "text-emerald-400" : "text-white")}>
                            {routine.name}
                            <span className="text-zinc-500 font-normal text-sm mx-1">•</span>
                            <span className="text-zinc-400 font-normal">{routine.focus}</span>
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                            <span className="flex items-center gap-1"><Clock size={12} /> {routine.duration}</span>
                            <span className="flex items-center gap-1"><Dumbbell size={12} /> {routine.exercises.length} exercícios</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 relative">
                    <Button
                        size="sm"
                        disabled={routine.completed}
                        className={cn(
                            "h-9 px-4 hidden sm:flex transition-all",
                            routine.completed
                                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed hover:bg-zinc-800"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!routine.completed) onComplete(routine.id);
                        }}
                    >
                        {routine.completed ? (
                            <>
                                <CheckCircle2 size={14} className="mr-2" /> Concluído
                            </>
                        ) : (
                            <>
                                <Check size={14} className="mr-2" /> Concluir
                            </>
                        )}
                    </Button>

                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                        >
                            <MoreVertical size={16} className="text-zinc-500" />
                        </Button>

                        <AnimatePresence>
                            {isMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsMenuOpen(false);
                                        }}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 top-full mt-1 w-48 bg-[#0A0A0A] border border-white/10 rounded-lg shadow-xl py-1 z-20"
                                    >
                                        <button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 flex items-center gap-2">
                                            <PenSquare size={14} /> Editar Nome
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(routine.id);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                        >
                                            <Trash2 size={14} /> Excluir Treino
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className="p-2 text-zinc-500 hover:text-white sm:hidden"
                    >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>

            {/* Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 space-y-2">
                            {routine.exercises.length === 0 ? (
                                <p className="text-center text-sm text-zinc-500 py-4">Nenhum exercício adicionado.</p>
                            ) : (
                                routine.exercises.map((exercise, index) => (
                                    <div
                                        key={exercise.id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-black/20 hover:bg-black/40 transition-colors border border-transparent hover:border-white/5 group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-zinc-600 text-xs font-bold w-4 text-center">{index + 1}</span>
                                            <div>
                                                <p className="font-medium text-white text-sm">{exercise.name}</p>
                                                <p className="text-xs text-zinc-500">
                                                    {exercise.sets} x {exercise.reps} • {exercise.weight}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-white">
                                                <PenSquare size={12} />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}

                            <Button
                                variant="ghost"
                                className="w-full py-6 border border-dashed border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 hover:bg-white/5 mt-2"
                                onClick={() => onAddExercise(routine.id)}
                            >
                                <Plus size={16} className="mr-2" /> Adicionar Exercício
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
