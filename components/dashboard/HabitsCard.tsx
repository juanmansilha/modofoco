import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

interface HabitsCardProps {
    completed: number;
    total: number;
}

export function HabitsCard({ completed, total }: HabitsCardProps) {
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return (
        <Card className="col-span-1 bg-zinc-900/30 border-white/5 p-6 flex flex-col justify-between group hover:border-blue-500/20 transition-all h-full">
            <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400 font-medium">Hábitos Hoje</p>
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:text-blue-400 transition-colors">
                    <CheckCircle2 size={18} />
                </div>
            </div>
            <div>
                <div className="flex items-end gap-2 mb-3">
                    <span className="text-2xl font-bold text-white tracking-tight">{completed}</span>
                    <span className="text-sm text-zinc-500 mb-1">/ {total}</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-blue-500 h-full rounded-full"
                    />
                </div>
            </div>
        </Card>
    );
}
