"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { FalconConfigModal } from "./FalconConfigModal";

export function FalconIcon() {
    const { userData } = useGlobalData();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Status check
    // If falconEnabled is strictly true, it's green.
    // If undefined or false, it's red/disconnected.
    const isConnected = userData?.falconEnabled === true;

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={cn(
                    "relative p-2 rounded-full transition-all duration-300 group",
                    isConnected
                        ? "text-green-500 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20"
                        : "text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
                )}
                title={isConnected ? "Falcon Ativo (Clique para configurar)" : "Falcon Desconectado (Clique para conectar)"}
            >
                <div className="relative">
                    <MessageCircle size={20} />

                    {/* Status Dot */}
                    <span className={cn(
                        "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0A0A0A]",
                        isConnected ? "bg-green-500" : "bg-red-500 animate-pulse"
                    )} />
                </div>
            </button>

            <FalconConfigModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
