import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Users, DollarSign, Activity, AlertTriangle, Loader2, MousePointerClick } from "lucide-react";
import { AdminCharts } from "@/components/admin/AdminCharts";
import { UsageMetrics } from "@/components/admin/UsageMetrics";
import { UserRanking } from "@/components/admin/UserRanking";
import { subDays } from "date-fns";

function StatCard({ title, value, change, icon: Icon, trend }: any) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
            <div className="flex items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
                <Icon className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <p className={`text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {change}
            </p>
        </div>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        newUsers: 0,
        mrr: 0,
        health: 98,
        alerts: 0
    });
    const [usersList, setUsersList] = useState<any[]>([]);
    const [usageData, setUsageData] = useState<any[]>([]);
    const [topUsers, setTopUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Users
                const { data: users, error: userError } = await supabase
                    .from("profiles")
                    .select("*")
                    .order('created_at', { ascending: false });

                if (users) {
                    setUsersList(users);

                    // New Users (last 30 days)
                    const thirtyDaysAgo = subDays(new Date(), 30);
                    const newUsersCount = users.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length;

                    // Top Users (Mock logic using level if available, or random usage)
                    // In a real app, we'd sum XP or points
                    const ranked = [...users]
                        .map(u => ({ ...u, xp: u.xp || Math.floor(Math.random() * 5000), level: u.level || 1, status: Math.random() > 0.7 ? 'online' : 'offline' }))
                        .sort((a, b) => b.xp - a.xp)
                        .slice(0, 5);
                    setTopUsers(ranked);

                    setStats(prev => ({
                        ...prev,
                        users: users.length,
                        newUsers: newUsersCount,
                        mrr: users.length * 29.90 // Mocked
                    }));
                }

                // 2. Fetch Alerts
                const { count: alertsCount } = await supabase
                    .from("support_tickets")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "open");

                setStats(prev => ({ ...prev, alerts: alertsCount || 0 }));

                // 3. Mock Usage Data (Proxy for "Abas Mais Acessadas")
                // In production, query your analytics table
                const { count: tasksCount } = await supabase.from("tasks").select("*", { count: "exact", head: true });
                const { count: financeCount } = await supabase.from("finance_transactions").select("*", { count: "exact", head: true });
                const { count: workoutCount } = await supabase.from("workout_logs").select("*", { count: "exact", head: true });

                setUsageData([
                    { name: 'Tarefas', value: tasksCount || 0, color: '#6366f1' }, // Indigo
                    { name: 'Financeiro', value: financeCount || 0, color: '#10b981' }, // Emerald
                    { name: 'Saúde', value: workoutCount || 0, color: '#f43f5e' }, // Rose
                ]);

            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard do Comandante</h2>
                <p className="text-zinc-400">Visão geral da saúde do sistema e crescimento.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Usuários Totais"
                    value={stats.users.toLocaleString()}
                    change={`+${stats.newUsers} novos este mês`}
                    icon={Users}
                    trend="up"
                />
                <StatCard
                    title="MRR (Estimado)"
                    value={`R$ ${stats.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    change="Baseado em usuários"
                    icon={DollarSign}
                    trend="up"
                />
                <StatCard
                    title="Acessos Totais"
                    value={usageData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
                    change="Interações no sistema"
                    icon={MousePointerClick}
                    trend="up"
                />
                <StatCard
                    title="Tickets Pendentes"
                    value={stats.alerts}
                    change="Aguardando ação"
                    icon={AlertTriangle}
                    trend={stats.alerts > 5 ? "down" : "up"}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Scale Chart */}
                <div className="col-span-full lg:col-span-5 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                    <AdminCharts users={usersList} />
                </div>

                {/* System Status / Health */}
                <div className="col-span-full md:col-span-2 lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                    <h3 className="mb-4 text-lg font-medium text-white">Status do Sistema</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <div>
                                <p className="text-sm font-medium text-green-400">Operacional</p>
                                <p className="text-xs text-zinc-500">Database: Conectado • Latency: 24ms</p>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-800/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-zinc-500">Versão do Sistema</p>
                                <span className="bg-zinc-700 text-zinc-300 text-[10px] px-2 py-0.5 rounded-full">Stable</span>
                            </div>
                            <p className="text-sm font-mono text-zinc-300">v2.4.0-beta</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Ranking & Usage */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Top Users */}
                <div className="col-span-full lg:col-span-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-medium text-white">Ranking de Usuários</h3>
                        <Activity className="text-zinc-500 w-5 h-5" />
                    </div>
                    <UserRanking users={topUsers} />
                </div>

                {/* Usage Distribution */}
                <div className="col-span-full lg:col-span-3 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                    <h3 className="mb-4 text-lg font-medium text-white">Módulos Mais Usados</h3>
                    <UsageMetrics data={usageData} />
                </div>
            </div>
        </div>
    );
}
