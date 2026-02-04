"use client";

import { useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { FalconChat } from "./FalconChat";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalDataProvider";

export function FalconFloatingButton() {
    const [isOpen, setIsOpen] = useState(false);
    const { userData } = useGlobalData();

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-105 active:scale-95 group",
                    "bg-[#0A0A0A] border border-white/10 hover:border-indigo-500/50"
                )}
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Icon */}
                <div className="relative text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    <Sparkles size={24} className={cn("transition-transform duration-500", isOpen ? "rotate-90 scale-0" : "scale-100")} />
                    <MessageCircle size={24} className={cn("absolute inset-0 transition-transform duration-500", isOpen ? "scale-100" : "-rotate-90 scale-0")} />
                </div>

                {/* Status Dot */}
                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </button>

            <FalconChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
