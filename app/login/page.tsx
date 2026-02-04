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
import { ArrowRight, Mail, Lock, User, Sparkles, CheckCircle2, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { login, signup, userData } = useGlobalData();
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [signupEmail, setSignupEmail] = useState("");

    // Form States
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState("");

    const { addNotification } = useNotifications();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (mode === "login") {
                await login(email, password, rememberMe);
                // Wait a moment for state to update, then navigate
                setTimeout(() => {
                    router.push("/dashboard");
                }, 100);
            } else {
                await signup(email, password, name);
                setSignupEmail(email);
                setEmailSent(true);
                // Don't redirect to onboarding - just show confirmation
            }
        } catch (error: any) {
            console.error(error);
            setError(error.message || "Falha na autenticação.");
        } finally {
            setLoading(false);
        }
    };

    // Email Confirmation Screen
    if (emailSent) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-transparent to-indigo-950/20" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="w-full max-w-md bg-zinc-900/60 border border-white/5 backdrop-blur-xl rounded-3xl p-10 z-10 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20"
                    >
                        <CheckCircle2 size={40} className="text-white" />
                    </motion.div>

                    <h2 className="text-2xl font-bold text-white mb-3">
                        Verifique seu email
                    </h2>

                    <p className="text-zinc-400 mb-2">
                        Enviamos um link de confirmação para:
                    </p>

                    <p className="text-white font-medium text-lg mb-6 bg-zinc-800/50 py-2 px-4 rounded-lg inline-block">
                        {signupEmail}
                    </p>

                    <div className="space-y-4 text-sm text-zinc-500">
                        <p>
                            Clique no link enviado para ativar sua conta e começar a usar o ModoFoco.
                        </p>
                        <p className="text-xs">
                            Não recebeu? Verifique a pasta de spam ou{" "}
                            <button
                                onClick={() => setEmailSent(false)}
                                className="text-indigo-400 hover:text-indigo-300 underline"
                            >
                                tente novamente
                            </button>
                        </p>
                    </div>

                    <button
                        onClick={() => { setEmailSent(false); setMode("login"); }}
                        className="mt-8 text-sm text-zinc-500 hover:text-white transition-colors"
                    >
                        Voltar para login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-zinc-700/30">
            {/* Animated background gradients */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-indigo-900/10 to-transparent animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-emerald-900/10 to-transparent animate-pulse" style={{ animationDuration: '10s' }} />
            </div>

            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                className="w-full max-w-md bg-zinc-900/50 border border-white/5 backdrop-blur-2xl rounded-3xl p-8 z-10 shadow-2xl shadow-black/50 relative"
            >
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10 rounded-3xl blur-xl opacity-50" />

                <div className="relative">
                    {/* Logo & Brand */}
                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="relative h-20 w-64 mb-2"
                        >
                            <Image
                                src="/logo-full.png"
                                alt="ModoFoco"
                                fill
                                className="object-contain relative z-10"
                                priority
                            />
                        </motion.div>
                        <p className="text-zinc-600 text-xs tracking-widest uppercase">
                            Seu comando central
                        </p>
                    </div>

                    {/* Switcher */}
                    <div className="flex bg-black/50 p-1.5 rounded-2xl mb-8 border border-white/5 relative">
                        <motion.div
                            className="absolute inset-y-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl"
                            initial={false}
                            animate={{
                                left: mode === "login" ? "6px" : "50%",
                                right: mode === "login" ? "50%" : "6px"
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => setMode("login")}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors z-10 relative ${mode === "login" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setMode("signup")}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors z-10 relative ${mode === "signup" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                            Criar Conta
                        </button>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {mode === "signup" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -20 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-2 pb-1">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                            <User size={10} /> Seu nome
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Como quer ser chamado?"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="h-12 bg-black/40 border-white/5 focus:border-indigo-500/50 text-white placeholder:text-zinc-600 rounded-xl transition-all"
                                            required={mode === "signup"}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Mail size={10} /> E-mail
                            </label>
                            <Input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-black/40 border-white/5 focus:border-indigo-500/50 text-white placeholder:text-zinc-600 rounded-xl transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Lock size={10} /> Senha
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 bg-black/40 border-white/5 focus:border-indigo-500/50 text-white placeholder:text-zinc-600 rounded-xl transition-all"
                                required
                                minLength={6}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-sm font-bold tracking-wide mt-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white transition-all rounded-xl shadow-lg shadow-indigo-500/20 group overflow-hidden disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {mode === "login" ? "Entrar" : "Criar Conta"}
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </form>

                    {mode === "login" && (
                        <div className="mt-6 text-center">
                            <a href="#" className="text-xs text-zinc-600 hover:text-indigo-400 transition-colors">
                                Esqueceu sua senha?
                            </a>
                        </div>
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-6 flex items-center gap-2 text-zinc-700 text-[10px] tracking-[0.2em] z-10 uppercase font-medium"
            >
                <Sparkles size={10} />
                Foco. Disciplina. Resultados.
            </motion.div>
        </div>
    );
}
