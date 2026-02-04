"use client";

import { useState, useEffect } from "react";
import { X, Receipt, Calendar, CreditCard, Wallet, AlertCircle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPay: (invoiceId: string, accountId: string, amount: number) => void;
    invoice: any;
    card: any;
    accounts: any[];
    transactions?: any[];
}

export function InvoiceModal({
    isOpen,
    onClose,
    onPay,
    invoice,
    card,
    accounts,
    transactions = []
}: InvoiceModalProps) {
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [paymentAmount, setPaymentAmount] = useState("");
    const [isPartialPayment, setIsPartialPayment] = useState(false);

    useEffect(() => {
        if (isOpen && accounts.length > 0) {
            // Try to find primary account first
            const primaryAccount = accounts.find(a => a.is_primary);
            setSelectedAccountId(primaryAccount?.id || accounts[0].id);

            // Set payment amount to remaining
            if (invoice) {
                const remaining = invoice.total_amount - invoice.paid_amount;
                setPaymentAmount(remaining.toFixed(2));
            }
        }
    }, [isOpen, accounts, invoice]);

    if (!invoice || !card) return null;

    const remainingAmount = invoice.total_amount - invoice.paid_amount;
    const isPaid = invoice.status === 'paid';
    const isOverdue = new Date(invoice.due_date) < new Date() && !isPaid;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAccountId) {
            alert("Selecione uma conta para o pagamento.");
            return;
        }

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            alert("Informe um valor válido.");
            return;
        }

        if (amount > remainingAmount) {
            alert("O valor não pode ser maior que o saldo da fatura.");
            return;
        }

        onPay(invoice.id, selectedAccountId, amount);
        onClose();
    };

    // Filter transactions for this invoice
    const invoiceTransactions = transactions.filter(t => t.invoice_id === invoice.id);

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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="p-2 rounded-xl"
                                        style={{ backgroundColor: `${card.color}20` }}
                                    >
                                        <Receipt size={20} style={{ color: card.color }} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">
                                            Fatura {card.name}
                                        </h2>
                                        <p className="text-xs text-zinc-400">
                                            {format(new Date(invoice.reference_month), "MMMM 'de' yyyy", { locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="text-zinc-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Status Badge */}
                            <div className="mt-4 flex items-center gap-2">
                                {isPaid ? (
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full flex items-center gap-1">
                                        <Check size={12} /> Paga
                                    </span>
                                ) : isOverdue ? (
                                    <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full flex items-center gap-1">
                                        <AlertCircle size={12} /> Vencida
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full flex items-center gap-1">
                                        <Calendar size={12} /> Vence em {format(new Date(invoice.due_date), "dd/MM")}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                            {/* Amount Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-zinc-400 mb-1">Total da Fatura</p>
                                    <p className="text-xl font-bold text-white">
                                        {invoice.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-zinc-400 mb-1">Restante</p>
                                    <p className={`text-xl font-bold ${isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {remainingAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                            </div>

                            {/* Transactions List */}
                            {invoiceTransactions.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-zinc-300 mb-3">
                                        Lançamentos ({invoiceTransactions.length})
                                    </h3>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                        {invoiceTransactions.map(tx => (
                                            <div
                                                key={tx.id}
                                                className="flex items-center justify-between p-3 bg-zinc-900/30 rounded-lg"
                                            >
                                                <div>
                                                    <p className="text-sm text-white">{tx.description}</p>
                                                    <p className="text-xs text-zinc-500">
                                                        {format(new Date(tx.date), "dd/MM/yyyy")}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-medium text-red-400">
                                                    -{tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Payment Form */}
                            {!isPaid && (
                                <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-white/5">
                                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                                        <Wallet size={16} />
                                        Pagar Fatura
                                    </h3>

                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Conta de Origem</label>
                                        <select
                                            value={selectedAccountId}
                                            onChange={(e) => setSelectedAccountId(e.target.value)}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        >
                                            {accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.name} - {acc.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    {acc.is_primary ? ' ⭐' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isPartialPayment}
                                                onChange={(e) => {
                                                    setIsPartialPayment(e.target.checked);
                                                    if (!e.target.checked) {
                                                        setPaymentAmount(remainingAmount.toFixed(2));
                                                    }
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                        <span className="text-sm text-zinc-400">Pagamento parcial</span>
                                    </div>

                                    {isPartialPayment && (
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-1">Valor do Pagamento</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                max={remainingAmount}
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-lg font-bold"
                                                placeholder="R$ 0,00"
                                                required
                                            />
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors"
                                    >
                                        <Check size={18} />
                                        Pagar {parseFloat(paymentAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
