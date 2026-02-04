"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadCampaignImage } from "@/lib/supabase-storage";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, Loader2, Wand2, MousePointerClick, MessageSquare, AlertCircle, Layout, Info, Image as ImageIcon, Palette, Type, Upload } from "lucide-react";
import Link from "next/link";
import { CampaignPreview } from "@/components/admin/CampaignPreview";

export default function NewCampaignPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [hasCta, setHasCta] = useState(true);
    const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        type: "popup",
        title: "",
        content: "",
        cta_text: "",
        cta_link: "",
        status: "active",
        priority: 0,
        image_url: "",
        icon: "info",
        style: {
            backgroundColor: "",
            textColor: "",
            buttonColor: ""
        }
    });

    const icons = ['info', 'bell', 'gift', 'zap', 'star', 'heart', 'trophy', 'alert'];

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploadingImage(true);
            const file = e.target.files[0];
            const url = await uploadCampaignImage(file);
            setFormData({ ...formData, image_url: url });
        } catch (error) {
            alert("Erro ao fazer upload da imagem.");
            console.error(error);
        } finally {
            setUploadingImage(false);
        }
    };

    const applyTemplate = (template: string) => {
        if (template === 'promo') {
            setFormData({
                ...formData,
                type: 'popup',
                title: 'Oferta Relâmpago! ⚡',
                content: 'Aproveite 50% de desconto no plano Premium. Promoção válida apenas hoje.',
                cta_text: 'Quero Desconto',
                cta_link: '/billing',
                priority: 10,
                icon: 'gift',
                style: { backgroundColor: '#18181b', textColor: '#ffffff', buttonColor: '#8b5cf6' },
                image_url: ""
            });
            setHasCta(true);
        } else if (template === 'maintenance') {
            setFormData({
                ...formData,
                type: 'banner',
                title: 'Manutenção',
                content: 'Sistema em manutenção às 22h.',
                cta_text: 'Status',
                cta_link: '/status',
                priority: 8,
                icon: 'alert',
                style: { backgroundColor: '#f59e0b', textColor: '#ffffff', buttonColor: '#ffffff' },
                image_url: ""
            });
            setHasCta(true);
        } else if (template === 'welcome') {
            setFormData({
                ...formData,
                type: 'toast',
                title: 'Bem-vindo(a)!',
                content: 'Complete seu perfil agora.',
                cta_text: 'Ir para Perfil',
                cta_link: '/settings',
                priority: 5,
                icon: 'star',
                style: { backgroundColor: '#18181b', textColor: '#ffffff', buttonColor: '#22c55e' },
                image_url: ""
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
                        <h3 className="text-sm font-medium text-white group-hover:text-indigo-300">Promoção</h3>
                        <p className="text-xs text-zinc-500">Popup estilizado</p>
                    </div>
                </button>

                <button onClick={() => applyTemplate('maintenance')} className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-yellow-500/50 transition-all group text-left">
                    <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white group-hover:text-yellow-300">Alerta</h3>
                        <p className="text-xs text-zinc-500">Banner de aviso</p>
                    </div>
                </button>

                <button onClick={() => applyTemplate('welcome')} className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-green-500/50 transition-all group text-left">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                        <MessageSquare className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white group-hover:text-green-300">Boas-vindas</h3>
                        <p className="text-xs text-zinc-500">Toast notificação</p>
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
                            <label className="text-sm text-zinc-400">Nome Interno</label>
                            <input
                                required
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                                placeholder="Ex: Campanha XP em Dobro"
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
                                <label className="text-sm text-zinc-400">Prioridade</label>
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

                    {/* Content & Design */}
                    <div className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Palette className="w-5 h-5 text-zinc-400" />
                            <h2 className="text-lg font-medium text-white">Design & Conteúdo</h2>
                        </div>

                        {/* Image Upload */}
                        {formData.type === 'popup' && (
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400">Imagem de Capa (Opcional)</label>
                                <div className="border border-dashed border-zinc-700 rounded-lg p-4 hover:bg-zinc-800/50 transition-colors bg-zinc-800/20 text-center cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                                        {uploadingImage ? (
                                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                        ) : (
                                            <Upload className="w-6 h-6" />
                                        )}
                                        <span className="text-xs">
                                            {uploadingImage ? 'Enviando...' : 'Clique ou arraste para enviar imagem'}
                                        </span>
                                    </div>
                                    {formData.image_url && (
                                        <div className="mt-2 text-xs text-green-400 truncate max-w-xs mx-auto">
                                            Imagem carregada com sucesso
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Icon Selection */}
                        {!formData.image_url && (
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400">Ícone</label>
                                <div className="flex flex-wrap gap-2">
                                    {icons.map(icon => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon })}
                                            className={`p-2 rounded-lg border transition-all ${formData.icon === icon ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700'}`}
                                        >
                                            {/* We rely on the Preview to render here as well OR a simple visual cue */}
                                            <div className="w-4 h-4 bg-current rounded-full" />
                                            {/* For cleaner code, we are using generic dots here, relying on the 'selected' style and preview area to convey meaning. Or we could map Lucide icons here too. */}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

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
                            <label className="text-sm text-zinc-400">Mensagem</label>
                            <textarea
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent min-h-[80px]"
                                placeholder="Conteúdo da mensagem..."
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>

                        {/* Colors */}
                        <div className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-4">
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-500">Fundo</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                        value={formData.style.backgroundColor || '#18181b'}
                                        onChange={e => setFormData({ ...formData, style: { ...formData.style, backgroundColor: e.target.value } })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-500">Texto</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                        value={formData.style.textColor || '#ffffff'}
                                        onChange={e => setFormData({ ...formData, style: { ...formData.style, textColor: e.target.value } })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-500">Botão</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                        value={formData.style.buttonColor || '#4f46e5'}
                                        onChange={e => setFormData({ ...formData, style: { ...formData.style, buttonColor: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <MousePointerClick className="w-4 h-4 text-zinc-400" />
                                    <h3 className="text-md font-medium text-white">Botão de Ação (CTA)</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-400">{hasCta ? 'Ativado' : 'Oculto'}</span>
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
                                            placeholder="Ex: Ver Detalhes"
                                            value={formData.cta_text}
                                            onChange={e => setFormData({ ...formData, cta_text: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400">Link de Destino</label>
                                        <input
                                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                            placeholder="Ex: /promocao"
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
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Preview Geral</h3>
                            <button
                                onClick={() => setIsFullScreenPreview(true)}
                                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700 transition-colors"
                            >
                                Expandir
                            </button>
                        </div>

                        <CampaignPreview
                            type={formData.type}
                            title={formData.title}
                            content={formData.content}
                            cta_text={hasCta ? formData.cta_text : ''}
                            cta_link={hasCta ? formData.cta_link : ''}
                            image_url={formData.image_url}
                            icon={formData.icon}
                            style={formData.style}
                            onFullScreen={() => setIsFullScreenPreview(!isFullScreenPreview)}
                            isFullScreen={isFullScreenPreview}
                        />

                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
                            <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                <Info className="w-4 h-4 text-indigo-400" />
                                Personalização
                            </h4>
                            <p className="text-xs text-zinc-400">
                                Use as opções de cor para combinar com sua marca. Imagens em popups aumentam a conversão em até 40%.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
