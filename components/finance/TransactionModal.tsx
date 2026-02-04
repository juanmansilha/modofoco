"use client";

import { useState, useEffect } from "react";
import { X, Save, ArrowUpCircle, ArrowDownCircle, CreditCard, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: any) => void;
    onSaveCreditCard?: (transaction: any) => void;
    accounts: any[];
    creditCards?: any[];
    categories: any[];
    initialData?: any;
}

export function TransactionModal({
    isOpen,
    onClose,
    onSave,
    onSaveCreditCard,
    accounts,
    creditCards = [],
    categories,
    initialData
}: TransactionModalProps) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<"income" | "expense">("expense");
    const [category, setCategory] = useState("other");
    const [accountId, setAccountId] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isConfirmed, setIsConfirmed] = useState(true);

    // NEW: Payment Method State
    const [paymentMethod, setPaymentMethod] = useState<"debit" | "credit">("debit");
    const [creditCardId, setCreditCardId] = useState("");
    const [creditInstallments, setCreditInstallments] = useState(1);

    // Recurrence State
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
    const [recurrenceType, setRecurrenceType] = useState<'fixed' | 'indefinite'>('fixed');
    const [installments, setInstallments] = useState(12);

    useEffect(() => {
        if (isOpen && initialData) {
            setDescription(initialData.description);
            setAmount(initialData.amount.toString());
            setType(initialData.type);
            setCategory(initialData.category);
            setAccountId(initialData.accountId || initialData.account_id);
            setIsConfirmed(initialData.confirmed !== false);
            setPaymentMethod(initialData.payment_method || "debit");
            setCreditCardId(initialData.credit_card_id || "");
            const dateStr = initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            setDate(dateStr);
        } else if (isOpen) {
            setDescription("");
            setAmount("");
            setType("expense");
            setCategory("other");
            setIsConfirmed(true);
            setPaymentMethod("debit");
            setCreditInstallments(1);

            // Set default account (prefer primary)
            if (accounts.length > 0) {
                const primaryAccount = accounts.find(a => a.is_primary);
                setAccountId(primaryAccount?.id || accounts[0].id);
            }

            // Set default credit card
            if (creditCards.length > 0) {
                setCreditCardId(creditCards[0].id);
            }

            setDate(new Date().toISOString().split('T')[0]);
            setIsRecurring(false);
            setFrequency('monthly');
            setRecurrenceType('fixed');
            setInstallments(12);
        }
    }, [isOpen, initialData, accounts, creditCards]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // For credit card transactions
        if (paymentMethod === "credit" && type === "expense") {
            if (!creditCardId) {
                alert("Selecione um cartão de crédito.");
                return;
            }

            if (onSaveCreditCard) {
                onSaveCreditCard({
                    description,
                    amount: parseFloat(amount) || 0,
                    category,
                    credit_card_id: creditCardId,
                    date: `${date}T12:00:00`,
                    installments: creditInstallments
                });
            }
            onClose();
            return;
        }

        // For debit transactions (existing logic)
        if (!accountId) {
            alert("Selecione uma conta para a transação.");
            return;
        }

        onSave({
            description,
            amount: parseFloat(amount) || 0,
            type,
            category,
            accountId,
            date: `${date}T12:00:00`,
            confirmed: isConfirmed,
            payment_method: 'debit',
            recurrence: isRecurring ? {
                frequency,
                type: recurrenceType,
                installments: recurrenceType === 'fixed' ? installments : 12
            } : null
        });
        onClose();
    };

    // Show credit option only for expenses and when there are credit cards
    const showCreditOption = type === "expense" && creditCards.length > 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 p-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {initialData ? "Editar Transação" : "Nova Transação"}
                            </h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Type Toggle */}
                            <div className="flex bg-zinc-900 p-1 rounded-xl border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setType("expense")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${type === "expense" ? "bg-red-500/20 text-red-500 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    <ArrowDownCircle size={16} /> Saída
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setType("income"); setPaymentMethod("debit"); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${type === "income" ? "bg-emerald-500/20 text-emerald-500 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    <ArrowUpCircle size={16} /> Entrada
                                </button>
                            </div>

                            {/* NEW: Payment Method Toggle (only for expenses) */}
                            {showCreditOption && (
                                <div className="flex bg-zinc-900 p-1 rounded-xl border border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("debit")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${paymentMethod === "debit" ? "bg-blue-500/20 text-blue-400 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                                    >
                                        <Wallet size={16} /> Débito
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("credit")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${paymentMethod === "credit" ? "bg-indigo-500/20 text-indigo-400 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                                    >
                                        <CreditCard size={16} /> Crédito
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Valor</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-lg font-bold"
                                    placeholder="R$ 0,00"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="Ex: Supermercado"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Categoria</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    >
                                        <option value="other">Outros</option>
                                        {categories
                                            .filter(cat => cat.type === type)
                                            .map(cat => (
                                                <option key={cat.id} value={cat.name}>
                                                    {cat.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                {/* Account or Credit Card selector based on payment method */}
                                <div>
                                    {paymentMethod === "debit" ? (
                                        <>
                                            <label className="block text-sm text-zinc-400 mb-1">Conta</label>
                                            <select
                                                value={accountId}
                                                onChange={(e) => setAccountId(e.target.value)}
                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            >
                                                {accounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>
                                                        {acc.name} {acc.is_primary ? '⭐' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </>
                                    ) : (
                                        <>
                                            <label className="block text-sm text-zinc-400 mb-1">Cartão</label>
                                            <select
                                                value={creditCardId}
                                                onChange={(e) => setCreditCardId(e.target.value)}
                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            >
                                                {creditCards.map(card => (
                                                    <option key={card.id} value={card.id}>{card.name}</option>
                                                ))}
                                            </select>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Installments for Credit */}
                            {paymentMethod === "credit" && (
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Parcelas</label>
                                    <select
                                        value={creditInstallments}
                                        onChange={(e) => setCreditInstallments(parseInt(e.target.value))}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                                            <option key={num} value={num}>
                                                {num}x {amount ? `de ${(parseFloat(amount) / num).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm text-zinc-400 mb-1">Data</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>
                                {/* Only show pending toggle for debit transactions */}
                                {paymentMethod === "debit" && (
                                    <div className="flex-1 flex flex-col justify-end pb-1">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!isConfirmed}
                                                onChange={(e) => setIsConfirmed(!e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                            <span className="ml-3 text-sm font-medium text-zinc-400">Pendente?</span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Recurrence Options (only for debit) */}
                            {paymentMethod === "debit" && (
                                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={isRecurring}
                                                onChange={(e) => setIsRecurring(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </div>
                                        <span className="text-sm font-medium text-white">Essa transação se repete?</span>
                                    </label>

                                    {isRecurring && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4 pt-2 overflow-hidden"
                                        >
                                            <div>
                                                <label className="block text-xs text-zinc-400 mb-1 uppercase tracking-wider">Frequência</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {['monthly', 'weekly', 'daily'].map((freq) => (
                                                        <button
                                                            key={freq}
                                                            type="button"
                                                            onClick={() => setFrequency(freq as any)}
                                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${frequency === freq
                                                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                                                : "bg-zinc-800 text-zinc-400 border border-transparent hover:bg-zinc-700"
                                                                }`}
                                                        >
                                                            {freq === 'monthly' ? 'Mensal' : freq === 'weekly' ? 'Semanal' : 'Diário'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-zinc-400 mb-1 uppercase tracking-wider">Duração</label>
                                                    <select
                                                        value={recurrenceType}
                                                        onChange={(e) => setRecurrenceType(e.target.value as any)}
                                                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                    >
                                                        <option value="fixed">Definir vezes</option>
                                                        <option value="indefinite">Indeterminado</option>
                                                    </select>
                                                </div>
                                                {recurrenceType === 'fixed' && (
                                                    <div>
                                                        <label className="block text-xs text-zinc-400 mb-1 uppercase tracking-wider">Quantidade</label>
                                                        <input
                                                            type="number"
                                                            min="2"
                                                            max="120"
                                                            value={installments}
                                                            onChange={(e) => setInstallments(parseInt(e.target.value))}
                                                            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors mt-2"
                            >
                                <Save size={18} />
                                Salvar Transação
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
