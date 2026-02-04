"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Users, DollarSign, Activity, AlertTriangle, Loader2 } from "lucide-react";
import { GrowthChart } from "@/components/admin/GrowthChart";

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
        mrr: 0,
        health: 98,
        alerts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Users Count
                const { count: userCount, error: userError } = await supabase
                    .from("profiles")
                    .select("*", { count: "exact", head: true });

                // 2. Fetch Alerts (using Support Tickets as proxy for now)
                const { count: alertsCount, error: alertsError } = await supabase
                    .from("support_tickets")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "open"); // Pending tickets as alerts?

                setStats({
                    users: userCount || 0,
                    // Mocking MRR for now until payments are live
                    mrr: (userCount || 0) * 29.90, // Example avg ticket
                    health: 98.5, // Mocked system health for now
                    alerts: alertsCount || 0
                });

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
    <div className="space-y-8">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard do Comandante</h2>
            <p className="text-zinc-400">Visão geral da saúde do sistema e crescimento.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Usuários Totais"
                value="1,234"
                change="+12% este mês"
                icon={Users}
                trend="up"
            />
            <StatCard
                title="MRR"
                value="R$ 12.450"
                change="+5% este mês"
                icon={DollarSign}
                trend="up"
            />
            <StatCard
                title="Saúde do Sistema"
                value="98.2%"
                change="-0.5% vs semana passada"
                icon={Activity}
                trend="down"
            />
            <StatCard
                title="Alertas Críticos"
                value="3"
                change="+2 novos"
                icon={AlertTriangle}
                trend="down"
            />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="mb-4 text-lg font-medium text-white">Crescimento de Usuários</h3>
                <div className="h-[300px] w-full rounded border border-zinc-700 bg-zinc-900/50 p-4">
                    <GrowthChart />
                </div>
            </div>
            <div className="col-span-3 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="mb-4 text-lg font-medium text-white">Últimas Atividades</h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center">
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none text-white">João Silva assinou o plano PRO</p>
                                <p className="text-sm text-zinc-400">Há 2 minutos</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
    );
}
