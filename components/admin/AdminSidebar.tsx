"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image"; // Added Image import
import {
    BarChart3,
    Users,
    CreditCard,
    Megaphone,
    MessageSquare,
    LifeBuoy,
    Activity,
    Settings,
    LogOut,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const menuItems = [
    {
        title: "Dashboard",
        icon: BarChart3,
        href: "/admin",
    },
    {
        title: "Usuários",
        icon: Users,
        href: "/admin/users",
    },
    {
        title: "Financeiro",
        icon: CreditCard,
        href: "/admin/finance",
    },
    {
        title: "Marketing",
        icon: Megaphone,
        href: "/admin/marketing",
    },
    {
        title: "Conteúdo",
        icon: MessageSquare,
        href: "/admin/content",
    },
    {
        title: "Suporte",
        icon: LifeBuoy,
        href: "/admin/support",
    },
    {
        title: "Sistema",
        icon: Activity,
        href: "/admin/system",
    },
    {
        title: "Configurações",
        icon: Settings,
        href: "/admin/settings",
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="flex h-screen w-64 flex-col border-r border-white/5 bg-[#0A0A0A] text-zinc-100 shadow-2xl">
            <div className="flex h-20 items-center px-6 border-b border-white/5 bg-gradient-to-rp from-white/1 to-transparent">
                <div className="relative h-8 w-28 opacity-90 hover:opacity-100 transition-opacity">
                    <Image
                        src="/logo-full.png"
                        alt="ModoFoco"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </div>
                <div className="ml-auto flex items-center justify-center px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                    <span className="text-[10px] font-bold tracking-widest text-rose-400 uppercase">Admin</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-1",
                                    isActive
                                        ? "bg-gradient-to-r from-rose-600/20 to-orange-600/10 text-white border border-rose-500/10 shadow-lg shadow-rose-900/10 translate-x-1"
                                        : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                        isActive
                                            ? "text-rose-400"
                                            : "text-zinc-600 group-hover:text-zinc-400"
                                    )}
                                />
                                {item.title}
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-white/5 p-4">
                <button
                    onClick={handleSignOut}
                    className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                    <LogOut className="mr-3 h-5 w-5 text-zinc-400" />
                    Sair
                </button>
            </div>
        </div>
    );
}
