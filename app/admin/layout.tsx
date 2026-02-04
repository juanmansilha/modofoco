"use client";

import { ReactNode, useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [debugMessage, setDebugMessage] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                console.log("No session found");
                setDebugMessage("Sessão não encontrada. Você não está logado.");
                setLoading(false);
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .single();

            if (!profile || !["admin", "super_admin"].includes(profile.role)) {
                console.warn("User is not admin:", profile?.role);
                setDebugMessage(`Usuário logado, mas sem permissão. Role atual: '${profile?.role || "null"}'`);
                setLoading(false);
                return;
            }

            setIsAuthorized(true);
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
                Carregando Admin OS...
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-zinc-950 text-white gap-4">
                <h1 className="text-xl font-bold text-red-500">Acesso Restrito (Debug Mode)</h1>
                <p>O sistema detectou que você não tem permissão ou não está logado.</p>
                <div className="p-4 bg-zinc-900 rounded border border-zinc-800 text-sm font-mono text-zinc-400">
                    STATUS: {debugMessage || "Desconhecido"}
                </div>
                <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-white"
                >
                    Ir para Login
                </button>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-zinc-900">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto bg-zinc-950 p-8 text-zinc-100">
                {children}
            </main>
        </div>
    );
}
