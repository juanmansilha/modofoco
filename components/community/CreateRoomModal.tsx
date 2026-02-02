"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { X, Plus, Lock, Globe, Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { InviteUserModal } from "./InviteUserModal";

export function CreateRoomModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);

    // Invite Logic
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [invitedUserIds, setInvitedUserIds] = useState<string[]>([]);

    const handleInvite = (userIds: string[]) => {
        setInvitedUserIds(prev => [...new Set([...prev, ...userIds])]);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        // Here we would call the API to create the room with invitedUserIds
        console.log("Creating room...", { isPrivate, invitedUserIds });

        // Reset and close
        setIsOpen(false);
        setInvitedUserIds([]);
        setIsPrivate(false);
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="bg-white text-black hover:bg-zinc-200 gap-2">
                <Plus size={16} />
                Nova Sala
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md"
                        >
                            <Card className="bg-[#0A0A0A] border-zinc-800">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">Criar Nova Sala</h2>
                                    <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form className="space-y-4" onSubmit={handleCreate}>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Nome da Sala</label>
                                        <Input placeholder="Ex: Design System 2.0" required className="bg-zinc-900 border-zinc-800 focus:border-white/20" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Descrição</label>
                                        <textarea
                                            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700 min-h-[80px] resize-none"
                                            placeholder="Qual o propósito desta sala?"
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-2">
                                        <div
                                            className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all ${!isPrivate ? 'border-white bg-white/5' : 'border-zinc-800 hover:border-zinc-600'}`}
                                            onClick={() => setIsPrivate(false)}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Globe size={16} className={!isPrivate ? "text-white" : "text-zinc-500"} />
                                                <span className={`text-sm font-medium ${!isPrivate ? "text-white" : "text-zinc-500"}`}>Pública</span>
                                            </div>
                                            <p className="text-xs text-zinc-500">Qualquer um pode entrar.</p>
                                        </div>

                                        <div
                                            className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all ${isPrivate ? 'border-red-500 bg-red-500/5' : 'border-zinc-800 hover:border-zinc-600'}`}
                                            onClick={() => setIsPrivate(true)}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Lock size={16} className={isPrivate ? "text-red-500" : "text-zinc-500"} />
                                                <span className={`text-sm font-medium ${isPrivate ? "text-red-500" : "text-zinc-500"}`}>Privada</span>
                                            </div>
                                            <p className="text-xs text-zinc-500">Requer senha para entrar.</p>
                                        </div>
                                    </div>

                                    {isPrivate && (
                                        <div className="space-y-2 pt-2">
                                            <label className="text-sm font-medium text-red-400">Senha de Acesso</label>
                                            <Input type="password" placeholder="Defina uma senha segura" className="bg-zinc-900 border-red-900/50 focus:ring-red-900 focus:border-red-500 text-white" required />
                                        </div>
                                    )}

                                    {/* Invite Section */}
                                    <div className="pt-2">
                                        <label className="text-sm font-medium text-zinc-400 mb-2 block">Convites</label>
                                        <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                                                    <Users size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">Convidar Membros</p>
                                                    <p className="text-xs text-zinc-500">
                                                        {invitedUserIds.length === 0
                                                            ? "Ninguém selecionado"
                                                            : `${invitedUserIds.length} pessoa(s) selecionada(s)`}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="h-8 text-xs"
                                                onClick={() => setIsInviteOpen(true)}
                                            >
                                                {invitedUserIds.length > 0 ? "Editar" : "Selecionar"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 h-10 font-bold">
                                            Criar Sala
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Invite Modal Overlay */}
            <InviteUserModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                onInvite={handleInvite}
                currentMembers={[]} // Empty for new room
            />
        </>
    );
}
