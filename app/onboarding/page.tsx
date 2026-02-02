"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, User, Hash, Zap, LayoutDashboard, Calendar, Activity, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { cn } from "@/lib/utils";

const STEPS = [
    { id: "welcome", title: "Bem-vindo" },
    { id: "name", title: "Seu Nome" },
    { id: "discovery", title: "Conexão" },
    { id: "focus", title: "Objetivo" },
    { id: "whatsapp", title: "WhatsApp" },
    { id: "setup", title: "Configurando..." }
];

const DISCOVERY_OPTIONS = [
    { id: "instagram", label: "Instagram", icon: "📸" },
    { id: "linkedin", label: "LinkedIn", icon: "💼" },
    { id: "indication", label: "Indicação", icon: "🤝" },
    { id: "google", label: "Google", icon: "🔍" },
    { id: "other", label: "Outros", icon: "🌐" }
];

const FOCUS_OPTIONS = [
    { id: "tasks", label: "Produtividade", icon: LayoutDashboard, desc: "Gerenciar tarefas e projetos." },
    { id: "routine", label: "Rotina & Hábitos", icon: Calendar, desc: "Construir disciplina diária." },
    { id: "health", label: "Saúde & Fitness", icon: Activity, desc: "Monitorar treinos e dieta." },
    { id: "finance", label: "Financeiro", icon: Zap, desc: "Controle de gastos pessoais." }
];

