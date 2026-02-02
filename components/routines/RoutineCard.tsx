"use client";

import { useState } from "react";
import { Edit, Trash2, Sun, Moon, Coffee, CheckSquare, Square, ChevronDown, ChevronUp } from "lucide-react";

interface RoutineStep {
    id: string;
    text: string;
    completed: boolean;
}

interface RoutineCardProps {
    id: string;
    title: string;
    time: string;
    icon: string; // 'sun', 'moon', 'coffee'
    steps: RoutineStep[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onToggleStep: (routineId: string, stepId: string) => void;
}

const getIcon = (iconName: string) => {
    switch (iconName) {
        case "sun": return Sun;
        case "moon": return Moon;
        case "coffee": return Coffee;
        default: return Sun;
    }
};

const getIconColor = (iconName: string) => {
    switch (iconName) {
        case "sun": return "text-yellow-400 bg-yellow-400/10";
        case "moon": return "text-indigo-400 bg-indigo-400/10";
        case "coffee": return "text-orange-400 bg-orange-400/10";
        default: return "text-zinc-400 bg-zinc-800";
    }
};

export function RoutineCard({ id, title, time, icon, steps, onEdit, onDelete, onToggleStep }: RoutineCardProps) {
    const Icon = getIcon(icon);
    const colorClass = getIconColor(icon);
    const [isExpanded, setIsExpanded] = useState(false);

    const completedCount = steps.filter(s => s.completed).length;
    const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

    return (
        <div className="group bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/10 hover:bg-zinc-800/30">
            {/* Header / Summary */}
            <div
                className="p-5 flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${colorClass}`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{time}</span>
                            <h3 className="text-lg font-bold text-white">{title}</h3>
                        </div>
                        <div className="text-xs text-zinc-400 flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span>{completedCount}/{steps.length} passos</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="nav-actions flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(id); }}
                            className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                    <button className="text-zinc-500">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>

            {/* Expanded Checklist */}
            {isExpanded && (
                <div className="border-t border-white/5 bg-black/20 p-4 space-y-2">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group/step"
                            onClick={() => onToggleStep(id, step.id)}
                        >
                            <div className={`transition-colors ${step.completed ? "text-emerald-500" : "text-zinc-600 group-hover/step:text-zinc-400"}`}>
                                {step.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                            </div>
                            <span className={`text-sm flex-1 ${step.completed ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                                {step.text}
                            </span>
                        </div>
                    ))}
                    {steps.length === 0 && (
                        <p className="text-xs text-zinc-500 italic text-center py-2">Nenhum passo definido.</p>
                    )}
                </div>
            )}
        </div>
    );
}
