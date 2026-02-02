"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, UserPlus, Check } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// Mock Users Database
const MOCK_USERS = [
    { id: "1", name: "Ana Silva", username: "@ana.silva", avatar: "bg-purple-500" },
    { id: "2", name: "Carlos Oliveira", username: "@carlos.o", avatar: "bg-blue-500" },
    { id: "3", name: "Beatriz Santos", username: "@bea.santos", avatar: "bg-green-500" },
    { id: "4", name: "Daniel Costa", username: "@dani.costa", avatar: "bg-red-500" },
    { id: "5", name: "Eduardo Lima", username: "@du.lima", avatar: "bg-yellow-500" },
];

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (userIds: string[]) => void;
    currentMembers?: string[]; // IDs of members already in room
}

export function InviteUserModal({ isOpen, onClose, onInvite, currentMembers = [] }: InviteUserModalProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const filteredUsers = MOCK_USERS.filter(user =>
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase())) &&
        !currentMembers.includes(user.id)
    );

    const toggleUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleInvite = () => {
        onInvite(selectedUsers);
        onClose();
        setSelectedUsers([]);
        setSearchTerm("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Convidar Membros</h3>
                    <button onClick={onClose}><X className="text-zinc-500 hover:text-white" /></button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <Input
                            placeholder="Buscar por nome ou @usuário"
                            className="pl-10 bg-zinc-900/50 border-white/10 text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredUsers.length === 0 ? (
                            <p className="text-center text-zinc-500 py-4">Nenhum usuário encontrado.</p>
                        ) : (
                            filteredUsers.map(user => {
                                const isSelected = selectedUsers.includes(user.id);
                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => toggleUser(user.id)}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                                            isSelected
                                                ? "bg-indigo-500/20 border-indigo-500"
                                                : "bg-zinc-900/30 border-white/5 hover:bg-zinc-800"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full ${user.avatar} flex items-center justify-center text-white font-bold text-sm`}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white text-sm">{user.name}</p>
                                                <p className="text-xs text-zinc-500">{user.username}</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "h-6 w-6 rounded-full border flex items-center justify-center transition-colors",
                                            isSelected ? "bg-indigo-500 border-indigo-500" : "border-zinc-600"
                                        )}>
                                            {isSelected && <Check size={14} className="text-white" />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <Button
                        onClick={handleInvite}
                        className="w-full bg-white text-black hover:bg-zinc-200"
                        disabled={selectedUsers.length === 0}
                    >
                        Convidar {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