export default function OnboardingPage() {
    const router = useRouter();
    const { updateUserData } = useGlobalData();

    // State
    const [currentStep, setCurrentStep] = useState(0);
    const [name, setName] = useState("");
    const [discovery, setDiscovery] = useState("");
    const [focus, setFocus] = useState<string[]>([]);
    const [whatsapp, setWhatsapp] = useState("");

    // Check for temp name from signup
    useEffect(() => {
        const tempName = localStorage.getItem("mf_temp_username");
        if (tempName) {
            setName(tempName);
        }
    }, []);

    // Handlers
    const nextStep = () => setCurrentStep(prev => prev + 1);

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) nextStep();
    };

    const handleWhatsappSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Trigger final setup
        nextStep();
    };

    // Auto-advance setup
    useEffect(() => {
        if (STEPS[currentStep].id === "setup") {
            const timer = setTimeout(() => {
                // Save Data
                updateUserData({
                    name,
                    discovery,
                    focus,
                    whatsapp,
                    onboardingCompleted: true
                });

                // Redirect
                router.push("/dashboard");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [currentStep, name, discovery, focus, whatsapp, updateUserData, router]);

    // Animations
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden text-white font-sans selection:bg-indigo-500/30">

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900 z-50">
                <motion.div
                    className="h-full bg-white"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Background */}
            <div className="absolute inset-0 pointer-events-none bg-[#050505]" />

            <div className="flex-1 flex items-center justify-center p-4">
                <AnimatePresence mode="wait" custom={1}>

                    {/* STEP 1: WELCOME */}
                    {STEPS[currentStep].id === "welcome" && (
                        <motion.div
                            key="welcome"
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="text-center max-w-lg"
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mb-8 relative inline-block"
                            >
                                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
                                    ModoFoco
                                </h1>
                            </motion.div>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-xl text-zinc-400 mb-12 leading-relaxed"
                            >
                                Prepare-se para elevar sua produtividade <br /> a um novo nível de excelência.
                            </motion.p>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Button size="lg" onClick={nextStep} className="rounded-full px-10 h-14 text-lg bg-white text-black hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.1)] group">
                                    Iniciar Jornada
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* STEP 2: NAME */}
                    {STEPS[currentStep].id === "name" && (
                        <motion.div
                            key="name"
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="w-full max-w-md"
                        >
                            <h2 className="text-3xl font-bold text-center mb-2">Primeiro, quem é você?</h2>
                            <p className="text-zinc-500 text-center mb-8">Queremos personalizar sua experiência.</p>

                            <form onSubmit={handleNameSubmit} className="space-y-6">
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <Input
                                        autoFocus
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Digite seu nome..."
                                        className="h-16 text-lg pl-12 bg-zinc-900/50 border-zinc-800 focus:border-indigo-500/50 rounded-2xl transition-all shadow-xl"
                                    />
                                </div>
                                <Button disabled={!name} type="submit" size="lg" className="w-full h-14 text-lg rounded-xl">
                                    Continuar
                                </Button>
                            </form>
                        </motion.div>
                    )}

                    {/* STEP 3: DISCOVERY */}
                    {STEPS[currentStep].id === "discovery" && (
                        <motion.div
                            key="discovery"
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="w-full max-w-2xl"
                        >
                            <h2 className="text-3xl font-bold text-center mb-8">Como você nos conheceu?</h2>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {DISCOVERY_OPTIONS.map((opt, idx) => (
                                    <motion.button
                                        key={opt.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => {
                                            setDiscovery(opt.id);
                                            setTimeout(nextStep, 300);
                                        }}
                                        className={cn(
                                            "h-32 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]",
                                            discovery === opt.id
                                                ? "bg-indigo-500 text-white border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                                : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                                        )}
                                    >
                                        <span className="text-4xl">{opt.icon}</span>
                                        <span className="font-medium">{opt.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: FOCUS */}
                    {STEPS[currentStep].id === "focus" && (
                        <motion.div
                            key="focus"
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="w-full max-w-3xl"
                        >
                            <h2 className="text-3xl font-bold text-center mb-2">Qual seu foco principal?</h2>
                            <p className="text-zinc-500 text-center mb-8">Selecione todas as áreas que deseja gerenciar.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {FOCUS_OPTIONS.map((opt, idx) => (
                                    <motion.div
                                        key={opt.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => {
                                            if (focus.includes(opt.id)) {
                                                setFocus(prev => prev.filter(f => f !== opt.id));
                                            } else {
                                                setFocus(prev => [...prev, opt.id]);
                                            }
                                        }}
                                        className={cn(
                                            "p-6 rounded-2xl border cursor-pointer transition-all duration-300 relative group overflow-hidden",
                                            focus.includes(opt.id)
                                                ? "bg-zinc-900 border-indigo-500/50 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.5)]"
                                                : "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/80"
                                        )}
                                    >
                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className={cn(
                                                "p-3 rounded-xl transition-colors",
                                                focus.includes(opt.id) ? "bg-indigo-500 text-white" : "bg-black/40 text-zinc-500 group-hover:text-white"
                                            )}>
                                                <opt.icon size={24} />
                                            </div>
                                            <div>
                                                <h3 className={cn("font-bold text-lg mb-1 transition-colors", focus.includes(opt.id) ? "text-white" : "text-zinc-300")}>
                                                    {opt.label}
                                                </h3>
                                                <p className="text-sm text-zinc-500 leading-snug">{opt.desc}</p>
                                            </div>
                                            <div className="ml-auto">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                                                    focus.includes(opt.id) ? "bg-indigo-500 border-indigo-500" : "border-zinc-700"
                                                )}>
                                                    {focus.includes(opt.id) && <Check size={14} className="text-white" />}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-center">
                                <Button
                                    onClick={nextStep}
                                    size="lg"
                                    className="px-8 rounded-xl h-12"
                                    disabled={focus.length === 0}
                                >
                                    Confirmar Seleção ({focus.length})
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: WHATSAPP */}
                    {STEPS[currentStep].id === "whatsapp" && (
                        <motion.div
                            key="whatsapp"
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="w-full max-w-md"
                        >
                            <h2 className="text-3xl font-bold text-center mb-2">Conecte-se</h2>
                            <p className="text-zinc-500 text-center mb-8">Para notificações importantes e lembretes.</p>

                            <form onSubmit={handleWhatsappSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">WhatsApp</label>
                                    <div className="relative group">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-500 transition-colors" />
                                        <Input
                                            autoFocus
                                            value={whatsapp}
                                            onChange={(e) => setWhatsapp(e.target.value)}
                                            placeholder="(00) 00000-0000"
                                            className="h-14 pl-12 bg-zinc-900/50 border-zinc-800 focus:border-green-500/50 rounded-xl transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-600 text-right px-1">*Opcional, mas recomendado.</p>
                                </div>
                                <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-xl bg-green-600 hover:bg-green-500 text-white">
                                    Finalizar Cadastro
                                </Button>
                            </form>
                        </motion.div>
                    )}

                    {/* STEP 6: SETUP / LOADING */}
                    {STEPS[currentStep].id === "setup" && (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                        >
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
                                <div className="absolute inset-0 border-4 border-t-indigo-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="animate-pulse text-white" size={32} />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold mb-2">Configurando seu ambiente...</h2>
                            <div className="h-6 overflow-hidden relative">
                                <motion.div
                                    animate={{ y: [-24, 0, -24] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="flex flex-col gap-2 items-center text-zinc-500 text-sm"
                                >
                                    <span>Criando estrutura de dados...</span>
                                    <span>Personalizando dashboard...</span>
                                    <span>Sincronizando preferências...</span>
                                    <span>Tudo pronto!</span>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Steps Indicator */}
            {currentStep > 0 && currentStep < STEPS.length - 1 && (
                <div className="absolute bottom-8 left-0 w-full text-center text-zinc-600 text-sm font-medium tracking-widest uppercase">
                    Passo {currentStep} de {STEPS.length - 2}
                </div>
            )}
        </div>
    );
}
