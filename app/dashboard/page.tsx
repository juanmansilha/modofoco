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
import { FinanceChart } from "@/components/finance/FinanceChart";
import { ExpensePieChart } from "@/components/finance/ExpensePieChart";
import { startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { CashBalanceCard } from "@/components/dashboard/CashBalanceCard";
import { HabitsCard } from "@/components/dashboard/HabitsCard";
import { FinancialSummaryCard } from "@/components/dashboard/FinancialSummaryCard";

export default function DashboardPage() {
    const {
        tasks,
        getItemsForDate,
        runSessions,
        gymRoutines,
        generalRoutines,
        userData // Get userData
    } = useGlobalData();

    // Financial Data State
    const [financialData, setFinancialData] = useState<{
        balance: number;
        expenses: number;
        income: number;
        pendingIncome: number;
        pendingExpenses: number;
        upcomingBills?: any[];
        overdueBills?: any[];
    }>({ balance: 0, expenses: 0, income: 0, pendingIncome: 0, pendingExpenses: 0, upcomingBills: [], overdueBills: [] });
    const [chartData, setChartData] = useState<any[]>([]);
    const [expenseCategoryData, setExpenseCategoryData] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]); // New state
    const [userId, setUserId] = useState<string | null>(null);

    // Authenticate User
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
                const [accountsData, transactions, categories] = await Promise.all([
                    SupabaseFinance.getFinanceAccounts(userId),
                    SupabaseFinance.getFinanceTransactions(userId),
                    SupabaseFinance.getFinanceCategories(userId)
                ]);

                setAccounts(accountsData);

                const totalBalance = accountsData.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0);
                const currentMonth = new Date();

                // Transactions for Stats (Current Month)
                const monthTransactions = transactions.filter((t: any) => {
                    const tDate = new Date(t.date);
                    return tDate.getMonth() === currentMonth.getMonth() &&
                        tDate.getFullYear() === currentMonth.getFullYear();
                });

                // Calculate Stats
                let confirmedIncome = 0;
                let pendingIncome = 0;
                let confirmedExpenses = 0;
                let pendingExpenses = 0;
                let upcomingBillsCount = 0;

                // Future pending transactions (for "Upcoming Bills")
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayStr = format(today, 'yyyy-MM-dd');

                // Get strictly future pending expenses (next 30 days)
                const futurePending = transactions.filter((t: any) => {
                    const tDate = new Date(t.date);
                    return t.type === 'expense' &&
                        t.confirmed === false &&
                        tDate >= today;
                }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 3); // Get next 3

                // Overdue pending expenses (Strictly BEFORE today)
                const overduePending = transactions.filter((t: any) => {
                    return t.type === 'expense' &&
                        t.confirmed === false &&
                        t.date < todayStr;
                }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

                monthTransactions.forEach((t: any) => {
                    if (t.type === 'income') {
                        if (t.confirmed !== false) confirmedIncome += t.amount;
                        else pendingIncome += t.amount;
                    } else {
                        if (t.confirmed !== false) confirmedExpenses += t.amount;
                        else pendingExpenses += t.amount;
                    }
                });

                setFinancialData({
                    balance: totalBalance,
                    expenses: confirmedExpenses,
                    income: confirmedIncome,
                    pendingIncome,
                    pendingExpenses,
                    upcomingBills: futurePending,
                    overdueBills: overduePending // Pass overdue bills
                });

                // Chart Data (Daily)
                const start = startOfMonth(currentMonth);
                const end = endOfMonth(currentMonth);
                const days = eachDayOfInterval({ start, end });

                const cData = days.map(day => {
                    const dayTransactions = monthTransactions.filter((t: any) => isSameDay(new Date(t.date), day));
                    const inc = dayTransactions.filter((t: any) => t.type === "income").reduce((sum: number, t: any) => sum + t.amount, 0);
                    const exp = dayTransactions.filter((t: any) => t.type === "expense").reduce((sum: number, t: any) => sum + t.amount, 0);
                    return { day: format(day, "dd"), income: inc, expense: exp };
                });
                setChartData(cData);

                // Pie Chart Data
                const expMap = new Map();
                monthTransactions.filter((t: any) => t.type === 'expense').forEach((t: any) => {
                    const curr = expMap.get(t.category) || 0;
                    expMap.set(t.category, curr + t.amount);
                });

                const pData: any[] = [];
                expMap.forEach((amount, categoryName) => {
                    const categoryDef = categories.find((c: any) => c.name === categoryName);
                    // Match logic from FinancePage
                    let color = "#71717a";
                    if (categoryDef) {
                        const colorMap: Record<string, string> = {
                            "bg-emerald-500": "#10b981",
                            "bg-green-500": "#22c55e",
                            "bg-orange-500": "#f97316",
                            "bg-blue-500": "#3b82f6",
                            "bg-purple-500": "#a855f7",
                            "bg-pink-500": "#ec4899",
                            "bg-red-500": "#ef4444",
                            "bg-indigo-500": "#6366f1",
                            "bg-yellow-500": "#eab308",
                            "bg-cyan-500": "#06b6d4",
                            "bg-teal-500": "#14b8a6",
                            "bg-lime-500": "#84cc16",
                            "bg-fuchsia-500": "#d946ef",
                            "bg-rose-500": "#f43f5e",
                            "bg-slate-500": "#64748b",
                            "bg-zinc-500": "#71717a",
                        };

                        const colorKey = categoryDef.color as string;
                        color = (colorKey && colorMap[colorKey]) || colorKey || "#71717a";
                    }
                    pData.push({ name: categoryName, value: amount, color });
                });
                setExpenseCategoryData(pData.sort((a, b) => b.value - a.value));

            } catch (e) {
                console.error('Error loading financial data:', e);
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

            {/* TOP ROW: Focus (50%), Cash (25%), Habits (25%) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Main Focus (Span 2) */}
                <Card className="col-span-1 md:col-span-2 bg-linear-to-br from-indigo-950/40 to-black border-indigo-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Target size={20} className="text-indigo-400" />
                    </div>
                    <div className="flex flex-col h-full justify-between p-4">
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

                {/* Cash Balance */}
                <CashBalanceCard balance={financialData.balance} />

                {/* Habits */}
                <HabitsCard completed={completedItems} total={totalItems} />
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Health & Charts (Span 2) */}
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

                    {/* Finance Flow Chart (Moved here to fill space) */}
                    <Card className="p-6 border-white/5 bg-zinc-900/30">
                        <h3 className="font-bold text-white flex items-center gap-2 mb-6">
                            <Activity size={18} className="text-indigo-500" />
                            Fluxo Financeiro (Mensal)
                        </h3>
                        <FinanceChart data={chartData} />
                    </Card>

                </div>

                {/* Right Column: Finance Summary & Tasks (Span 1) */}
                <div className="space-y-6">

                    {/* Financial Summary */}
                    <FinancialSummaryCard
                        financialData={financialData}
                        categoryData={expenseCategoryData}
                    />

                    {/* Next Tasks */}
                    <Card className="p-6 border-white/5 bg-zinc-900/30">
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
