"use client";

import { useState } from "react";
import { X, ArrowRightLeft, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTransfer: (data: any) => Promise<void>;
    accounts: any[];
}

export function TransferModal({ isOpen, onClose, onTransfer, accounts }: TransferModalProps) {
    const [fromAccount, setFromAccount] = useState("");
    const [toAccount, setToAccount] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState("Transferência");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fromAccount || !toAccount) {
            alert("Selecione as contas de origem e destino.");
            return;
        }

        if (fromAccount === toAccount) {
            alert("A conta de origem e destino não podem ser a mesma.");
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            alert("Digite um valor válido.");
            return;
        }

        await onTransfer({
            fromAccountId: fromAccount,
            toAccountId: toAccount,
            amount: parseFloat(amount),
            date: date ? `${date}T12:00:00` : new Date().toISOString(), // Fix timezone offset
            description
        });

        // Reset
        setAmount("");
        setDescription("Transferência");
        onClose();
    };

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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 p-6"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                                    <ArrowRightLeft size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-white">Transferência</h2>
                            </div>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">De (Origem)</label>
                                    <select
                                        value={fromAccount}
                                        onChange={(e) => setFromAccount(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Para (Destino)</label>
                                    <select
                                        value={toAccount}
                                        onChange={(e) => setToAccount(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Valor</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="R$ 0,00"
                                    required
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm text-zinc-400 mb-1">Data</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            required
                                        />
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="Detalhes da transferência..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 mt-2"
                            >
                                Confirmar Transferência
                            </button>

                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
