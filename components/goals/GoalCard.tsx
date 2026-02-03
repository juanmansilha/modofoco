"use client";

import { Edit, Trash2, Calendar, Target, CheckCircle2, Eye } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GoalCardProps {
    id: string;
    title: string;
    description: string;
    targetDate?: Date;
    target_date?: string; // Fallback for DB raw data
    imageUrl?: string;
    image_url?: string; // Fallback for DB raw data
    progress: number; // 0 to 100
    status: string; // 'not_started', 'in_progress', 'completed'
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onView?: (id: string) => void;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "completed": return "bg-emerald-500 text-white";
        case "in_progress": return "bg-indigo-500 text-white";
        default: return "bg-zinc-500 text-zinc-100";
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case "completed": return "Concluída";
        case "in_progress": return "Em Progresso";
        default: return "A Fazer";
    }
};

export function GoalCard({ id, title, description, targetDate, target_date, imageUrl, image_url, progress, status, onEdit, onDelete, onView }: GoalCardProps) {
    const finalImageUrl = imageUrl || image_url;
    const finalTargetDate = targetDate || target_date;

    return (
        <div className="group relative h-[320px] rounded-3xl overflow-hidden border border-white/5 bg-zinc-900 shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:border-white/20">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={finalImageUrl || "/placeholder-goal.jpg"} // Use local placeholder or empty if preferred
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-6">

                {/* Top Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                    {onView && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onView(id); }}
                            className="p-2 bg-black/50 backdrop-blur-md rounded-xl hover:bg-indigo-500 text-white transition-all transform"
                        >
                            <Eye size={16} />
                        </button>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(id); }}
                            className="p-2 bg-black/50 backdrop-blur-md rounded-xl hover:bg-white text-white hover:text-black transition-all"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                            className="p-2 bg-black/50 backdrop-blur-md rounded-xl hover:bg-red-500 text-white transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Badge */}
                <div className={`self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                </div>

                <h3 className="text-2xl font-bold text-white mb-1 leading-tight">{title}</h3>

                <p className="text-zinc-300 text-sm mb-4 line-clamp-2">{description}</p>

                {/* Progress Bar */}
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mb-3 backdrop-blur-sm">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>
                            {(() => {
                                try {
                                    if (!finalTargetDate) return "Sem data";
                                    const date = new Date(finalTargetDate);
                                    if (isNaN(date.getTime())) return "Sem data";
                                    return format(date, "dd MMM yyyy", { locale: ptBR });
                                } catch (e) {
                                    return "Data inválida";
                                }
                            })()}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Target size={14} />
                        <span>{progress}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
