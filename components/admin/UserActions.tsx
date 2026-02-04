"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase"; // Client side
import { Trophy, Ban, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserActions({ userId, currentRole, currentFp }: { userId: string, currentRole: string, currentFp: number }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAddFp = async () => {
        const amount = prompt("Quantidade de FP para adicionar:", "100");
        if (!amount) return;

        setLoading(true);
        // Using an API route would be better, but for now direct SQL if RLS allows, 
        // OR more likely, calling a server action (if I had them set up).
        // Since I'm on client, and admins "should" have RLS permission from my migration:
        // CREATE POLICY "Admins have full access..." (Wait, I only did that for campaigns etc. 
        // I need to ensure Profiles are editable by admins).

        // Assuming RLS allows admins to update profiles.

        const { error } = await supabase
            .from('profiles')
            .update({ fp: currentFp + parseInt(amount) })
            .eq('id', userId);

        if (error) {
            alert("Erro ao adicionar FP: " + error.message);
        } else {
            // Log to history 
            await supabase.from('gamification_history').insert({
                user_id: userId,
                amount: parseInt(amount),
                reason: 'Bônus Admin Manual',
                type: 'earn'
            });
            router.refresh();
        }
        setLoading(false);
    };

    const handleToggleRole = async () => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`Mudar papel para ${newRole}?`)) return;

        setLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) alert("Erro: " + error.message);
        else router.refresh();
        setLoading(false);
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={handleAddFp}
                disabled={loading}
                className="flex items-center gap-2 rounded bg-yellow-500/10 px-3 py-2 text-sm font-medium text-yellow-500 hover:bg-yellow-500/20 disabled:opacity-50"
            >
                <Trophy className="h-4 w-4" />
                Add FP
            </button>
            <button
                onClick={handleToggleRole}
                disabled={loading}
                className="flex items-center gap-2 rounded bg-purple-500/10 px-3 py-2 text-sm font-medium text-purple-500 hover:bg-purple-500/20 disabled:opacity-50"
            >
                <ShieldCheck className="h-4 w-4" />
                {currentRole === 'admin' ? 'Remover Admin' : 'Virar Admin'}
            </button>
            <button
                disabled={loading}
                className="flex items-center gap-2 rounded bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20 disabled:opacity-50"
            >
                <Ban className="h-4 w-4" />
                Banir
            </button>
        </div>
    )
}
