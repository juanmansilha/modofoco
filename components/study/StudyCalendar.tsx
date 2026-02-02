"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, GraduationCap, PlayCircle, Book, Folder } from "lucide-react";

interface StudyCalendarProps {
    subjects: any[];
}

const categoryIcons = {
    college: GraduationCap,
    course: PlayCircle,
    book: Book,
    other: Folder
};

const categoryColors = {
    college: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    course: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    book: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    other: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
};

export function StudyCalendar({ subjects }: StudyCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const startDate = startOfWeek(startOfMonth(currentDate));
    const endDate = endOfWeek(endOfMonth(currentDate));

    // Create matrix of days
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const getEventsForDay = (date: Date) => {
        return subjects.filter(subject =>
            subject.dueDate && isSameDay(new Date(subject.dueDate), date)
        );
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    return (
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white capitalize">
                    {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                {/* Week Headers */}
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                    <div key={day} className="bg-zinc-900 p-3 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}

                {/* Days */}
                {days.map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    const events = getEventsForDay(day);

                    return (
                        <div
                            key={day.toString()}
                            className={`min-h-[120px] p-2 bg-zinc-900 hover:bg-zinc-800/50 transition-colors ${!isCurrentMonth ? "opacity-30" : ""}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span
                                    className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "text-zinc-400"
                                        }`}
                                >
                                    {format(day, "d")}
                                </span>
                            </div>

                            {/* Events */}
                            <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                                {events.map((subject) => (
                                    <div
                                        key={subject.id}
                                        className={`px-2 py-1.5 rounded border text-[10px] truncate font-medium flex items-center gap-1.5 ${
                                            // @ts-ignore
                                            categoryColors[subject.category] || categoryColors.other
                                            }`}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                                        <span className="truncate">{subject.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
