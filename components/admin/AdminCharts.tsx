"use client";

import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdminChartsProps {
    users: any[]; // Using users to mock revenue/growth
}

type TimeRange = '7d' | '30d' | '90d' | '1y';

export function AdminCharts({ users }: AdminChartsProps) {
    const [range, setRange] = useState<TimeRange>('30d');

    const chartData = useMemo(() => {
        const now = new Date();
        let startDate = subDays(now, 30);
        let dateFormat = "dd/MM";

        if (range === '7d') startDate = subDays(now, 7);
        if (range === '30d') startDate = subDays(now, 30);
        if (range === '90d') startDate = subDays(now, 90);
        if (range === '1y') {
            startDate = subDays(now, 365);
            dateFormat = "MMM/yy";
        }

        const days = eachDayOfInterval({ start: startDate, end: now });

        // Aggregate data
        return days.map(day => {
            // Count users created up to this day (Cumulative)
            const activeUsers = users.filter(u => new Date(u.created_at) <= day).length;

            // Mock MRR: Users * R$ 29.90
            const mrr = activeUsers * 29.90;

            return {
                date: format(day, dateFormat, { locale: ptBR }),
                fullDate: day,
                users: activeUsers,
                mrr: mrr
            };
        });
    }, [users, range]);


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-white">Crescimento Financeiro</h3>
                    <p className="text-sm text-zinc-400">Receita Recorrente Mensal (Estimada)</p>
                </div>
                <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    <button
                        onClick={() => setRange('7d')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${range === '7d' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        7D
                    </button>
                    <button
                        onClick={() => setRange('30d')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${range === '30d' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        30D
                    </button>
                    <button
                        onClick={() => setRange('90d')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${range === '90d' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        3M
                    </button>
                    <button
                        onClick={() => setRange('1y')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${range === '1y' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        1A
                    </button>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#71717a"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={20}
                        />
                        <YAxis
                            stroke="#71717a"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `R$ ${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#18181b",
                                borderColor: "#27272a",
                                borderRadius: "12px",
                                color: "#fff"
                            }}
                            itemStyle={{ color: "#818cf8" }}
                            formatter={(value: any) => [value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'MRR']}
                            labelStyle={{ color: "#a1a1aa", marginBottom: '0.5rem' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="mrr"
                            stroke="#6366f1"
                            fillOpacity={1}
                            fill="url(#colorMrr)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
