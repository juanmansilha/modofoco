"use client";

import { X, Bell, Info, ExternalLink, Gift, Zap, Star, Heart, Trophy, AlertTriangle, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import Image from "next/image";

interface CampaignPreviewProps {
    type: string;
    title: string;
    content: string;
    cta_text: string;
    cta_link: string;
    image_url?: string;
    icon?: string;
    style?: {
        backgroundColor?: string;
        textColor?: string;
        buttonColor?: string;
    };
    onFullScreen?: () => void;
    isFullScreen?: boolean;
}

const iconMap: any = {
    info: Info,
    bell: Bell,
    gift: Gift,
    zap: Zap,
    star: Star,
    heart: Heart,
    trophy: Trophy,
    alert: AlertTriangle
};

export function CampaignPreview({
    type,
    title,
    content,
    cta_text,
    cta_link,
    image_url,
    icon = 'info',
    style,
    onFullScreen,
    isFullScreen
}: CampaignPreviewProps) {
    const hasCta = !!cta_text;
    const IconComponent = iconMap[icon] || Info;

    const containerClasses = isFullScreen
        ? "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        : "relative w-full aspect-video bg-zinc-950/80 rounded-xl overflow-hidden flex items-center justify-center border border-dashed border-zinc-800 transition-all";

    if (type === "popup") {
        return (
            <div className={containerClasses}>
                {onFullScreen && !isFullScreen && (
                    <button
                        onClick={onFullScreen}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 rounded text-zinc-400 hover:text-white transition-colors z-20"
                        title="Tela Cheia"
                    >
                        <Maximize2 size={14} />
                    </button>
                )}
                {isFullScreen && (
                    <button
                        onClick={onFullScreen}
                        className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white z-50 transition-colors"
                    >
                        <Minimize2 size={20} />
                    </button>
                )}

                <div className={`${isFullScreen ? 'scale-110' : ''} absolute inset-0 flex items-center justify-center pointer-events-none p-4`}>
                    {/* Overlay Mock */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Popup Content */}
                    <div
                        className="relative w-full max-w-sm border border-white/10 rounded-2xl shadow-2xl flex flex-col items-center text-center overflow-hidden"
                        style={{ backgroundColor: style?.backgroundColor || '#18181b' }}
                    >
                        {image_url && (
                            <div className="w-full h-32 relative">
                                <Image src={image_url} alt="Campaign" fill className="object-cover" />
                            </div>
                        )}

                        <div className="p-6 flex flex-col items-center w-full">
                            <button className="absolute top-4 right-4 text-zinc-500 hover:text-white bg-black/20 rounded-full p-1">
                                <X size={20} />
                            </button>

                            {!image_url && (
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-4 flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                    <IconComponent size={32} />
                                </div>
                            )}

                            <h3
                                className="text-xl font-bold mb-2 leading-tight"
                                style={{ color: style?.textColor || '#ffffff' }}
                            >
                                {title || "Seu Título Aqui"}
                            </h3>

                            <p className="text-sm mb-6 leading-relaxed opacity-80" style={{ color: style?.textColor || '#a1a1aa' }}>
                                {content || "A descrição da sua campanha aparecerá aqui..."}
                            </p>

                            {hasCta && (
                                <Button
                                    className="w-full rounded-xl shadow-lg transition-all active:scale-95"
                                    style={{
                                        backgroundColor: style?.buttonColor || '#4f46e5',
                                        color: '#ffffff'
                                    }}
                                >
                                    {cta_text}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {!isFullScreen && (
                    <div className="absolute bottom-3 left-3 text-[10px] text-zinc-500 bg-black/80 px-2 py-1 rounded border border-white/5">
                        Popup Modal
                    </div>
                )}
            </div>
        )
    }

    if (type === "banner") {
        return (
            <div className={`relative w-full bg-zinc-950 rounded-xl overflow-hidden border border-dashed border-zinc-800 p-6 flex flex-col justify-start gap-4 ${isFullScreen ? 'fixed inset-0 z-50 h-screen w-screen border-none rounded-none' : ''}`}>
                {onFullScreen && !isFullScreen && (
                    <button
                        onClick={onFullScreen}
                        className="absolute top-2 right-2 p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors z-20"
                    >
                        <Maximize2 size={14} />
                    </button>
                )}
                {isFullScreen && (
                    <button
                        onClick={onFullScreen}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white z-50 transition-colors flex items-center gap-2"
                    >
                        <Minimize2 size={16} /> Fechar Preview
                    </button>
                )}

                {/* Simulated App Header */}
                <div
                    className="w-full px-4 py-3 flex items-center justify-between rounded-lg shadow-lg relative z-10"
                    style={{ backgroundColor: style?.backgroundColor || '#2563eb' }}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <IconComponent className="w-5 h-5 flex-shrink-0" style={{ color: style?.textColor || '#ffffff' }} />
                        <p className="text-sm font-medium truncate" style={{ color: style?.textColor || '#ffffff' }}>
                            {title ? <span className="font-bold mr-1">{title}:</span> : null}
                            <span className="opacity-90">{content || "Conteúdo do banner..."}</span>
                        </p>
                    </div>

                    {hasCta && (
                        <button
                            className="text-xs font-bold px-3 py-1.5 rounded-full ml-4 whitespace-nowrap transition-colors flex items-center gap-1 shadow-sm bg-white/20 hover:bg-white/30"
                            style={{ color: style?.textColor || '#ffffff' }}
                        >
                            {cta_text} <ExternalLink size={10} />
                        </button>
                    )}
                </div>

                {!isFullScreen && (
                    <div className="mt-auto text-xs text-zinc-600 text-center">
                        Preview: Banner (Topo do App)
                    </div>
                )}
            </div>
        )
    }

    if (type === "toast") {
        return (
            <div className={containerClasses}>
                {onFullScreen && !isFullScreen && (
                    <button
                        onClick={onFullScreen}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 rounded text-zinc-400 hover:text-white transition-colors z-20"
                    >
                        <Maximize2 size={14} />
                    </button>
                )}
                {isFullScreen && (
                    <button
                        onClick={onFullScreen}
                        className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white z-50 transition-colors"
                    >
                        <Minimize2 size={20} />
                    </button>
                )}

                {/* Toast Mock */}
                <div className={`w-80 border rounded-lg p-4 shadow-xl flex gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 ${isFullScreen ? 'absolute bottom-10 right-10 scale-125' : 'mr-4 mb-4'}`}
                    style={{
                        backgroundColor: style?.backgroundColor || '#18181b',
                        borderColor: 'rgba(255,255,255,0.1)'
                    }}
                >
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5" style={{ color: style?.buttonColor || '#22c55e' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold mb-0.5" style={{ color: style?.textColor || '#ffffff' }}>{title || "Notificação"}</h4>
                        <p className="text-xs opacity-80 leading-snug mb-2" style={{ color: style?.textColor || '#a1a1aa' }}>{content || "Mensagem breve..."}</p>

                        {hasCta && (
                            <button className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: style?.buttonColor || '#4ade80' }}>
                                {cta_text} &rarr;
                            </button>
                        )}
                    </div>
                    <button className="text-zinc-500 hover:text-white h-fit">
                        <X size={14} />
                    </button>
                </div>

                {!isFullScreen && (
                    <div className="absolute bottom-3 left-3 text-[10px] text-zinc-500 bg-black/80 px-2 py-1 rounded border border-white/5">
                        Toast (Canto Inferior)
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="w-full h-40 flex items-center justify-center bg-zinc-900/50 rounded-xl border border-zinc-800 text-zinc-500">
            Preview não disponível.
        </div>
    )
}
