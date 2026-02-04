"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button"; // Check capitalization, user had issues before. using Button.tsx but import might be case sensitive? File view showed Button.tsx.
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { ShieldAlert, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
    const router = useRouter();
    const { login } = useGlobalData(); // We can reuse the global login, or call supabase directly if we want to bypass context temporarily
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // we use supabase directly to check role *before* global context updates or just rely on global context
            // Let's use the global login to ensure state is consistent
            // But we need to verify if the user is actually an admin after login

            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;

            if (data.session) {
                // Check role immediately
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", data.session.user.id)
                    .single();

                if (!profile || !["admin", "super_admin"].includes(profile.role)) {
                    // Not an admin, sign out immediately to prevent access
                    await supabase.auth.signOut();
                    throw new Error("Este usuário não tem permissão de administrador.");
                }

                // If success, the global context will eventually pick it up, but we can redirect now
                router.push("/admin");
            }

        } catch (error: any) {
            console.error(error);
            setError(error.message || "Falha na autenticação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-rose-900/30">
            {/* Background gradient - Red for Admin */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-rose-900/10 to-transparent animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-orange-900/10 to-transparent animate-pulse" style={{ animationDuration: '10s' }} />
            </div>

            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                className="w-full max-w-md bg-zinc-900/50 border border-rose-500/10 backdrop-blur-2xl rounded-3xl p-8 z-10 shadow-2xl shadow-black/50 relative"
            >
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-rose-500/10 via-transparent to-orange-500/10 rounded-3xl blur-xl opacity-50" />

                <div className="relative">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-rose-500/20">
                            <ShieldAlert size={32} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                            Acesso Administrativo
                        </h1>
                        <p className="text-zinc-600 text-xs tracking-widest uppercase mt-2">
                            Sistema ModoFoco
                        </p>
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
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Mail size={10} /> E-mail Admin
                            </label>
                            <Input
                                type="email"
                                placeholder="admin@modofoco.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-black/40 border-white/5 focus:border-rose-500/50 text-white placeholder:text-zinc-600 rounded-xl transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Lock size={10} /> Senha Segura
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 bg-black/40 border-white/5 focus:border-rose-500/50 text-white placeholder:text-zinc-600 rounded-xl transition-all"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-sm font-bold tracking-wide mt-4 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white transition-all rounded-xl shadow-lg shadow-rose-500/20 group overflow-hidden disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Acessar Painel
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-zinc-600 text-xs">
                            Área restrita a administradores.
                        </p>
                        <button
                            onClick={() => router.push('/login')}
                            className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            ← Voltar para login de usuário
                        </button>
                    </div>

                </div>
            </motion.div>
        </div>
    )
}
