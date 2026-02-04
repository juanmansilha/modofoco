"use client";

import { useState, useEffect } from "react";
import { X, Save, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreditCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (card: any) => void;
    accounts: any[];
    initialData?: any;
}

export function CreditCardModal({ isOpen, onClose, onSave, accounts, initialData }: CreditCardModalProps) {
    const [name, setName] = useState("");
    const [bankAccountId, setBankAccountId] = useState("");
    const [creditLimit, setCreditLimit] = useState("");
    const [closingDay, setClosingDay] = useState("10");
    const [dueDay, setDueDay] = useState("15");
    const [color, setColor] = useState("#6366f1");
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name);
            setBankAccountId(initialData.bank_account_id || "");
            setCreditLimit(initialData.credit_limit?.toString() || "");
            setClosingDay(initialData.closing_day?.toString() || "10");
            setDueDay(initialData.due_day?.toString() || "15");
            setColor(initialData.color || "#6366f1");
            setLogoUrl(initialData.logo_url || null);
        } else if (isOpen) {
            setName("");
            setBankAccountId(accounts.length > 0 ? accounts[0].id : "");
            setCreditLimit("");
            setClosingDay("10");
            setDueDay("15");
            setColor("#6366f1");
            setLogoUrl(null);
        }
    }, [isOpen, initialData, accounts]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!creditLimit || parseFloat(creditLimit) <= 0) {
            alert("Por favor, informe um limite válido.");
            return;
        }

        onSave({
            name,
            bank_account_id: bankAccountId || null,
            credit_limit: parseFloat(creditLimit),
            closing_day: parseInt(closingDay),
            due_day: parseInt(dueDay),
            color,
            logo_url: logoUrl,
            is_active: true
        });
        onClose();
    };

    // Bank presets for quick selection
    const bankPresets = [
        { name: "Nubank", color: "#820ad1", logo: "/banks/nubank.png" },
        { name: "Itaú", color: "#ec7000", logo: "/banks/itau.png" },
        { name: "Bradesco", color: "#cc092f", logo: "/banks/bradesco.jpg" },
        { name: "Santander", color: "#ec0000", logo: "/banks/santander.jpg" },
        { name: "Inter", color: "#ff7a00", logo: "/banks/inter.png" },
        { name: "Banco do Brasil", color: "#fbfd00", logo: "/banks/bb.png" },
        { name: "Caixa", color: "#1f8ef0", logo: "/banks/caixa.png" },
    ];

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
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-xl">
                                    <CreditCard size={20} className="text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white">
                                    {initialData ? "Editar Cartão" : "Novo Cartão de Crédito"}
                                </h2>
                            </div>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Bank/Card Preset Selection */}
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Bandeira / Banco</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {bankPresets.map((bank) => (
                                        <button
                                            key={bank.name}
                                            type="button"
                                            onClick={() => {
                                                setName(bank.name + " Crédito");
                                                setColor(bank.color);
                                                setLogoUrl(bank.logo);
                                            }}
                                            className={`aspect-square p-2 rounded-xl border transition-all flex items-center justify-center ${logoUrl === bank.logo
                                                    ? 'border-indigo-500 bg-indigo-500/10'
                                                    : 'border-white/5 bg-zinc-900/50 hover:bg-zinc-900'
                                                }`}
                                            title={bank.name}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={bank.logo}
                                                alt={bank.name}
                                                className="w-8 h-8 object-contain rounded"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Nome do Cartão</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="Ex: Nubank Platinum"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Limite de Crédito</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={creditLimit}
                                    onChange={(e) => setCreditLimit(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-lg font-bold"
                                    placeholder="R$ 5.000,00"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Conta Vinculada (opcional)</label>
                                <select
                                    value={bankAccountId}
                                    onChange={(e) => setBankAccountId(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                >
                                    <option value="">Nenhuma</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-zinc-500 mt-1">
                                    Para organização. O pagamento da fatura pode ser de qualquer conta.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Dia de Fechamento</label>
                                    <select
                                        value={closingDay}
                                        onChange={(e) => setClosingDay(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    >
                                        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                            <option key={day} value={day}>Dia {day}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Dia de Vencimento</label>
                                    <select
                                        value={dueDay}
                                        onChange={(e) => setDueDay(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    >
                                        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                            <option key={day} value={day}>Dia {day}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Cor</label>
                                    <div className="relative">
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                                        />
                                        <div
                                            className="w-11 h-11 rounded-full border-2 border-white/20 shadow-lg"
                                            style={{ backgroundColor: color }}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500 flex-1">
                                    Clique para alterar a cor de destaque do cartão.
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors mt-2"
                            >
                                <Save size={18} />
                                Salvar Cartão
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
