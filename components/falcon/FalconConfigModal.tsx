"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { X, Check, MessageCircle, AlertTriangle } from "lucide-react";

interface FalconConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FalconConfigModal({ isOpen, onClose }: FalconConfigModalProps) {
    const { userData, updateUserData } = useGlobalData();
    const [step, setStep] = useState<"intro" | "setup" | "success">("intro");
    const [phone, setPhone] = useState(userData.whatsapp || "");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen) return null;

    // Format phone logic...
    const formatPhone = (val: string) => {
        return val
            .replace(/\D/g, "")
            .replace(/^(\d{2})(\d)/g, "($1) $2")
            .replace(/(\d)(\d{4})$/, "$1-$2");
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhone(e.target.value));
    };

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/falcon/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone,
                    message: "🦅 Falcon conectado com sucesso! Exemplo de alerta do ModoFoco."
                })
            });

            if (!response.ok) {
                const err = await response.json();
                alert(`Erro de conexão: ${err.error || "Verifique o servidor Evo"}`);
                setIsLoading(false);
                return;
            }

            updateUserData({
                whatsapp: phone.replace(/\D/g, ""),
                falconEnabled: true
            });

            setStep("success");
        } catch (error) {
            console.error(error);
            alert("Erro ao conectar. Verifique sua internet.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestMessage = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/falcon/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone,
                    message: "🔔 Teste: Não esqueça de beber água e focar na meta!"
                })
            });

            if (response.ok) {
                alert(`Mensagem enviada para: ${phone}`);
            } else {
                alert("Falha ao enviar. Verifique o console.");
            }
        } catch (e) {
            alert("Erro de rede.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl animate-in fade-in zoom-in-95 duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Content based on step */}
                <div className="p-8">
                    {step === "intro" && (
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 mb-2">
                                <MessageCircle size={40} className="text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Conheça o Falcon</h2>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Seu novo assistente pessoal no WhatsApp. Receba alertas, registre gastos e veja suas tarefas conversando naturalmente.
                                </p>
                            </div>

                            <ul className="text-left space-y-3 w-full bg-zinc-900/50 p-4 rounded-xl border border-white/5 text-sm text-zinc-300">
                                <li className="flex items-center gap-2"><Check size={14} className="text-green-400" /> Lembretes de Tarefas</li>
                                <li className="flex items-center gap-2"><Check size={14} className="text-green-400" /> Resumo do Dia</li>
                                <li className="flex items-center gap-2"><Check size={14} className="text-green-400" /> Avisos Financeiros</li>
                            </ul>

                            <Button onClick={() => setStep("setup")} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold h-12">
                                Configurar Falcon
                            </Button>
                        </div>
                    )}

                    {step === "setup" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white mb-1">Configuração</h2>
                            <p className="text-zinc-400 text-sm">Insira seu WhatsApp para conectar.</p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Seu Número (WhatsApp)</label>
                                    <Input
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        placeholder="(11) 99999-9999"
                                        maxLength={15}
                                        className="bg-zinc-900/50 border-white/10 h-12 text-lg tracking-wide placeholder:text-zinc-700"
                                    />
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                                    <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-yellow-500/80">
                                        Ao conectar, você concorda em receber mensagens automáticas do Falcon relacionadas à sua conta ModoFoco.
                                    </p>
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${acceptedTerms ? 'bg-green-500 border-green-500' : 'border-zinc-600 group-hover:border-zinc-500'}`}>
                                        {acceptedTerms && <Check size={12} className="text-black" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={acceptedTerms} onChange={() => setAcceptedTerms(!acceptedTerms)} />
                                    <span className="text-sm text-zinc-400 select-none">Aceito os termos de uso.</span>
                                </label>
                            </div>

                            <Button
                                onClick={handleConnect}
                                disabled={!acceptedTerms || phone.length < 14 || isLoading}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Conectando..." : "Ativar Falcon"}
                            </Button>
                        </div>
                    )}

                    {step === "success" && (
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 mb-2 animate-bounce">
                                <Check size={40} className="text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Conectado!</h2>
                                <p className="text-zinc-400 text-sm">
                                    O Falcon está ativo.<br /> Você receberá uma mensagem de boas-vindas em breve.
                                </p>
                            </div>

                            <Button onClick={handleTestMessage} variant="secondary" className="w-full">
                                Enviar Mensagem de Teste
                            </Button>
                            <Button onClick={onClose} variant="ghost" className="w-full text-zinc-500 hover:text-white">
                                Fechar
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
