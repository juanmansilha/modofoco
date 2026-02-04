"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FalconBrain } from "@/lib/falcon-brain";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { useGamification } from "@/contexts/GamificationContext";
import { supabase } from "@/lib/supabase"; // Import Supabase
import { X, Send, Sparkles, MessageCircle, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FalconConfigModal } from "./FalconConfigModal";

interface FalconChatProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'falcon';
    timestamp: number;
}

export function FalconChat({ isOpen, onClose }: FalconChatProps) {
    const { userData } = useGlobalData(); // user removed
    const { awardFP } = useGamification();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: "🦅 Olá. Eu sou o Falcon.\n\nEstou pronto para registrar suas atividades.\nO que vamos fazer agora?",
            sender: 'falcon',
            timestamp: Date.now()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [brain, setBrain] = useState<FalconBrain | null>(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Init Brain
    useEffect(() => {
        const initBrain = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setBrain(new FalconBrain(user.id));
            }
        };
        initBrain();
    }, []);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !brain) return;

        const userText = inputValue.trim();
        setInputValue("");

        // Add User Message
        const userMsg: Message = {
            id: crypto.randomUUID(),
            text: userText,
            sender: 'user',
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMsg]);

        setIsTyping(true);

        // Process
        // Simulate "typing" delay for realism
        setTimeout(async () => {
            const response = await brain.processMessage(userText);

            const falconMsg: Message = {
                id: crypto.randomUUID(),
                text: response.text,
                sender: 'falcon',
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, falconMsg]);
            setIsTyping(false);

            // Award FP if action performed
            if (response.actionPerformed && response.fpGained) {
                // Award points via Context
                awardFP(response.fpGained, "Registro via Falcon");
            }

        }, 800);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:justify-end sm:p-6 pointer-events-none">
            {/* Backdrop for mobile */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none pointer-events-auto sm:pointer-events-none"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[#0A0A0A] border border-white/10 w-full sm:w-[400px] h-[80vh] sm:h-[600px] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden relative"
            >
                {/* Header */}
                <div className="p-4 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <span className="text-xl">🦅</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Falcon AI</h3>
                            <p className="text-xs text-green-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Online
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsConfigOpen(true)}
                            className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                            title="Configurar WhatsApp"
                        >
                            <Settings size={18} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/50">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full",
                                msg.sender === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div className={cn(
                                "max-w-[80%] rounded-2xl p-3 text-sm whitespace-pre-line leading-relaxed",
                                msg.sender === 'user'
                                    ? "bg-indigo-600 text-white rounded-tr-none"
                                    : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5"
                            )}>
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-zinc-800 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center border border-white/5">
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-zinc-900/30 border-t border-white/5">
                    <div className="relative">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Digite um comando..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none custom-scrollbar"
                            rows={1}
                            style={{ minHeight: '46px', maxHeight: '120px' }}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || !brain}
                            className="absolute right-2 bottom-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {['Criar tarefa', 'Registrar treino', 'Adicionar saída', 'Registrar estudo'].map(cmd => (
                            <button
                                key={cmd}
                                onClick={() => setInputValue(cmd + " ")}
                                className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/5 px-2 py-1 rounded-md text-zinc-400 whitespace-nowrap transition-colors"
                            >
                                {cmd}
                            </button>
                        ))}
                    </div>
                </div>

                <FalconConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

            </motion.div>
        </div>,
        document.body
    );
}
