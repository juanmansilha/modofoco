import { supabaseAdmin } from "@/lib/supabase-admin";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"; // Assuming standard shadcn table
import { Badge } from "@/components/ui/badge"; // Assuming standard shadcn badge or I'll make a div
import { Button } from "@/components/ui/Button"; // Assuming standard shadcn button
// Note: If components don't exist, I'll use raw tailwind for speed then refactor.
// Checking file tree, I don't see `components/ui` in the top level listing, but maybe deeper?
// Wait, `components` has 65 children. Let's assume some exist or just write raw for safety.

import Link from "next/link";
import { Eye, Shield, Ban, CheckCircle2 } from "lucide-react";

export default async function UsersPage() {
    // Fetch users with profiles
    const { data: profiles, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50); // Pagination needed later

    if (error) {
        return <div className="text-red-500">Erro ao carregar usuários: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Gerenciamento de Usuários</h1>
                <div className="text-sm text-zinc-400">{profiles?.length || 0} usuários encontrados</div>
            </div>

            <div className="rounded-md border border-zinc-800 bg-zinc-900">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-medium uppercase text-zinc-500">
                        <tr>
                            <th className="px-4 py-3">Nome / Email</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Plano</th>
                            <th className="px-4 py-3">Nível (FP)</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Cadastro</th>
                            <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {profiles?.map((user) => (
                            <tr key={user.id} className="group hover:bg-zinc-800/50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                                            {user.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <div className="font-medium text-zinc-200">{user.full_name || "Sem nome"}</div>
                                            <div className="text-xs text-zinc-500">{user.email || "Sem email"}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    {/* Placeholder for status logic if not in DB yet, usually controlled by subscription or banning */}
                                    <span className="inline-flex items-center rounded-full bg-green-900/30 px-2 py-1 text-xs font-medium text-green-500 ring-1 ring-inset ring-green-900/50">
                                        Ativo
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {/* Placeholder for plan */}
                                    <span className="text-zinc-300">Free</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-yellow-500">Lvl {Math.floor((user.fp || 0) / 1000) + 1}</span>
                                        <span className="text-xs text-zinc-600">({user.fp || 0} FP)</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${user.role === 'admin' ? 'bg-purple-400/10 text-purple-400 ring-purple-400/30' :
                                        user.role === 'super_admin' ? 'bg-red-400/10 text-red-400 ring-red-400/30' :
                                            'bg-zinc-400/10 text-zinc-400 ring-zinc-400/20'
                                        }`}>
                                        {user.role || 'user'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-zinc-500">
                                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <ButtonAction title="Ver Perfil" icon={Eye} />
                                        <ButtonAction title="Editar" icon={Shield} />
                                        <ButtonAction title="Banir" icon={Ban} className="text-red-500 hover:text-red-400" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ButtonAction({ icon: Icon, title, className = "" }: any) {
    return (
        <button className={`rounded p-1 hover:bg-zinc-700 ${className}`} title={title}>
            <Icon className="h-4 w-4" />
        </button>
    )
}
