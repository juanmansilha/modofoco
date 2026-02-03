"use client";

import Link from "next/link";
import Image from "next/image"; // Added import
import { Bell, LogOut, ChevronRight, Trophy, Search, Menu } from "lucide-react"; // Merged lucide-react imports
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { useGamification } from "@/contexts/GamificationContext";
import { NotificationPanel } from "@/components/ui/NotificationPanel";
import { useGlobalData } from "@/contexts/GlobalDataProvider"; // Added import
import { FalconIcon } from "@/components/falcon/FalconIcon"; // Added import

export function TopBar() {
    const [showNotifications, setShowNotifications] = useState(false);
    const { unreadCount } = useNotifications();
    const { fp, level, progress } = useGamification();

    return (
        <header className="h-20 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
            {/* Left side - Logo (Mobile) & Breadcrumbs */}
            <div className="flex items-center gap-4">
                {/* Mobile Logo */}
                <div className="relative h-8 w-28 md:hidden block">
                    <Image
                        src="/logo-v2.png"
                        alt="ModoFoco"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </div>
            </div>

            {/* Right side - Actions & Profile */}
            <div className="flex items-center gap-6">

                {/* ZP Stats */}
                <Link href="/rewards" className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 hover:bg-white/10 transition-colors group">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center border border-white/10 shadow-lg">
                        <Trophy size={14} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nível {level}</span>
                            <span className="text-[10px] font-bold text-amber-400">{fp} FP</span>
                        </div>
                        <div className="h-1 w-24 bg-black rounded-full overflow-hidden mt-1">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-amber-600"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </Link>

                <div className="h-8 w-px bg-white/10" />

                <FalconIcon />

                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={cn(
                            "relative p-2 text-zinc-500 hover:text-white transition-colors group rounded-full hover:bg-white/5",
                            showNotifications && "bg-white/10 text-white"
                        )}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-black animate-pulse" />
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50">
                                <NotificationPanel onClose={() => setShowNotifications(false)} />
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 group cursor-pointer">
                    <Link href="/settings" className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Juan Libertino</p>
                            <p className="text-[10px] text-zinc-500">Membro Pro</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-white/10 shadow-lg group-hover:scale-105 transition-transform" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
