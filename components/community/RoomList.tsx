"use client";

import { Card } from "@/components/ui/Card";
import { Users, Lock, Globe, MessageSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock Data
const MOCK_ROOMS = [
    { id: "geral", name: "Geral", type: "general", members: 1240, description: "A praça pública do Clube. Respeite as regras." },
    { id: "design", name: "Design & UI", type: "public", members: 342, description: "Discussões sobre estética e interfaces." },
    { id: "business", name: "Business", type: "public", members: 89, description: "Estratégias de negócios e vendas." },
    { id: "vip", name: "VIP Lounge", type: "private", members: 12, description: "Acesso restrito a membros fundadores." },
    { id: "crypto", name: "Crypto Alpha", type: "private", members: 56, description: "Análises de mercado." },
];

export function RoomList() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_ROOMS.map((room) => (
                <Link key={room.id} href={`/community/${room.id}`}>
                    <Card className="h-full hover:border-zinc-700 transition-all cursor-pointer group bg-zinc-900/30">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    room.type === 'general' ? "bg-white/10 text-white" :
                                        room.type === 'private' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                                )}>
                                    {room.type === 'general' && <Globe size={20} />}
                                    {room.type === 'public' && <Users size={20} />}
                                    {room.type === 'private' && <Lock size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white group-hover:text-zinc-200 transition-colors">{room.name}</h3>
                                    <p className="text-xs text-muted capitalize">{room.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                                <Users size={12} />
                                <span>{room.members}</span>
                            </div>
                        </div>

                        <p className="mt-4 text-sm text-zinc-400 line-clamp-2">
                            {room.description}
                        </p>

                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                            <div className="flex items-center gap-1 group-hover:text-white transition-colors">
                                <MessageSquare size={12} />
                                <span>Entrar na sala</span>
                            </div>
                            {room.type === 'private' && (
                                <span className="text-red-500/70 flex items-center gap-1">
                                    <Lock size={10} /> Senha
                                </span>
                            )}
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
