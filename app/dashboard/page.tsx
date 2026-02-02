"use client";

import { useMemo, useState, useEffect } from "react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    DollarSign,
    Activity,
    Calendar,
    Target,
    Zap,
    Clock,
    Wallet,
    CreditCard,
    ShoppingBag,
    Utensils,
    Car,
    Home
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import * as SupabaseFinance from "@/lib/supabase-finance";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { useGamification } from "@/contexts/GamificationContext";
import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

export default function DashboardPage() {
    const {
        tasks,
        getItemsForDate,
        runSessions,
        gymRoutines,
        generalRoutines,
        userData // Get userData
    } = useGlobalData();
    const { level, progress } = useGamification();

    // Financial Data
    const [financialData, setFinancialData] = useState({ balance: 0, expenses: 0, income: 0 });
    const [userId, setUserId] = useState<string | null>(null);

    // Get user ID from Supabase auth
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        getUser();
    }, []);

    useEffect(() => {
        if (!userId) return;

        const loadFinanceData = async () => {
            try {
                const [accounts, transactions] = await Promise.all([
                    SupabaseFinance.getFinanceAccounts(userId),
                    SupabaseFinance.getFinanceTransactions(userId)
                ]);

                const totalBalance = accounts.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0);

                const currentMonth = new Date();
                const monthTransactions = transactions.filter((t: any) => {
                    const tDate = new Date(t.date);
                    return tDate.getMonth() === currentMonth.getMonth() &&
                        tDate.getFullYear() === currentMonth.getFullYear() &&
                        t.confirmed !== false; // Only confirmed for main stats
                });

                const expenses = monthTransactions
                    .filter((t: any) => t.type === 'expense')
                    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

                const income = monthTransactions
                    .filter((t: any) => t.type === 'income')
                    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

                setFinancialData({ balance: totalBalance, expenses, income });
            } catch (e) {
                console.error('Error loading financial data from Supabase:', e);
            }
        };

        loadFinanceData();
    }, [userId]);

    // Greeting
    const [greeting, setGreeting] = useState("Bem-vindo");
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Bom dia");
        else if (hour < 18) setGreeting("Boa tarde");
        else setGreeting("Boa noite");
    }, []);

    // Date
    const today = new Date();
    const todayItems = getItemsForDate(today);

    // Filtered Tasks (High Priority & Not Done)
    const priorityTasks = tasks
        .filter(t => t.status !== "done" && t.priority === "high")
        .slice(0, 3);

    const nextTasks = tasks
        .filter(t => t.status !== "done")
        .sort((a, b) => { // High prio first
            const pMap = { high: 3, medium: 2, low: 1 };
            return pMap[b.priority] - pMap[a.priority];
        })
        .slice(0, 5);

    // Habits Progress
    const completedItems = todayItems.filter(i => i.isCompleted).length;
    const totalItems = todayItems.length;
    const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Weekly Activity Chart Data
    const activityData = useMemo(() => {
        const end = new Date();
        const start = subDays(end, 6);
        const days = eachDayOfInterval({ start, end });

        return days.map(day => {
            const dayStr = format(day, "yyyy-MM-dd");
            const run = runSessions.find(r => r.date === dayStr);
            const gym = gymRoutines.find(g => g.lastPerformed === dayStr);

            let activityLevel = 0;
            if (run) activityLevel += (run.dist || 0) * 10;
            if (gym) activityLevel += 50;

            return {
                day: format(day, "EEE", { locale: ptBR }),
                value: activityLevel,
                fullDate: dayStr
            };
        });
    }, [runSessions, gymRoutines]);

    return (
        <div className="space-y-6 p-4 md:p-8 h-full overflow-y-auto custom-scrollbar bg-background text-foreground pb-24">

            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        {greeting}, <span className="text-indigo-400">{userData?.name || "Visitante"}</span>
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Você tem <span className="text-white font-bold">{tasks.filter(t => t.status !== "done").length} tarefas</span> pendentes para hoje.
                    </p>
                </div>

            </div>

            {/* Top Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Main Focus / Priority */}
                <Card className="col-span-1 md:col-span-2 bg-linear-to-br from-indigo-950/40 to-black border-indigo-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Target size={20} className="text-indigo-400" />
                    </div>
                    <div className="flex flex-col h-full justify-between p-1">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-indigo-400/80 mb-2 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                Foco Principal
                            </p>
                            {priorityTasks.length > 0 ? (
                                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                                    {priorityTasks[0].title}
                                </h3>
                            ) : (
                                <h3 className="text-xl md:text-2xl font-bold text-zinc-500 leading-tight">
                                    Sem tarefas urgentes!
                                </h3>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-4 text-sm text-zinc-400">
                                {priorityTasks.length > 0 && (
                                    <span className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded text-xs">
                                        <Clock size={12} />
                                        Prioridade Alta
                                    </span>
                                )}
                                <span className="text-xs">
                                    {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Em Caixa (Balance) */}
                <Card className="hover:border-emerald-500/20 transition-all cursor-pointer group bg-zinc-900/30">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted group-hover:text-emerald-400 transition-colors">Em Caixa</p>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <Wallet size={16} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white tracking-tight">
                        R$ {financialData.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {financialData.income > financialData.expenses ? (
                        <div className="flex items-center text-emerald-500 text-xs mt-2 font-medium bg-emerald-500/5 py-1 px-2 rounded w-fit">
                            <ArrowUpRight size={12} className="mr-1" />
                            <span>Receitas em alta</span>
                        </div>
                    ) : financialData.expenses > 0 ? (
                        <div className="flex items-center text-red-500 text-xs mt-2 font-medium bg-red-500/5 py-1 px-2 rounded w-fit">
                            <ArrowDownRight size={12} className="mr-1" />
                            <span>Atenção aos gastos</span>
                        </div>
                    ) : null}
                </Card>

                {/* Habits Score */}
                <Card className="hover:border-blue-500/20 transition-all cursor-pointer group bg-zinc-900/30">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted group-hover:text-blue-400 transition-colors">Hábitos Hoje</p>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-white tracking-tight">{completedItems}</p>
                        <span className="text-muted text-sm mb-1">/ {totalItems}</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            className="bg-blue-600 h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                        />
                    </div>
                </Card>
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Health & Agenda */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Health Chart */}
                    <Card className="p-6 border-white/5 bg-zinc-900/30">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Activity size={18} className="text-rose-500" />
                                    Saúde & Performance
                                </h3>
                                <p className="text-xs text-muted mt-1">Consistência de treinos e atividades</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full bg-rose-500 block"></span>
                            </div>
                        </div>

                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activityData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="day"
                                        stroke="#666"
                                        tick={{ fill: "#666", fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#000", border: "1px solid #333", borderRadius: "8px" }}
                                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {activityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.value > 0 ? "#E11D48" : "#27272a"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Timeline / Agenda */}
                    <Card className="p-6 border-white/5 bg-zinc-900/30">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Calendar size={18} className="text-indigo-500" />
                                Agenda de Hoje
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {todayItems.length === 0 ? (
                                <p className="text-center text-zinc-500 py-8 text-sm">Nada agendado para hoje.</p>
                            ) : (
                                todayItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group">
                                        <div className="w-12 text-center">
                                            <span className="text-xs font-bold text-zinc-300 block">{item.time}</span>
                                        </div>
                                        <div className={`flex-1 p-3 rounded-xl border border-white/5 flex items-center justify-between transition-all ${item.isCompleted
                                            ? "bg-zinc-900/50 opacity-60"
                                            : "bg-[#0A0A0A] hover:border-indigo-500/30"
                                            }`}>
                                            <div>
                                                <h4 className={`text-sm font-medium ${item.isCompleted ? "text-zinc-500 line-through" : "text-white"}`}>
                                                    {item.title}
                                                </h4>
                                                {item.subtitle && <p className="text-xs text-zinc-500">{item.subtitle}</p>}
                                            </div>
                                            <div className="h-2 w-2 rounded-full bg-indigo-500/50" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                </div>

                {/* Right Column: Finance & Tasks */}
                <div className="space-y-6">

                    {/* Next Tasks List (Collapsed) */}
                    <Card className="p-6 border-white/5 bg-zinc-900/30 h-fit">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Target size={18} className="text-amber-500" />
                                Próximas Tarefas
                            </h3>
                        </div>
                        <div className="space-y-1">
                            {nextTasks.length === 0 ? (
                                <p className="text-zinc-500 text-sm">Tudo limpo!</p>
                            ) : (
                                nextTasks.slice(0, 3).map(task => (
                                    <div key={task.id} className="p-3 hover:bg-white/5 rounded-lg transition-colors flex items-start gap-3 group cursor-pointer border border-transparent hover:border-white/5">
                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${task.priority === 'high' ? 'bg-red-500' :
                                            task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-zinc-200 truncate group-hover:text-white transition-colors">{task.title}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button className="w-full mt-4 py-2 text-xs font-medium text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5">
                            Ver mais
                        </button>
                    </Card>

                </div>

            </div>
        </div>
    );
}
