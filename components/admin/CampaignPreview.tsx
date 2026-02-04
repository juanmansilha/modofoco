"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface CampaignPreviewProps {
    type: string;
    title: string;
    content: string;
    cta_text: string;
    cta_link: string;
}

export function CampaignPreview({ type, title, content, cta_text, cta_link }: CampaignPreviewProps) {
    if (type === "popup") {
        return (
            <div className="relative w-full aspect-video bg-black/50 rounded-xl overflow-hidden flex items-center justify-center border border-dashed border-zinc-700">
                <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                    {/* Overlay Mock */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Popup Content */}
                    <div className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
                        <button className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                            <X size={20} />
                        </button>

                        {/* Placeholder Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-4 flex-shrink-0" />

                        <h3 className="text-xl font-bold text-white mb-2">
                            {title || "Seu Título Aqui"}
                        </h3>

                        <p className="text-zinc-400 text-sm mb-6">
                            {content || "A descrição da sua campanha aparecerá aqui..."}
                        </p>

                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                            {cta_text || "Botão de Ação"}
                        </Button>
                    </div>
                </div>
                <div className="absolute bottom-4 left-4 text-xs text-zinc-500 bg-black/80 px-2 py-1 rounded">
                    Preview: Popup Modal
                </div>
            </div>
        )
    }

    if (type === "banner") {
        return (
            <div className="relative w-full bg-zinc-900 rounded-xl overflow-hidden border border-dashed border-zinc-700 p-4">
                <div className="w-full bg-indigo-600 px-4 py-3 flex items-center justify-between rounded-lg shadow-lg">
                    <p className="text-sm font-medium text-white">
                        {title} - <span className="opacity-80 font-normal">{content || "..."}</span>
                    </p>
                    <button className="text-white/80 hover:text-white text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full ml-4 whitespace-nowrap">
                        {cta_text || "Ver Mais"}
                    </button>
                </div>
                <div className="mt-4 text-xs text-zinc-500 text-center">
                    Preview: Banner Topo (aparecerá no topo do app)
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-40 flex items-center justify-center bg-zinc-900/50 rounded-xl border border-zinc-800 text-zinc-500">
            Preview não disponível para este formato.
        </div>
    )
}
