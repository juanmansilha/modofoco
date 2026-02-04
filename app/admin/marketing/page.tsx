import { supabaseAdmin } from "@/lib/supabase-admin";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone, Eye, Play, Pause } from "lucide-react";
import Link from "next/link";

export default async function MarketingPage() {
    const { data: campaigns, error } = await supabaseAdmin
        .from("marketing_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Marketing & Campanhas</h1>
                    <p className="text-zinc-400">Gerencie popups, banners e avisos para os usuários.</p>
                </div>
                <Link href="/admin/marketing/new">
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4" />
                        Nova Campanha
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border border-zinc-800 bg-zinc-900">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-medium uppercase text-zinc-500">
                        <tr>
                            <th className="px-4 py-3">Nome</th>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Criado em</th>
                            <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {campaigns && campaigns.length > 0 ? (
                            campaigns.map((campaign) => (
                                <tr key={campaign.id} className="group hover:bg-zinc-800/50">
                                    <td className="px-4 py-3 font-medium text-white">{campaign.name}</td>
                                    <td className="px-4 py-3 capitalize">{campaign.type}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${campaign.status === 'active' ? 'bg-green-400/10 text-green-400 ring-green-400/20' :
                                                campaign.status === 'paused' ? 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/20' :
                                                    'bg-zinc-400/10 text-zinc-400 ring-zinc-400/20'
                                            }`}>
                                            {campaign.status === 'active' ? 'Ativo' : campaign.status === 'paused' ? 'Pausado' : 'Encerrado'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{new Date(campaign.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button title="Ver" className="rounded p-1 hover:bg-zinc-700">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        {/* Actions would be wired up to client components or server actions */}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                                    Nenhuma campanha encontrada. Crie a primeira!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
