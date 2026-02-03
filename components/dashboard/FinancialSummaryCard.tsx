import { ArrowUpCircle, ArrowDownCircle, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface FinancialSummaryCardProps {
    financialData: {
        income: number;
        expenses: number;
        pendingIncome: number;
        pendingExpenses: number;
        nextBill?: any;
        overdueBills?: any[];
    };
    categoryData: any[];
}

export function FinancialSummaryCard({ financialData, categoryData }: FinancialSummaryCardProps) {
    const totalFlow = financialData.income + financialData.expenses;
    // const savingsRate = totalFlow > 0 ? ((financialData.income - financialData.expenses) / financialData.income) * 100 : 0;
    const nextBill = financialData.nextBill;

    return (
        <Card className="p-6 border-white/5 bg-zinc-900/30 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <DollarSign size={18} className="text-indigo-500" />
                    Resumo Financeiro
                </h3>
            </div>

            {/* Income vs Expenses Side-by-Side */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-2 mb-2 text-emerald-500">
                        <ArrowUpCircle size={14} />
                        <span className="text-xs font-medium uppercase">Entradas</span>
                    </div>
                    <p className="text-lg font-bold text-white">
                        {financialData.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    {financialData.pendingIncome > 0 && (
                        <p className="text-[10px] text-zinc-500 mt-1">
                            + {financialData.pendingIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} pendente
                        </p>
                    )}
                </div>
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <div className="flex items-center gap-2 mb-2 text-red-500">
                        <ArrowDownCircle size={14} />
                        <span className="text-xs font-medium uppercase">Saídas</span>
                    </div>
                    <p className="text-lg font-bold text-white">
                        {financialData.expenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    {financialData.pendingExpenses > 0 && (
                        <p className="text-[10px] text-zinc-500 mt-1">
                            + {financialData.pendingExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} pendente
                        </p>
                    )}
                </div>
            </div>

            {/* Category Breakdown */}
            <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Gastos por Categoria</p>
                <div className="space-y-3">
                    {categoryData.slice(0, 5).map((cat, idx) => {
                        const totalExpenses = financialData.expenses + financialData.pendingExpenses;
                        const percent = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0;
                        return (
                            <div key={idx} className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: cat.color + '20', color: cat.color }}
                                >
                                    {/* Ideally map icons here, using generic dot for now */}
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-zinc-300 truncate">{cat.name}</span>
                                        <span className="text-xs text-zinc-500">{percent.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${percent}%`, backgroundColor: cat.color }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {categoryData.length === 0 && (
                        <p className="text-xs text-zinc-600 text-center py-2">Sem dados de gastos ainda.</p>
                    )}
                </div>
            </div>

            {/* Upcoming / Overdue Bills */}
            <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                    {financialData.overdueBills && financialData.overdueBills.length > 0 ? (
                        <span className="text-red-500 flex items-center gap-1 animate-pulse">
                            <AlertCircle size={12} />
                            Contas Atrasadas
                        </span>
                    ) : (
                        "Próximo Vencimento"
                    )}
                </p>

                <div className={`rounded-xl border p-3 flex items-center justify-between ${financialData.overdueBills && financialData.overdueBills.length > 0
                    ? "bg-red-500/10 border-red-500/20"
                    : "bg-zinc-900/50 border-white/5"
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${financialData.overdueBills && financialData.overdueBills.length > 0
                            ? "bg-red-500/20 text-red-500"
                            : "bg-zinc-800 text-zinc-400"
                            }`}>
                            {financialData.overdueBills && financialData.overdueBills.length > 0 ? <AlertCircle size={16} /> : <TrendingUp size={16} />}
                        </div>
                        <div>
                            {financialData.overdueBills && financialData.overdueBills.length > 0 ? (
                                <>
                                    <p className="text-sm font-bold text-white">{financialData.overdueBills.length} conta(s) pendente(s)</p>
                                    <p className="text-xs text-red-400">
                                        Total: {financialData.overdueBills.reduce((acc: number, curr: any) => acc + curr.amount, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </>
                            ) : nextBill ? (
                                <>
                                    <p className="text-sm font-medium text-white">{nextBill.description}</p>
                                    <p className="text-xs text-zinc-500">
                                        {new Date(nextBill.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} • {nextBill.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-medium text-white">Sem contas próximas</p>
                                    <p className="text-xs text-zinc-500">Parabéns!</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </Card>
    );
}
