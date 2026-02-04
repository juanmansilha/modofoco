"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewCampaignPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: "popup",
        title: "",
        content: "",
        cta_text: "",
        cta_link: "",
        status: "active",
        priority: 0
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from("marketing_campaigns")
            .insert([formData]);

        if (error) {
            alert("Erro ao criar campanha: " + error.message);
        } else {
            router.push("/admin/marketing");
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/marketing" className="rounded-full p-2 hover:bg-zinc-800">
                    <ArrowLeft className="h-5 w-5 text-zinc-400" />
                </Link>
                <h1 className="text-2xl font-bold text-white">Nova Campanha</h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                    <h2 className="text-lg font-medium text-white mb-4">Configuração</h2>

                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Nome Interno</label>
                        <input
                            required
                            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="Ex: Promoção de Natal"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Tipo</label>
                        <select
                            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="popup">Popup Modal</option>
                            <option value="banner">Banner no Topo</option>
                            <option value="toast">Notificação Toast</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Prioridade (0-10)</label>
                        <input
                            type="number"
                            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={formData.priority}
                            onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                    <h2 className="text-lg font-medium text-white mb-4">Conteúdo Visual</h2>

                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Título</label>
                        <input
                            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="Ex: 50% de Desconto!"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Texto Principal</label>
                        <textarea
                            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[100px]"
                            placeholder="Descreva a oferta..."
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Texto do Botão</label>
                            <input
                                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="Ex: Aproveitar"
                                value={formData.cta_text}
                                onChange={e => setFormData({ ...formData, cta_text: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Link do Botão</label>
                            <input
                                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="Ex: /assinatura"
                                value={formData.cta_link}
                                onChange={e => setFormData({ ...formData, cta_link: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-end">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Campanha
                    </Button>
                </div>
            </form>
        </div>
    );
}
