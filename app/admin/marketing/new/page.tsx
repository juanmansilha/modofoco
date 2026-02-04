"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, Loader2, Wand2, MousePointerClick, MessageSquare, AlertCircle, Layout, Info } from "lucide-react";
import Link from "next/link";
import { CampaignPreview } from "@/components/admin/CampaignPreview";

export default function NewCampaignPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [hasCta, setHasCta] = useState(true);

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

    const applyTemplate = (template: string) => {
        if (template === 'promo') {
            setFormData({
                ...formData,
                type: 'popup',
                title: 'Oferta Especial! 🚀',
                content: 'Desbloqueie agora 50% de desconto no plano Pro. Oferta por tempo limitado.',
                cta_text: 'Quero Desconto',
                cta_link: '/billing',
                priority: 10
            });
            setHasCta(true);
        } else if (template === 'maintenance') {
            setFormData({
                ...formData,
                type: 'banner',
                title: 'Manutenção Programada',
                content: 'O sistema passará por atualização hoje às 22h.',
                cta_text: 'Saiba mais',
                cta_link: '/status',
                priority: 8
            });
            setHasCta(true);
        } else if (template === 'welcome') {
            setFormData({
                ...formData,
                type: 'toast',
                title: 'Bem-vindo(a)!',
                content: 'Que bom ter você aqui. Complete seu perfil para ganhar XP.',
                cta_text: 'Editar Perfil',
                cta_link: '/settings',
                priority: 5
            });
            setHasCta(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const submissionData = {
            ...formData,
            cta_text: hasCta ? formData.cta_text : null,
            cta_link: hasCta ? formData.cta_link : null,
        };

        const { error } = await supabase
            .from("marketing_campaigns")
            .insert([submissionData]);

        if (error) {
            alert("Erro ao criar campanha: " + error.message);
        } else {
            router.push("/admin/marketing");
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <div className="max-w-5xl space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/admin/marketing" className="rounded-full p-2 hover:bg-zinc-800 transition-colors">
                    <ArrowLeft className="h-5 w-5 text-zinc-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Nova Campanha</h1>
                    <p className="text-zinc-400 text-sm">Crie mensagens e ofertas para engajar seus usuários.</p>
                </div>
            </div>

            {/* Templates Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => applyTemplate('promo')} className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-indigo-500/50 transition-all group text-left">
                    <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                        <Wand2 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white group-hover:text-indigo-300">Promoção Relâmpago</h3>
                        <p className="text-xs text-zinc-500">Popup com oferta e CTA</p>
                    </div>
                </button>

                <button onClick={() => applyTemplate('maintenance')} className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-yellow-500/50 transition-all group text-left">
                    <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white group-hover:text-yellow-300">Aviso do Sistema</h3>
                        <p className="text-xs text-zinc-500">Banner de topo informativo</p>
                    </div>
                </button>

                <button onClick={() => applyTemplate('welcome')} className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-green-500/50 transition-all group text-left">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                        <MessageSquare className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white group-hover:text-green-300">Boas-vindas / Dica</h3>
                        <p className="text-xs text-zinc-500">Toast discreto no canto</p>
                    </div>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column - Spans 2 cols */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

                    {/* Basic Info */}
                    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Layout className="w-5 h-5 text-zinc-400" />
                            <h2 className="text-lg font-medium text-white">Configuração</h2>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Nome Interno (Admin)</label>
                            <input
                                required
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                                placeholder="Ex: Campanha Black Friday 2024"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400">Formato</label>
                                <select
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="popup">Popup Modal (Central)</option>
                                    <option value="banner">Banner Topo</option>
                                    <option value="toast">Toast Notificação (Canto)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400">Prioridade (0-10)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageSquare className="w-5 h-5 text-zinc-400" />
                            <h2 className="text-lg font-medium text-white">Conteúdo Visual</h2>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Título</label>
                            <input
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                placeholder="Ex: 50% de Desconto!"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Mensagem / Descrição</label>
                            <textarea
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent min-h-[100px]"
                                placeholder="Descreva a oferta ou aviso..."
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 border-t border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <MousePointerClick className="w-4 h-4 text-zinc-400" />
                                    <h3 className="text-md font-medium text-white">Botão de Ação (CTA)</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-400">{hasCta ? 'Ativado' : 'Desativado'}</span>
                                    <button
                                        type="button"
                                        onClick={() => setHasCta(!hasCta)}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${hasCta ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${hasCta ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>

                            {hasCta && (
                                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 fade-in">
                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400">Texto do Botão</label>
                                        <input
                                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                            placeholder="Ex: Aproveitar Agora"
                                            value={formData.cta_text}
                                            onChange={e => setFormData({ ...formData, cta_text: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400">Link de Destino</label>
                                        <input
                                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                            placeholder="Ex: /assinatura"
                                            value={formData.cta_link}
                                            onChange={e => setFormData({ ...formData, cta_link: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[200px] h-12 text-sm font-bold rounded-xl shadow-lg shadow-indigo-900/20 transition-all hover:scale-105"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Publicar Campanha
                        </Button>
                    </div>
                </form>

                {/* Preview Column */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Preview em Tempo Real</h3>
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">Ao Vivo</span>
                        </div>

                        <CampaignPreview
                            type={formData.type}
                            title={formData.title}
                            content={formData.content}
                            cta_text={hasCta ? formData.cta_text : ''}
                            cta_link={hasCta ? formData.cta_link : ''}
                        />

                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
                            <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                <Info className="w-4 h-4 text-indigo-400" />
                                Dicas de Engajamento
                            </h4>
                            <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-4">
                                <li>Use títulos curtos e impactantes de até 5 palavras.</li>
                                <li>Para <strong>Popups</strong>, use imagens de alta qualidade.</li>
                                <li><strong>Toasts</strong> são ótimos para dicas rápidas sem interromper o usuário.</li>
                                <li>Use a prioridade para decidir qual campanha aparece primeiro se houver conflito.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
