"use client";

import { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyViewProps {
    routines: any[];
    onEdit: (id: string) => void;
}

const dayMap: Record<string, string> = {
    "mon": "Monday",
    "tue": "Tuesday",
    "wed": "Wednesday",
    "thu": "Thursday",
    "fri": "Friday",
    "sat": "Saturday",
    "sun": "Sunday"
};

const weekDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function WeeklyView({ routines, onEdit }: WeeklyViewProps) {
    return (
        <div className="grid grid-cols-7 gap-1 md:gap-4 overflow-x-auto pb-4">
            {weekDays.map((day) => {
                const dayRoutines = routines.filter(r => r.days?.includes(day) || !r.days); // fallback to all days if undefined
                // sort by time
                dayRoutines.sort((a, b) => a.time.localeCompare(b.time));

                return (
                    <div key={day} className="min-w-[120px] md:min-w-0">
                        <div className="text-center p-3 bg-zinc-900/50 rounded-xl border border-white/5 mb-3">
                            <span className="text-sm font-bold text-zinc-300 block uppercase tracking-wide">
                                {dayMap[day].slice(0, 3)}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {dayRoutines.length === 0 ? (
                                <div className="h-24 rounded-xl border-2 border-dashed border-white/5 flex items-center justify-center">
                                    <span className="text-xs text-zinc-600">Livre</span>
                                </div>
                            ) : (
                                dayRoutines.map(routine => (
                                    <div
                                        key={routine.id}
                                        onClick={() => onEdit(routine.id)}
                                        className="p-3 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 cursor-pointer transition-colors group"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-mono text-zinc-500 bg-black/20 px-1.5 rounded">
                                                {routine.time}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-white leading-tight line-clamp-2">
                                            {routine.title}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
