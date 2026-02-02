"use client";

import Image from "next/image";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import {
    LayoutDashboard,
    Users,
    Activity,
    DollarSign,
    CheckSquare,
    Target,
    Archive,
    BookOpen,
    Briefcase,
    Repeat,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Trophy,
    Dumbbell,
    Footprints,
    Utensils,
    Moon,
    Droplets,
    ChevronDown,
    Layers,
    LifeBuoy, // Added import
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
    {
        name: "Geral",
        href: "/dashboard",
        icon: LayoutDashboard
    },
    { name: "Tarefas", href: "/tasks", icon: CheckSquare },
    {
        name: "Saúde",
        href: "/health",
        icon: Activity,
        subItems: [
            { name: "Academia", href: "/health/gym", icon: Dumbbell },
            { name: "Corrida", href: "/health/running", icon: Footprints },
            { name: "Alimentação", href: "/health/diet", icon: Utensils },

        ]
    },
    { name: "Financeiro", href: "/finance", icon: DollarSign },
    { name: "Baú", href: "/vault", icon: Archive },
    { name: "Recursos", href: "/resources", icon: Layers },
    { name: "Metas", href: "/goals", icon: Target },
    { name: "Estudo", href: "/study", icon: BookOpen },
    { name: "Rotinas", href: "/routines", icon: Repeat },
    { name: "Recompensas", href: "/rewards", icon: Trophy },
    { name: "Suporte", href: "/support", icon: LifeBuoy },
];

import { useState } from "react";
import { AnimatePresence } from "framer-motion";

interface SidebarProps {
    isCollapsed?: boolean;
    toggleSidebar?: () => void;
    isMobile?: boolean; // New prop
}

export function Sidebar({ isCollapsed = false, toggleSidebar, isMobile = false }: SidebarProps) {
    const pathname = usePathname();
    const { logout } = useGlobalData();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleExpand = (name: string, e: React.MouseEvent) => {
        e.preventDefault();
        setExpandedItems(prev =>
            prev.includes(name)
                ? prev.filter(item => item !== name)
                : [...prev, name]
        );
    };

    return (
        <aside
            className={cn(
                "h-screen border-r border-white/5 bg-black/50 backdrop-blur-xl flex flex-col z-50 transition-all duration-300 ease-in-out",
                // Desktop: Fixed positioning
                !isMobile && "fixed left-0 top-0",
                // Mobile: Full width/height within its container
                isMobile && "w-full h-full bg-black/95",
                // Sizing Logic
                !isMobile && (isCollapsed ? "w-20" : "w-20 md:w-64")
            )}
        >
            {/* Header: Logo + Toggle */}
            <div className="p-6 flex items-center justify-center md:justify-start gap-2 h-20 relative">
                {/* Mobile Icon */}
                <div className={cn("h-8 w-8 bg-white rounded-full flex items-center justify-center shrink-0 transition-all",
                    !isCollapsed && "md:hidden",
                    isCollapsed && "hidden"
                )}>
                    <div className="h-3 w-3 bg-black rounded-full" />
                </div>

                {/* Desktop Logo */}
                <div className={cn("hidden relative h-8 w-full transition-opacity duration-300", !isCollapsed && "md:block mr-2")}>
                    <Image
                        src="/logo-v2.png"
                        alt="ModoFoco"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </div>

                {/* Desktop Toggle (Hide if mobile) */}
                {!isMobile && (
                    <div className={cn(
                        "hidden md:flex items-center gap-1",
                        isCollapsed && "flex-col gap-2 mt-2"
                    )}>
                        <button
                            onClick={toggleSidebar}
                            className="p-2 text-zinc-600 hover:text-white transition-colors"
                        >
                            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        </button>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    // @ts-ignore
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isExpanded = expandedItems.includes(item.name);
                    const isActive = pathname === item.href || (hasSubItems && pathname.startsWith(item.href));

                    return (
                        <div key={item.name}>
                            <Link
                                href={hasSubItems ? "#" : item.href}
                                onClick={(e) => hasSubItems ? toggleExpand(item.name, e) : null}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative cursor-pointer",
                                    isActive && !hasSubItems
                                        ? "bg-white/10 text-white shadow-lg shadow-white/5"
                                        : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={20} className={cn("transition-colors shrink-0", isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-200")} />
                                    <span className={cn(
                                        "font-medium transition-all duration-300 overflow-hidden whitespace-nowrap",
                                        isCollapsed ? "w-0 opacity-0 hidden" : "hidden md:block w-auto opacity-100"
                                    )}>
                                        {item.name}
                                    </span>
                                </div>

                                {hasSubItems && !isCollapsed && (
                                    <ChevronDown
                                        size={16}
                                        className={cn(
                                            "transition-transform duration-200",
                                            isExpanded ? "rotate-180" : ""
                                        )}
                                    />
                                )}

                                {/* Tooltip for collapsed mode */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                        {item.name}
                                    </div>
                                )}
                            </Link>

                            {/* Sub Items */}
                            <AnimatePresence>
                                {hasSubItems && isExpanded && !isCollapsed && (
                                    <div className="ml-9 mt-1 space-y-1 overflow-hidden">
                                        {/* @ts-ignore */}
                                        {item.subItems.map((subItem) => {
                                            const SubIcon = subItem.icon;
                                            const isSubActive = pathname === subItem.href;

                                            return (
                                                <Link
                                                    key={subItem.href}
                                                    href={subItem.href}
                                                    className={cn(
                                                        "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200",
                                                        isSubActive
                                                            ? "text-white bg-white/5"
                                                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                                    )}
                                                >
                                                    <SubIcon size={16} />
                                                    <span className="text-sm font-medium">{subItem.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5 space-y-2">
                <button
                    onClick={async () => {
                        await logout();
                        window.location.href = "/login";
                    }}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 w-full transition-all",
                        isCollapsed && "justify-center px-2"
                    )}>
                    <LogOut size={20} className="shrink-0" />
                    <span className={cn(
                        "font-medium transition-all duration-300 overflow-hidden whitespace-nowrap",
                        isCollapsed ? "w-0 opacity-0 hidden" : "hidden md:block w-auto opacity-100"
                    )}>
                        Sair
                    </span>
                </button>
            </div>
        </aside>
    );
}
