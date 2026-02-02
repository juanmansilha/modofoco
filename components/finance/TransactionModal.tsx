"use client";

import { useState, useEffect } from "react";
import { X, Save, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: any) => void;
    accounts: any[];
    initialData?: any;
}

export function TransactionModal({ isOpen, onClose, onSave, accounts, initialData }: TransactionModalProps) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<"income" | "expense">("expense");
    const [category, setCategory] = useState("other");
    const [accountId, setAccountId] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isConfirmed, setIsConfirmed] = useState(true);

    useEffect(() => {
        if (isOpen && initialData) {
            setDescription(initialData.description);
            setAmount(initialData.amount.toString());
            setType(initialData.type);
            setCategory(initialData.category);
            setAccountId(initialData.accountId);
            setIsConfirmed(initialData.confirmed !== false);
            // setDate(new Date(initialData.date).toISOString().split('T')[0]);
        } else if (isOpen) {
            setDescription("");
            setAmount("");
            setType("expense");
            setCategory("other");
            setIsConfirmed(true);
            if (accounts.length > 0) setAccountId(accounts[0].id);
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, initialData, accounts]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            description,
            amount: parseFloat(amount) || 0,
            type,
            category,
            accountId,
            date: new Date(date),
            confirmed: isConfirmed
        });
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
                                    onClick={() => setType("income")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${type === "income" ? "bg-emerald-500/20 text-emerald-500 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    <ArrowUpCircle size={16} /> Entrada
                                </button>
                            </div>

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
                                        <option value="food">Alimentação</option>
                                        <option value="shopping">Compras</option>
                                        <option value="housing">Moradia</option>
                                        <option value="transport">Transporte</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Conta</label>
                                    <select
                                        value={accountId}
                                        onChange={(e) => setAccountId(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    >
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

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
                            </div>

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
