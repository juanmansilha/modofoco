"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Tag, ArrowRightLeft } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { AccountCard } from "@/components/finance/AccountCard";
import { AccountModal } from "@/components/finance/AccountModal";
import { TransactionList } from "@/components/finance/TransactionList";
import { TransactionModal } from "@/components/finance/TransactionModal";
import { TransferModal } from "@/components/finance/TransferModal";
import { FinanceChart } from "@/components/finance/FinanceChart";
import { ExpensePieChart } from "@/components/finance/ExpensePieChart";
import { PageBanner } from "@/components/ui/PageBanner";
import { CategoryManager } from "@/components/finance/CategoryManager";
import { useGamification } from "@/contexts/GamificationContext";
import { FOCO_POINTS } from "@/lib/gamification";
import * as SupabaseFinance from "@/lib/supabase-finance";
import { supabase } from "@/lib/supabase";

// Mock Data Intializers
const INITIAL_ACCOUNTS: any[] = [];

const INITIAL_CATEGORIES = [
    { id: "1", name: "Salário", type: "income" as const, color: "bg-emerald-500" },
    { id: "2", name: "Freelance", type: "income" as const, color: "bg-green-500" },
    { id: "3", name: "Alimentação", type: "expense" as const, color: "bg-orange-500" },
    { id: "4", name: "Transporte", type: "expense" as const, color: "bg-blue-500" },
    { id: "5", name: "Moradia", type: "expense" as const, color: "bg-purple-500" },
    { id: "6", name: "Lazer", type: "expense" as const, color: "bg-pink-500" },
];

