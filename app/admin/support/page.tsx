import { supabaseAdmin } from "@/lib/supabase-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { MessageSquare, AlertCircle, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default async function SupportPage() {
    const { data: tickets, error } = await supabaseAdmin
        .from("support_tickets")
        .select("*, profiles(email, full_name)")
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Suporte & Chamados</h1>
                    <p className="text-zinc-400">Gerencie tickets e incidentes.</p>
                </div>
            </div>

            <div className="rounded-md border border-zinc-800 bg-zinc-900">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-medium uppercase text-zinc-500">
                        <tr>
                            <th className="px-4 py-3">Assunto</th>
                            <th className="px-4 py-3">Usuário</th>
                            <th className="px-4 py-3">Categoria</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Prioridade</th>
                            <th className="px-4 py-3">Criado em</th>
                            <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {tickets && tickets.length > 0 ? (
                            tickets.map((ticket: any) => (
                                <tr key={ticket.id} className="group hover:bg-zinc-800/50">
                                    <td className="px-4 py-3 font-medium text-white">{ticket.subject}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-200">{ticket.profiles?.full_name || "Desconhecido"}</span>
                                            <span className="text-xs text-zinc-500">{ticket.profiles?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 capitalize">{ticket.category}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${ticket.status === 'open' ? 'bg-blue-400/10 text-blue-400 ring-blue-400/20' :
                                            ticket.status === 'resolved' ? 'bg-green-400/10 text-green-400 ring-green-400/20' :
                                                'bg-zinc-400/10 text-zinc-400 ring-zinc-400/20'
                                            }`}>
                                            {ticket.status === 'open' ? 'Aberto' : ticket.status === 'resolved' ? 'Resolvido' : ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 capitalize">
                                        <span className={ticket.priority === 'critical' ? 'text-red-500 font-bold' : ticket.priority === 'high' ? 'text-orange-500' : ''}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{new Date(ticket.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                                    Nenhum ticket encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
