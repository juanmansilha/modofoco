"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface FinanceChartProps {
    data: any[];
}

export function FinanceChart({ data }: FinanceChartProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#71717a", fontSize: 12 }}
                        dy={10}
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
                    />
                    <Bar dataKey="income" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="expense" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