export default function FinancePage() {
    const { awardFP } = useGamification();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [accounts, setAccounts] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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

    // Load from Supabase on mount
    useEffect(() => {
        if (!userId) return;

        const loadData = async () => {
            try {
                setIsLoading(true);
                const [accountsData, transactionsData, categoriesData] = await Promise.all([
                    SupabaseFinance.getFinanceAccounts(userId),
                    SupabaseFinance.getFinanceTransactions(userId),
                    SupabaseFinance.getFinanceCategories(userId)
                ]);

                setAccounts(accountsData);
                setTransactions(transactionsData);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error loading finance data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [userId]);


    // Helpers
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    // Modals & Editing
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<any>(null);
    const [editingTransaction, setEditingTransaction] = useState<any>(null);

    // Categories State
    const [categories, setCategories] = useState<any[]>([]);

    const handleSaveCategories = async (newCategories: any[]) => {
        if (!userId) return;
        try {
            // Simple sync: delete all and insert new ones
            await SupabaseFinance.syncFinanceCategories(userId, newCategories);
            setCategories(newCategories);
        } catch (error) {
            console.error('Error syncing categories:', error);
        }
    };

    // --- Logic ---

    const filteredTransactions = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        return transactions.filter(t => {
            const date = new Date(t.date);
            return date >= start && date <= end;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, currentMonth]);

    const expenseCategoryData = useMemo(() => {
        const expenses = filteredTransactions.filter(t => t.type === 'expense');
        const categoryMap = new Map();

        expenses.forEach(t => {
            const current = categoryMap.get(t.category) || 0;
            categoryMap.set(t.category, current + t.amount);
        });

        const data: any[] = [];
        categoryMap.forEach((amount, categoryName) => {
            const categoryDef = categories.find(c => c.name === categoryName);
            // Default color if not found
            let color = "#71717a"; // zinc-500
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
                color = colorMap[categoryDef.color] || categoryDef.color;
            }
            data.push({ name: categoryName, value: amount, color });
        });

        return data.sort((a, b) => b.value - a.value);
    }, [filteredTransactions, categories]);

    const stats = useMemo(() => {
        return filteredTransactions.reduce((acc, curr) => {
            const isConfirmed = curr.confirmed !== false; // Default to true if not set

            if (curr.type === "income") {
                acc.income += curr.amount;
                if (isConfirmed) {
                    acc.confirmedIncome += curr.amount;
                } else {
                    acc.pendingIncome += curr.amount;
                }
            } else {
                acc.expense += curr.amount;
                if (isConfirmed) {
                    acc.confirmedExpense += curr.amount;
                } else {
                    acc.pendingExpense += curr.amount;
                }
            }
            return acc;
        }, {
            income: 0,
            expense: 0,
            confirmedIncome: 0,
            pendingIncome: 0,
            confirmedExpense: 0,
            pendingExpense: 0
        });
    }, [filteredTransactions]);

    const totalBalance = useMemo(() => {
        return accounts.reduce((sum, acc) => sum + acc.balance, 0);
    }, [accounts]);

    const chartData = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start, end });

        return days.map(day => {
            const dayTransactions = filteredTransactions.filter(t => isSameDay(new Date(t.date), day));
            const income = dayTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
            const expense = dayTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
            return {
                day: format(day, "dd"),
                income,
                expense
            };
        });
    }, [filteredTransactions, currentMonth]);

    // --- CRUD Handlers ---

    const handleSaveAccount = async (account: any) => {
        if (!userId) return;
        try {
            if (editingAccount) {
                const updated = await SupabaseFinance.updateFinanceAccount(editingAccount.id, {
                    ...account,
                    user_id: userId
                });
                setAccounts(accounts.map(a => a.id === editingAccount.id ? updated : a));
            } else {
                const created = await SupabaseFinance.createFinanceAccount({
                    ...account,
                    user_id: userId
                });
                setAccounts([created, ...accounts]);
            }
        } catch (error) {
            console.error('Error saving account:', error);
        }
        setEditingAccount(null);
    };

    const handleDeleteAccount = async (id: string) => {
        if (!confirm("Tem certeza? Transações vinculadas serão excluídas.")) return;
        try {
            await SupabaseFinance.deleteFinanceAccount(id);
            setAccounts(accounts.filter(a => a.id !== id));
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    const handleSaveTransaction = async (transactionData: any) => {
        if (!userId) return;
        try {
            if (transactionData.targetAccountId && transactionData.type === 'expense') {
                // Invoice Payment / Transfer Logic
                await SupabaseFinance.createTransferTransaction(
                    userId,
                    transactionData.accountId,
                    transactionData.targetAccountId,
                    transactionData.amount,
                    transactionData.date,
                    transactionData.description,
                    transactionData.confirmed,
                    "Pagamento de Fatura"
                );
                // We don't have a single "created" object to add to state easily because we created two.
                // It's safer to just refresh the list.
                const updatedTransactions = await SupabaseFinance.getFinanceTransactions(userId);
                setTransactions(updatedTransactions);
                awardFP(FOCO_POINTS.ADD_FINANCE_ENTRY, "Pagamento de Fatura Agendado");
            } else if (editingTransaction) {
                const updated = await SupabaseFinance.updateFinanceTransaction(editingTransaction.id, {
                    ...transactionData,
                    user_id: userId
                });
                setTransactions(transactions.map(t => t.id === editingTransaction.id ? updated : t));
            } else {
                const created = await SupabaseFinance.createFinanceTransaction({
                    ...transactionData,
                    user_id: userId
                });
                setTransactions([created, ...transactions]);
                awardFP(FOCO_POINTS.ADD_FINANCE_ENTRY, "Nova Movimentação Financeira");
            }

            // Refresh accounts to reflect balance changes
            const updatedAccounts = await SupabaseFinance.getFinanceAccounts(userId);
            setAccounts(updatedAccounts);
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
        setEditingTransaction(null);
    };

    const handleDeleteTransaction = async (id: string) => {
        if (!userId) return;
        if (!confirm("Excluir esta transação?")) return;
        try {
            await SupabaseFinance.deleteFinanceTransaction(id);
            setTransactions(transactions.filter(t => t.id !== id));

            // Refresh accounts
            const updatedAccounts = await SupabaseFinance.getFinanceAccounts(userId);
            setAccounts(updatedAccounts);
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    const handleConfirmTransaction = async (id: string) => {
        if (!userId) return;
        try {
            const updated = await SupabaseFinance.confirmTransaction(id);
            setTransactions(transactions.map(t => t.id === id ? updated : t));

            // Refresh accounts
            const updatedAccounts = await SupabaseFinance.getFinanceAccounts(userId);
            setAccounts(updatedAccounts);
        } catch (error) {
            console.error('Error confirming transaction:', error);
            console.error('Error confirming transaction:', error);
        }
    };

    const handleTransfer = async (data: any) => {
        if (!userId) return;
        try {
            await SupabaseFinance.transferFunds(
                userId,
                data.fromAccountId,
                data.toAccountId,
                data.amount,
                data.date,
                data.description
            );

            // Refresh data
            setIsLoading(true);
            const [accountsData, transactionsData] = await Promise.all([
                SupabaseFinance.getFinanceAccounts(userId),
                SupabaseFinance.getFinanceTransactions(userId)
            ]);
            setAccounts(accountsData);
            setTransactions(transactionsData);
            setIsLoading(false);

            alert("Transferência realizada com sucesso!");
        } catch (error) {
            console.error('Error processing transfer:', error);
            alert("Erro ao realizar transferência.");
        }
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            {/* Banner */}
            < PageBanner
                title="Financeiro"
                subtitle="Gerencie seu patrimônio e fluxo de caixa."
                gradientColor="emerald"
                icon={Wallet}
            />

            <div className="p-8 pb-32 max-w-7xl mx-auto space-y-8">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Visão Geral</h2>
                        <p className="text-sm text-zinc-400">Acompanhe suas finanças em tempo real.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsCategoryManagerOpen(true)}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <Tag size={16} />
                            Categorias
                        </button>
                        <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
                            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-bold text-white min-w-[120px] text-center capitalize">
                                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                            </span>
                            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Wallet size={20} /></div>
                            <span className="text-zinc-400 text-sm">Saldo Total</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><TrendingUp size={20} /></div>
                            <span className="text-zinc-400 text-sm">Entradas Confirmadas</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.confirmedIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        {stats.pendingIncome > 0 && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                <p className="text-xs text-zinc-400">
                                    <span className="text-amber-500 font-bold">{stats.pendingIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> pendente
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg"><TrendingDown size={20} /></div>
                            <span className="text-zinc-400 text-sm">Saídas Confirmadas</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.confirmedExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        {stats.pendingExpense > 0 && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                <p className="text-xs text-zinc-400">
                                    <span className="text-amber-500 font-bold">{stats.pendingExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> pendente
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Charts Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cash Flow Chart */}
                        <section className="col-span-1 lg:col-span-2 bg-zinc-900/30 border border-white/5 p-6 rounded-3xl">
                            <h3 className="text-lg font-bold text-white mb-6">Fluxo de Caixa</h3>
                            <FinanceChart data={chartData} />
                        </section>

                        {/* Expenses Chart */}
                        <section className="col-span-1 bg-zinc-900/30 border border-white/5 p-6 rounded-3xl">
                            <h3 className="text-lg font-bold text-white mb-6">Despesas por Categoria</h3>
                            <ExpensePieChart data={expenseCategoryData} />
                        </section>
                    </div>

                </div>

                {/* Main Grid: Accounts & Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Accounts Column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Minhas Contas</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsTransferModalOpen(true)}
                                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors"
                                    title="Transferir entre contas"
                                >
                                    <ArrowRightLeft size={20} />
                                </button>
                                <button
                                    onClick={() => { setEditingAccount(null); setIsAccountModalOpen(true); }}
                                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                                    title="Nova conta"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {accounts.map(account => (
                                <AccountCard
                                    key={account.id}
                                    {...account}
                                    onEdit={(id) => {
                                        setEditingAccount(accounts.find(a => a.id === id));
                                        setIsAccountModalOpen(true);
                                    }}
                                    onDelete={handleDeleteAccount}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Transactions Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Transações Recentes</h3>
                            <button
                                onClick={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                            >
                                <Plus size={18} />
                                Nova Transação
                            </button>
                        </div>
                        <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-4 min-h-[400px]">
                            <TransactionList
                                // @ts-ignore
                                transactions={filteredTransactions}
                                categories={categories}
                                onEdit={(id) => {
                                    setEditingTransaction(transactions.find(t => t.id === id));
                                    setIsTransactionModalOpen(true);
                                }}
                                onDelete={handleDeleteTransaction}
                                onConfirm={handleConfirmTransaction}
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Modals */}
            <AccountModal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                onSave={handleSaveAccount}
                initialData={editingAccount}
            />

            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => {
                    setIsTransactionModalOpen(false);
                    setEditingTransaction(null);
                }}
                onSave={handleSaveTransaction}
                accounts={accounts}
                categories={categories}
                initialData={editingTransaction}
            />

            <CategoryManager
                isOpen={isCategoryManagerOpen}
                onClose={() => setIsCategoryManagerOpen(false)}
                categories={categories}
                onSave={handleSaveCategories}
            />

            <TransferModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                onTransfer={handleTransfer}
                accounts={accounts}
            />
        </div>
    );
}
