"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { useNotifications } from "@/contexts/NotificationContext";
import { ArrowRight, Mail, Lock, User, Sparkles } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { login, signup, userData } = useGlobalData();
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [loading, setLoading] = useState(false);

    // Form States
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { addNotification } = useNotifications();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === "login") {
                await login(email, password);
                addNotification("Bem-vindo!", "Login realizado com sucesso.");
                router.push("/dashboard");
            } else {
                await signup(email, password, name);
                addNotification("Conta Criada", "Verifique seu email para confirmar.");
                // Store temp name for onboarding
                localStorage.setItem("mf_temp_username", name);
                router.push("/onboarding");
            }
        } catch (error: any) {
            console.error(error);
            addNotification("Erro", error.message || "Falha na autenticação.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-zinc-700/30">

            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="w-full max-w-md bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-3xl p-8 z-10 shadow-2xl relative"
            >
                {/* Logo & Brand */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative h-20 w-64 mb-4">
                        <Image
                            src="/logo-full.png"
                            alt="ModoFoco"
                            fill
                            className="object-contain relative z-10"
                            priority
                        />
                    </div>
                </div>

                {/* Switcher */}
                <div className="flex bg-black/40 p-1 rounded-xl mb-8 border border-white/5 relative">
                    <div className="absolute inset-0 rounded-xl border border-white/5 pointer-events-none" />
                    <button
                        onClick={() => setMode("login")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${mode === "login" ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => setMode("signup")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${mode === "signup" ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        Criar Conta
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <AnimatePresence mode="popLayout">
                        {mode === "signup" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-2 overflow-hidden"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        <User size={10} /> Nome
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Seu nome"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-11 bg-black/40 border-white/5 focus:border-indigo-500/50 text-white placeholder:text-zinc-700 rounded-xl transition-all"
                                        required={mode === "signup"}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                            <Mail size={10} /> E-mail
                        </label>
                        <Input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 bg-black/40 border-white/5 focus:border-indigo-500/50 text-white placeholder:text-zinc-700 rounded-xl transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                            <Lock size={10} /> Senha
                        </label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11 bg-black/40 border-white/5 focus:border-indigo-500/50 text-white placeholder:text-zinc-700 rounded-xl transition-all"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-sm font-bold tracking-wide mt-2 bg-white text-black hover:bg-zinc-200 transition-all rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)] group overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {mode === "login" ? "Entrar" : "Começar Agora"}
                            {mode === "signup" && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                        </span>
                    </Button>
                </form>

                {mode === "login" && (
                    <div className="mt-6 text-center">
                        <a href="#" className="text-xs text-zinc-600 hover:text-indigo-400 transition-colors">
                            Esqueceu sua senha?
                        </a>
                    </div>
                )}
            </motion.div>

            <div className="absolute bottom-6 flex items-center gap-2 text-zinc-800 text-[10px] tracking-[0.2em] z-10 uppercase font-bold opacity-50">
                <Sparkles size={10} />
                Sistema v1.0
            </div>
        </div>
    );
}
