"use client";

import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from "recharts";
import {
    ShoppingBag,
    Utensils,
    Car,
    Home,
    CreditCard,
    Zap,
    BookOpen,
    DollarSign,
    MoreHorizontal,
    Landmark,
    TrendingUp,
    Activity
} from "lucide-react";

interface ExpensePieChartProps {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
}

const CATEGORY_ICONS: Record<string, any> = {
    "Alimentação": Utensils,
    "Transporte": Car,
    "Carro": Car,
    "Moradia": Home,
    "Casa": Home,
    "Lazer": ShoppingBag,
    "Compras": ShoppingBag,
    "Cartão de Crédito": CreditCard,
    "Fatura": CreditCard,
    "Contas": Zap,
    "Educação": BookOpen,
    "Faculdade": BookOpen,
    "Saúde": Activity, // Need to import Activity if used
    "Investimentos": TrendingUp,
    "Salário": DollarSign,
    "Freelance": DollarSign,
    "Empréstimos": Landmark,
    "Limite da Conta": Landmark,
    "Cheque Especial": Landmark,
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-950 border border-white/10 p-3 rounded-lg shadow-xl">
                <p className="font-bold text-white mb-1">{payload[0].name}</p>
                <p className="text-sm text-zinc-300">
                    {payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
            </div>
        );
    }
    return null;
};

const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;

    return (
        <ul className="flex flex-wrap justify-center gap-2 p-2 max-h-[100px] overflow-y-auto custom-scrollbar w-full">
            {payload.map((entry: any, index: number) => {
                // Try to find icon by exact name or partial match? For now, exact.
                // Note: entry.value is the category name
                const Icon = CATEGORY_ICONS[entry.value] || MoreHorizontal;
                return (
                    <li key={`item-${index}`} className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white transition-colors bg-white/5 px-2 py-1 rounded-full border border-white/5">
                        <Icon size={12} style={{ color: entry.color }} />
                        <span className="truncate max-w-[100px]" title={entry.value}>{entry.value}</span>
                    </li>
                );
            })}
        </ul>
    );
};

export function ExpensePieChart({ data }: ExpensePieChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-zinc-500">
                <p>Sem dados de despesas</p>
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        innerRadius="60%"
                        outerRadius="80%"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        content={<CustomLegend />}
                        wrapperStyle={{ width: '100%', paddingTop: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
