"use client";

import { X, Bell, Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CampaignPreviewProps {
    type: string;
    title: string;
    content: string;
    cta_text: string;
    cta_link: string;
}

export function CampaignPreview({ type, title, content, cta_text, cta_link }: CampaignPreviewProps) {
    const hasCta = !!cta_text;

    if (type === "popup") {
        return (
            <div className="relative w-full aspect-video bg-zinc-950/80 rounded-xl overflow-hidden flex items-center justify-center border border-dashed border-zinc-800">
                <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                    {/* Overlay Mock */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Popup Content */}
                    <div className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
                        <button className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                            <X size={20} />
                        </button>

                        {/* Placeholder Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-4 flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <Info size={32} />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                            {title || "Seu Título Aqui"}
                        </h3>

                        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                            {content || "A descrição da sua campanha aparecerá aqui..."}
                        </p>

                        {hasCta && (
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-95">
                                {cta_text}
                            </Button>
                        )}
                    </div>
                </div>
                <div className="absolute bottom-3 left-3 text-[10px] text-zinc-500 bg-black/80 px-2 py-1 rounded border border-white/5">
                    Popup Modal
                </div>
            </div>
        )
    }

    if (type === "banner") {
        return (
            <div className="relative w-full bg-zinc-950 rounded-xl overflow-hidden border border-dashed border-zinc-800 p-6 flex flex-col justify-start gap-4">

                {/* Simulated App Header */}
                <div className="w-full bg-blue-600 px-4 py-3 flex items-center justify-between rounded-lg shadow-lg relative z-10">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Info className="w-5 h-5 text-white/90 flex-shrink-0" />
                        <p className="text-sm font-medium text-white truncate">
                            {title ? <span className="font-bold mr-1">{title}:</span> : null}
                            <span className="opacity-90">{content || "Conteúdo do banner..."}</span>
                        </p>
                    </div>

                    {hasCta && (
                        <button className="text-blue-600 hover:bg-white/90 text-xs font-bold bg-white px-3 py-1.5 rounded-full ml-4 whitespace-nowrap transition-colors flex items-center gap-1 shadow-sm">
                            {cta_text} <ExternalLink size={10} />
                        </button>
                    )}
                </div>

                <div className="mt-auto text-xs text-zinc-600 text-center">
                    Preview: Banner (Topo do App)
                </div>
            </div>
        )
    }

    if (type === "toast") {
        return (
            <div className="relative w-full aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-dashed border-zinc-800 p-6 flex items-end justify-end">

                {/* Toast Mock */}
                <div className="w-80 bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-xl flex gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white mb-0.5">{title || "Notificação"}</h4>
                        <p className="text-xs text-zinc-400 leading-snug mb-2">{content || "Mensagem breve..."}</p>

                        {hasCta && (
                            <button className="text-xs font-medium text-green-400 hover:text-green-300 transition-colors">
                                {cta_text} &rarr;
                            </button>
                        )}
                    </div>
                    <button className="text-zinc-500 hover:text-white h-fit">
                        <X size={14} />
                    </button>
                </div>

                <div className="absolute top-3 left-3 text-[10px] text-zinc-500 bg-black/80 px-2 py-1 rounded border border-white/5">
                    Toast (Canto Inferior)
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-40 flex items-center justify-center bg-zinc-900/50 rounded-xl border border-zinc-800 text-zinc-500">
            Preview não disponível.
        </div>
    )
}
