"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, Footprints, Utensils, Moon, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

const HEALTH_MENU = [
    { name: "Academia", href: "/health/gym", icon: Dumbbell },
    { name: "Corrida", href: "/health/running", icon: Footprints },
    { name: "Alimentação", href: "/health/diet", icon: Utensils },

];

export function HealthSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-80 border-l border-white/5 bg-[#0A0A0A] flex flex-col h-[calc(100vh)] hidden md:flex">
            <div className="p-6 border-b border-white/5">
                <h2 className="font-bold text-white text-lg">Menu Saúde</h2>
                <p className="text-xs text-muted mt-1">Monitore sua evolução.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {HEALTH_MENU.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-lg transition-all group",
                                isActive
                                    ? "bg-white/10 text-white"
                                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                            )}
                        >
                            <Icon size={18} className={cn(isActive ? "text-emerald-500" : "text-zinc-600 group-hover:text-zinc-400")} />
                            <span className="font-medium text-sm">{item.name}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />}
                        </Link>
                    );
                })}
            </div>

            {/* Mini Widget Mockup */}
            <div className="p-6 border-t border-white/5">
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-zinc-400">Hidratação</span>
                        <span className="text-xs font-bold text-blue-400">1.2L / 3L</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[40%]" />
                    </div>
                </div>
            </div>
        </aside>
    );
}
