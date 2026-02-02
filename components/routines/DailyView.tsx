"use client";

import { useEffect, useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { RoutineCard } from "@/components/routines/RoutineCard";

interface DailyViewProps {
    routines: any[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onToggleStep: (routineId: string, stepId: string) => void;
}

const dayMapInverse: Record<string, string> = {
    "Monday": "mon",
    "Tuesday": "tue",
    "Wednesday": "wed",
    "Thursday": "thu",
    "Friday": "fri",
    "Saturday": "sat",
    "Sunday": "sun"
};

export function DailyView({ routines, onEdit, onDelete, onToggleStep }: DailyViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const nextDay = () => setCurrentDate(addDays(currentDate, 1));
    const prevDay = () => setCurrentDate(subDays(currentDate, 1));

    const weekDayName = format(currentDate, "EEEE", { locale: ptBR });
    // @ts-ignore
    const weekDayKey = dayMapInverse[format(currentDate, "EEEE")]; // This mapping is tricky with locales, simplifying below

    // Better way to map JS Date day to our keys
    const getDayKey = (date: Date) => {
        const d = date.getDay(); // 0 = Sun, 1 = Mon...
        const map = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        return map[d];
    };

    const currentDayKey = getDayKey(currentDate);

    const todaysRoutines = routines.filter(r => r.days?.includes(currentDayKey) || !r.days);
    todaysRoutines.sort((a, b) => a.time.localeCompare(b.time));

    return (
        <div className="space-y-6">
            {/* Day Navigator */}
            <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                <button onClick={prevDay} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <ChevronLeft size={24} />
                </button>

                <div className="text-center">
                    <h2 className="text-xl font-bold text-white capitalize">
                        {format(currentDate, "EEEE", { locale: ptBR })}
                    </h2>
                    <p className="text-zinc-500 text-sm">
                        {format(currentDate, "d 'de' MMMM", { locale: ptBR })}
                    </p>
                </div>

                <button onClick={nextDay} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Timeline */}
            <div className="space-y-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-white/5" />

                {todaysRoutines.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-zinc-500">Nenhuma rotina para este dia.</p>
                    </div>
                ) : (
                    todaysRoutines.map((routine) => (
                        <div key={routine.id} className="relative z-10 pl-16 md:pl-20">
                            {/* Time Bubble */}
                            <div className="absolute left-0 top-6 w-12 md:w-16 flex justify-center">
                                <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-950 border border-white/10 px-2 py-1 rounded-lg">
                                    {routine.time}
                                </span>
                            </div>

                            <RoutineCard
                                {...routine}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onToggleStep={onToggleStep}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
