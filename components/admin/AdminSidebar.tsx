"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
        <div className="flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100">
            <div className="flex h-16 items-center border-b border-zinc-800 px-6">
                <ShieldAlert className="mr-2 h-6 w-6 text-red-500" />
                <span className="text-lg font-bold tracking-tight">Admin OS</span>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-zinc-800 text-white"
                                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0",
                                    pathname === item.href
                                        ? "text-white"
                                        : "text-zinc-400 group-hover:text-white"
                                )}
                            />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="border-t border-zinc-800 p-4">
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
