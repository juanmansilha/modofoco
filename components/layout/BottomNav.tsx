import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Activity, DollarSign, Dumbbell, Footprints, Utensils, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tarefas", href: "/tasks", icon: CheckSquare },
    {
        name: "Saúde",
        href: "/health",
        icon: Activity,
        isMenu: true,
        subItems: [
            { name: "Academia", href: "/health/gym", icon: Dumbbell },
            { name: "Corrida", href: "/health/running", icon: Footprints },
            { name: "Dieta", href: "/health/diet", icon: Utensils },
        ]
    },
    { name: "Financeiro", href: "/finance", icon: DollarSign },
];

interface BottomNavProps {
    openMobileMenu: () => void;
}

export function BottomNav({ openMobileMenu }: BottomNavProps) {
    const pathname = usePathname();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    return (
        <>
            {/* Submenu Overlay */}
            <AnimatePresence>
                {activeMenu === "Saúde" && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setActiveMenu(null)}
                        />
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-20 left-4 right-4 bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 z-50 md:hidden shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Activity size={16} className="text-rose-500" />
                                    Menu Saúde
                                </h3>
                                <button onClick={() => setActiveMenu(null)} className="p-1 rounded-full hover:bg-white/10 text-zinc-500">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {navItems.find(i => i.name === "Saúde")?.subItems?.map((sub) => (
                                    <Link
                                        key={sub.href}
                                        href={sub.href}
                                        onClick={() => setActiveMenu(null)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-white/5 transition-all",
                                            pathname === sub.href
                                                ? "bg-rose-500/10 border-rose-500/50 text-white"
                                                : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                                        )}
                                    >
                                        <sub.icon size={20} className={cn(pathname === sub.href ? "text-rose-500" : "text-zinc-500")} />
                                        <span className="text-xs font-medium">{sub.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#050505]/90 backdrop-blur-xl border-t border-white/5 z-50 md:hidden flex items-center justify-around px-2 pb-safe">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    // Check if active (excluding subitems logic for the bottom bar icon highlight)
                    const isActive = pathname === item.href || (item.subItems && pathname.startsWith(item.href));

                    if (item.isMenu) {
                        return (
                            <button
                                key={item.name}
                                onClick={() => setActiveMenu(activeMenu === item.name ? null : item.name)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2 rounded-xl transition-all w-16 gap-1",
                                    isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-lg transition-all",
                                    isActive && "bg-rose-500/10 text-rose-500",
                                    activeMenu === item.name && "bg-rose-500 text-white"
                                )}>
                                    <Icon size={20} className={cn(
                                        isActive && !activeMenu ? "text-rose-400" : "",
                                        activeMenu === item.name ? "text-white" : ""
                                    )} />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-medium tracking-wide",
                                    isActive ? "text-white" : "text-zinc-500"
                                )}>
                                    {item.name}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-xl transition-all w-16 gap-1",
                                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-lg transition-all",
                                isActive && "bg-indigo-500/10"
                            )}>
                                <Icon size={20} className={isActive ? "text-indigo-400" : ""} />
                            </div>
                            <span className="text-[10px] font-medium tracking-wide">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </>
    );
}
