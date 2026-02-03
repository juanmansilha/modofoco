"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle } from "lucide-react";

interface FinancialHealthCardProps {
    transactions: any[];
    currentMonth: Date;
}

export function FinancialHealthCard({ transactions, currentMonth }: FinancialHealthCardProps) {
    const stats = useMemo(() => {
        const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const monthTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date >= start && date <= end;
        });

        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const savings = income - expense;
        const savingsRate = income > 0 ? (savings / income) * 100 : 0;

        return { income, expense, savings, savingsRate };
    }, [transactions, currentMonth]);

    const healthStatus = useMemo(() => {
        if (stats.savingsRate >= 20) return { label: "Excelente", color: "text-emerald-500", icon: CheckCircle, message: "Você está economizando muito bem!" };
        if (stats.savingsRate > 0) return { label: "Saudável", color: "text-blue-500", icon: Activity, message: "Você está no azul, continue assim." };
        if (stats.savingsRate === 0 && stats.income > 0) return { label: "Equilibrado", color: "text-yellow-500", icon: AlertTriangle, message: "Você gasta tudo que ganha." };
        return { label: "Atenção", color: "text-red-500", icon: TrendingDown, message: "Gastos superam ganhos." };
    }, [stats]);

    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-full relative overflow-hidden">
            {/* Background Decoration */}
            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-5 blur-2xl ${healthStatus.color.replace('text-', 'bg-')}`}></div>

            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={20} className="text-zinc-400" />
                    <h3 className="text-sm font-medium text-zinc-400">Saúde Financeira</h3>
                </div>

                <div className="flex items-end gap-3 mb-2">
                    <span className={`text-4xl font-bold ${healthStatus.color}`}>
                        {stats.savingsRate.toFixed(1)}%
                    </span>
                    <span className="text-zinc-500 mb-1 font-medium">de economia</span>
                </div>

                <div className="flex items-center gap-2 mb-6">
                    <healthStatus.icon size={16} className={healthStatus.color} />
                    <span className={`text-sm font-medium ${healthStatus.color}`}>{healthStatus.label}</span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Ganhos</span>
                    <span className="text-white font-medium">{stats.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Gastos</span>
                    <span className="text-white font-medium">{stats.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-red-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((stats.expense / (stats.income || 1)) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

            <p className="mt-4 text-xs text-zinc-500">
                {healthStatus.message}
            </p>
        </div>
    );
}
