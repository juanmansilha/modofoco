"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Tag } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { AccountCard } from "@/components/finance/AccountCard";
import { AccountModal } from "@/components/finance/AccountModal";
import { TransactionList } from "@/components/finance/TransactionList";
import { TransactionModal } from "@/components/finance/TransactionModal";
import { FinanceChart } from "@/components/finance/FinanceChart";
import { PageBanner } from "@/components/ui/PageBanner";
import { CategoryManager } from "@/components/finance/CategoryManager";
import { useGamification } from "@/contexts/GamificationContext";
import { FOCO_POINTS } from "@/lib/gamification";

// Mock Data Intializers
const INITIAL_ACCOUNTS: any[] = [];

const INITIAL_TRANSACTIONS: any[] = [];

export default function FinancePage() {
    const { awardFP } = useGamification();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [accounts, setAccounts] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const savedAccounts = localStorage.getItem('mf_finance_accounts');
        const savedTransactions = localStorage.getItem('mf_finance_transactions');

        if (savedAccounts) {
            try {
                setAccounts(JSON.parse(savedAccounts));
            } catch (e) {
                console.error('Error loading accounts:', e);
            }
        }

        if (savedTransactions) {
            try {
                setTransactions(JSON.parse(savedTransactions));
            } catch (e) {
                console.error('Error loading transactions:', e);
            }
        }
    }, []);

    // Save to localStorage whenever accounts or transactions change
    useEffect(() => {
        if (accounts.length > 0) {
            localStorage.setItem('mf_finance_accounts', JSON.stringify(accounts));
        }
    }, [accounts]);

    useEffect(() => {
        if (transactions.length > 0) {
            localStorage.setItem('mf_finance_transactions', JSON.stringify(transactions));
        }
    }, [transactions]);

    // Helpers
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    // Modals & Editing
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<any>(null);
    const [editingTransaction, setEditingTransaction] = useState<any>(null);

    // Categories State
    const [categories, setCategories] = useState<any[]>([
        { id: "1", name: "Salário", type: "income", color: "bg-emerald-500" },
        { id: "2", name: "Freelance", type: "income", color: "bg-blue-500" },
        { id: "3", name: "Alimentação", type: "expense", color: "bg-orange-500" },
        { id: "4", name: "Transporte", type: "expense", color: "bg-cyan-500" },
        { id: "5", name: "Moradia", type: "expense", color: "bg-purple-500" },
    ]);

    // Save categories to localStorage
    useEffect(() => {
        localStorage.setItem('mf_finance_categories', JSON.stringify(categories));
    }, [categories]);

    // Load categories from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('mf_finance_categories');
        if (saved) {
            try {
                setCategories(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading categories:', e);
            }
        }
    }, []);

    // --- Logic ---

    const filteredTransactions = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        return transactions.filter(t => {
            const date = new Date(t.date);
            return date >= start && date <= end;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, currentMonth]);

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

    const handleSaveAccount = (account: any) => {
        if (editingAccount) {
            setAccounts(accounts.map(a => a.id === editingAccount.id ? { ...account, id: a.id } : a));
        } else {
            setAccounts([...accounts, { ...account, id: Math.random().toString(36).substr(2, 9) }]);
        }
        setEditingAccount(null);
    };

    const handleDeleteAccount = (id: string) => {
        if (confirm("Tem certeza? Transações vinculadas não serão excluídas logicamente, mas perderão a referência visual.")) {
            setAccounts(accounts.filter(a => a.id !== id));
        }
    };

    const handleSaveTransaction = (transaction: any) => {
        let newTransactions = [...transactions];
        let amountDiff = 0; // For balance update
        const isExpense = transaction.type === "expense";
        const val = isExpense ? -transaction.amount : transaction.amount;

        if (editingTransaction) {
            // Revert old transaction effect on balance first
            const oldIsExpense = editingTransaction.type === "expense";
            const oldVal = oldIsExpense ? -editingTransaction.amount : editingTransaction.amount;

            // Logic to update balance only if account didn't change (simplification for MVP)
            // If account changed, we would need to update two accounts. keeping simple.
            if (transaction.accountId === editingTransaction.accountId) {
                amountDiff = val - oldVal;
            }

            newTransactions = transactions.map(t => t.id === editingTransaction.id ? { ...transaction, id: t.id } : t);
        } else {
            newTransactions = [{ ...transaction, id: Math.random().toString(36).substr(2, 9) }, ...transactions];
            amountDiff = val;
            awardFP(FOCO_POINTS.ADD_FINANCE_ENTRY, "Nova Movimentação Financeira");
        }

        setTransactions(newTransactions);

        // Update Account Balance
        setAccounts(accounts.map(acc => {
            if (acc.id === transaction.accountId) {
                return { ...acc, balance: acc.balance + amountDiff };
            }
            return acc;
        }));

        setEditingTransaction(null);
    };

    const handleDeleteTransaction = (id: string) => {
        const transaction = transactions.find(t => t.id === id);
        if (transaction && confirm("Excluir esta transação?")) {
            // Revert balance
            const isExpense = transaction.type === "expense";
            const val = isExpense ? -transaction.amount : transaction.amount;

            setAccounts(accounts.map(acc => {
                if (acc.id === transaction.accountId) {
                    return { ...acc, balance: acc.balance - val };
                }
                return acc;
            }));
            setTransactions(transactions.filter(t => t.id !== id));
        }
    };

    const handleConfirmTransaction = (id: string) => {
        setTransactions(transactions.map(t =>
            t.id === id ? { ...t, confirmed: true } : t
        ));
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
                            <span className="text-zinc-400 text-sm">Entradas</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.confirmedIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        {stats.pendingIncome > 0 && (
                            <p className="text-xs text-zinc-500 mt-1">
                                + {stats.pendingIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} pendente
                            </p>
                        )}
                    </div>
                    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg"><TrendingDown size={20} /></div>
                            <span className="text-zinc-400 text-sm">Saídas</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.confirmedExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        {stats.pendingExpense > 0 && (
                            <p className="text-xs text-zinc-500 mt-1">
                                + {stats.pendingExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} pendente
                            </p>
                        )}
                    </div>
                </div>

                {/* Chart */}
                <section className="bg-zinc-900/30 border border-white/5 p-6 rounded-3xl">
                    <h3 className="text-lg font-bold text-white mb-6">Fluxo de Caixa</h3>
                    <FinanceChart data={chartData} />
                </section>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Accounts Column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Minhas Contas</h3>
                            <button
                                onClick={() => { setEditingAccount(null); setIsAccountModalOpen(true); }}
                                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                            >
                                <Plus size={20} />
                            </button>
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
                onClose={() => setIsTransactionModalOpen(false)}
                onSave={handleSaveTransaction}
                accounts={accounts}
                initialData={editingTransaction}
            />

            <CategoryManager
                isOpen={isCategoryManagerOpen}
                onClose={() => setIsCategoryManagerOpen(false)}
                categories={categories}
                onSave={setCategories}
            />
        </div>
    );
}
