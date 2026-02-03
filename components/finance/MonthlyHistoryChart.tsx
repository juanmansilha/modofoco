"use client";

import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthlyHistoryChartProps {
    transactions: any[];
}

export function MonthlyHistoryChart({ transactions }: MonthlyHistoryChartProps) {
    const data = useMemo(() => {
        const today = new Date();
        const last6Months: any[] = [];

        // Generate last 6 months buckets
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(today, i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            const monthTransactions = transactions.filter(t =>
                isWithinInterval(new Date(t.date), { start, end })
            );

            const income = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((acc, curr) => acc + curr.amount, 0);

            const expense = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((acc, curr) => acc + curr.amount, 0);

            last6Months.push({
                name: format(date, 'MMM', { locale: ptBR }),
                fullDate: format(date, 'MMMM yyyy', { locale: ptBR }),
                income,
                expense,
                balance: income - expense
            });
        }

        return last6Months;
    }, [transactions]);

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#71717a", fontSize: 12 }}
                        dy={10}
                        tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#71717a", fontSize: 12 }}
                        tickFormatter={(value) => `R$${value / 1000}k`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#ffffff10", borderRadius: "8px" }}
                        itemStyle={{ color: "#fff" }}
                        cursor={{ fill: "#ffffff05" }}
                        formatter={(value: any) => typeof value === 'number' ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : value}
                        labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="income" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="expense" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
