import { useState } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface WeeklyCalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    // Map of date string (YYYY-MM-DD) to status/data indicator
    // 'completed' | 'planned' | 'none'
    dots?: Record<string, string>;
}

export function WeeklyCalendar({ selectedDate, onSelectDate, dots = {} }: WeeklyCalendarProps) {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday start

    const days = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

    const handlePrevWeek = () => setCurrentWeekStart(prev => addDays(prev, -7));
    const handleNextWeek = () => setCurrentWeekStart(prev => addDays(prev, 7));

    return (
        <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-400 font-medium flex items-center gap-2">
                    <CalendarIcon size={16} />
                    {format(currentWeekStart, "MMMM yyyy", { locale: ptBR })}
                </h3>
                <div className="flex gap-1">
                    <button onClick={handlePrevWeek} className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleNextWeek} className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    const dateKey = format(day, "yyyy-MM-dd");
                    const dotStatus = dots[dateKey];

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onSelectDate(day)}
                            className={`
                                relative flex flex-col items-center justify-center py-3 rounded-xl transition-all
                                ${isSelected ? "bg-white text-black font-bold shadow-lg scale-105" : "bg-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200"}
                                ${isToday && !isSelected ? "border border-indigo-500/50 text-indigo-400" : ""}
                            `}
                        >
                            <span className="text-[10px] uppercase mb-1 opacity-60">
                                {format(day, "EEE", { locale: ptBR })}
                            </span>
                            <span className="text-lg">
                                {format(day, "d")}
                            </span>

                            {/* Indicator Dot */}
                            {dotStatus && (
                                <div className="absolute bottom-1.5 flex gap-0.5">
                                    {dotStatus === 'completed' && (
                                        <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-black" : "bg-emerald-500"}`} />
                                    )}
                                    {dotStatus === 'planned' && (
                                        <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-black/30" : "bg-zinc-600"}`} />
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
