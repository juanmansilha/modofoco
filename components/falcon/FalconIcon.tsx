"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { FalconChat } from "./FalconChat";
import { cn } from "@/lib/utils";

export function FalconIcon() {
    const { userData } = useGlobalData();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // If enabled, green. If disabled/missing, blink red/yellow or stay gray depending on preference.
    // User requested "vermelho piscando" if not configured.
    const isEnabled = userData.falconEnabled;

    return (
        <div
            className={cn(
                "relative p-2 rounded-full transition-all duration-300",
                isEnabled
                    ? "text-green-500 bg-green-500/10 border border-green-500/20"
                    : "text-zinc-500 bg-zinc-900 border border-white/5"
            )}
            title={isEnabled ? "Falcon Ativo" : "Falcon Inativo (Configure no WhatsApp)"}
        >
            <div className="relative">
                <MessageCircle size={20} />

                {/* Status Dot */}
                {!isEnabled && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse border-2 border-[#0A0A0A]" />
                )}
                {isEnabled && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-[#0A0A0A]" />
                )}
            </div>
        </div>
    );
}
