"use client";

import { MessageCircle, PlayCircle, History, ExternalLink, LifeBuoy, ChevronRight } from "lucide-react";
import { PageBanner } from "@/components/ui/PageBanner";

export default function SupportPage() {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-background">
            <PageBanner
                title="Central de Ajuda"
                subtitle="Precisa de ajuda? Fale com a gente ou veja nossos tutoriais."
                gradientColor="indigo"
                icon={LifeBuoy}
            />

            <main className="p-8 pb-32 max-w-7xl mx-auto space-y-12">

                {/* Hero Section: Contact */}
                <section>
                    <div className="bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-500" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
                                <MessageCircle size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Suporte via WhatsApp</h2>
                                <p className="text-zinc-400 max-w-md">Tire dúvidas, reporte problemas ou dê sugestões diretamente com nossa equipe de suporte exclusiva.</p>
                            </div>
                        </div>

                        <a
                            href="https://wa.me/5511999999999"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-10 flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 whitespace-nowrap"
                        >
                            <span>Iniciar Conversa</span>
                            <ExternalLink size={20} />
                        </a>
                    </div>
                </section>

                {/* Tutorials Section */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <PlayCircle size={24} className="text-zinc-500" />
                        Aprenda a Usar
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: "Começando com Metas", duration: "2:30", thumb: "bg-indigo-900/20" },
                            { title: "Gerenciando Tarefas", duration: "4:15", thumb: "bg-purple-900/20" },
                            { title: "Organizando Estudos", duration: "3:45", thumb: "bg-blue-900/20" },
                        ].map((video, idx) => (
                            <div key={idx} className="group cursor-pointer">
                                <div className={`aspect-video rounded-xl ${video.thumb} border border-white/5 mb-3 flex items-center justify-center group-hover:scale-[1.02] transition-transform`}>
                                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
                                        <PlayCircle size={24} fill="currentColor" className="text-white/80" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-zinc-200 group-hover:text-white transition-colors">{video.title}</h3>
                                <p className="text-xs text-zinc-500">{video.duration} • Tutorial</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Changelog Section */}
                <section className="border-t border-white/5 pt-12">
                    <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                        <History size={24} className="text-zinc-500" />
                        Histórico de Atualizações
                    </h2>

                    <div className="relative border-l border-white/10 ml-3 space-y-12">
                        {[
                            {
                                version: "v1.2.0",
                                date: "21 Jan 2026",
                                title: "Central de Tarefas Unificada",
                                features: [
                                    "Visualize tarefas de Metas, Estudos e Recursos em um só lugar.",
                                    "Sincronização automática de status.",
                                    "Novos filtros e tags de origem."
                                ]
                            },
                            {
                                version: "v1.1.5",
                                date: "18 Jan 2026",
                                title: "Melhorias em Estudos",
                                features: [
                                    "Adicionado suporte a datas em tópicos de estudo.",
                                    "Novo visualizador de Calendário de Estudos.",
                                    "Correção de bugs na barra de progresso."
                                ]
                            },
                            {
                                version: "v1.0.0",
                                date: "01 Jan 2026",
                                title: "Lançamento Oficial",
                                features: [
                                    "Lançamento do MVP ClubeZero.",
                                    "Módulos de Saúde, Financeiro e Comunidade.",
                                    "Integração inicial com Dashboard."
                                ]
                            }
                        ].map((update, idx) => (
                            <div key={idx} className="relative pl-8">
                                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-black" />

                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-2 py-1 rounded-md border border-indigo-500/20">{update.version}</span>
                                    <span className="text-zinc-500 text-sm">{update.date}</span>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2">{update.title}</h3>

                                <ul className="space-y-1">
                                    {update.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="text-sm text-zinc-400 flex items-start gap-2">
                                            <span className="text-zinc-600 mt-1.5">•</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
