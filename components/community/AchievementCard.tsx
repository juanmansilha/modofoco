"use client";

import { Trophy, Medal, Star, Share2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface Achievement {
    title: string;
    description: string;
    type: "workout" | "goal" | "badge";
    icon?: string;
    stats?: { label: string; value: string }[];
}

interface AchievementCardProps {
    achievement: Achievement;
    className?: string;
}

export function AchievementCard({ achievement, className }: AchievementCardProps) {
    return (
        <Card className={cn("overflow-hidden border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent", className)}>
            <div className="p-4 flex gap-4 items-start">
                <div className="h-12 w-12 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 shrink-0">
                    <Trophy className="text-black fill-yellow-200" size={24} />
                </div>

                <div className="flex-1 space-y-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-1">
                                <Star size={10} fill="currentColor" /> Conquista Desbloqueada
                            </span>
                        </div>
                        <h3 className="font-bold text-white text-lg leading-tight">{achievement.title}</h3>
                        <p className="text-sm text-yellow-500/80">{achievement.description}</p>
                    </div>

                    {achievement.stats && achievement.stats.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-lg bg-black/20 border border-yellow-500/10">
                            {achievement.stats.map((stat, i) => (
                                <div key={i}>
                                    <span className="block text-[10px] text-zinc-500 uppercase">{stat.label}</span>
                                    <span className="block text-sm font-bold text-zinc-200">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Decorative BG */}
            <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12 pointer-events-none">
                <Medal size={120} />
            </div>
        </Card>
    );
}
