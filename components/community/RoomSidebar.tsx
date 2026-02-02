"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Search, Globe, Users, Lock, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { CreateRoomModal } from "@/components/community/CreateRoomModal";

// Using the same mock data for now, shared source of truth ideally in a store
const MOCK_ROOMS = [
    { id: "geral", name: "Geral", type: "general", members: 1240 },
    { id: "design", name: "Design & UI", type: "public", members: 342 },
    { id: "business", name: "Business", type: "public", members: 89 },
    { id: "vip", name: "VIP Lounge", type: "private", members: 12 },
    { id: "crypto", name: "Crypto Alpha", type: "private", members: 56 },
];

export function RoomSidebar() {
    const params = useParams();
    const currentRoomId = params?.roomId as string; // /community/[roomId]
    const [search, setSearch] = useState("");

    const filteredRooms = MOCK_ROOMS.filter(room =>
        room.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <aside className="w-80 border-l border-white/5 bg-[#0A0A0A] flex flex-col h-[calc(100vh)] hidden md:flex">
            <div className="p-4 border-b border-white/5 space-y-4">
                <h2 className="font-bold text-white text-lg">Salas</h2>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Buscar salas..."
                        className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <CreateRoomModal />
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredRooms.map((room) => {
                    const isActive = currentRoomId === room.id || (room.id === 'geral' && !currentRoomId);

                    return (
                        <Link
                            key={room.id}
                            href={`/community/${room.id}`}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-lg transition-all group",
                                isActive
                                    ? "bg-white/10 text-white"
                                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-1.5 rounded-md",
                                    room.type === 'general' ? "bg-zinc-800 text-white" :
                                        room.type === 'private' ? "bg-red-900/20 text-red-500" : "bg-blue-900/20 text-blue-500"
                                )}>
                                    {room.type === 'general' && <Globe size={14} />}
                                    {room.type === 'public' && <Users size={14} />}
                                    {room.type === 'private' && <Lock size={14} />}
                                </div>
                                <span className="font-medium text-sm">{room.name}</span>
                            </div>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 text-xs text-center text-zinc-600 border-t border-white/5">
                Running on ModoFoco v0.1
            </div>
        </aside>
    );
}
