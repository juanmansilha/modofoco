"use client";

import { Trophy, Medal, Award, User } from "lucide-react";

interface RankedUser {
    id: string;
    name: string;
    level: number;
    xp: number;
    avatar_url?: string;
    status: 'online' | 'offline';
}

interface UserRankingProps {
    users: RankedUser[];
}

export function UserRanking({ users }: UserRankingProps) {
    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
            case 1: return <Medal className="w-5 h-5 text-zinc-300" />;
            case 2: return <Award className="w-5 h-5 text-amber-600" />;
            default: return <span className="text-zinc-500 font-mono text-sm">#{index + 1}</span>;
        }
    };

    return (
        <div className="space-y-4">
            {users.map((user, index) => (
                <div
                    key={user.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-zinc-800/30 border border-white/5 hover:bg-zinc-800/50 transition-colors"
                >
                    <div className="w-8 flex justify-center">
                        {getRankIcon(index)}
                    </div>

                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-zinc-400" />
                            )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${user.status === 'online' ? 'bg-green-500' : 'bg-zinc-500'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{user.name}</h4>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-indigo-400 font-bold">Lvl {user.level}</span>
                            <span className="text-xs text-zinc-500">{user.xp.toLocaleString()} XP</span>
                        </div>
                    </div>
                </div>
            ))}

            {users.length === 0 && (
                <div className="text-center py-8 text-zinc-500 text-sm">
                    Nenhum usuário encontrado.
                </div>
            )}
        </div>
    );
}
