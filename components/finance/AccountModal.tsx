"use client";

import { useState, useEffect } from "react";
import { X, Save, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (account: any) => void;
    initialData?: any;
}

export function AccountModal({ isOpen, onClose, onSave, initialData }: AccountModalProps) {
    const [name, setName] = useState("");
    const [balance, setBalance] = useState("");
    const [type, setType] = useState("bank");
    const [color, setColor] = useState("#3b82f6");
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isPrimary, setIsPrimary] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name);
            setBalance(initialData.balance?.toString() || "");
            setType(initialData.type);
            setColor(initialData.color);
            setLogoUrl(initialData.logo_url || null);
            setIsPrimary(initialData.is_primary || false);
        } else {
            setName("");
            setBalance("");
            setType("bank");
            setColor("#3b82f6");
            setLogoUrl(null);
            setIsPrimary(false);
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            balance: parseFloat(balance) || 0,
            type,
            color,
            logo_url: logoUrl,
            is_primary: isPrimary
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
                                {initialData ? "Editar Conta" : "Nova Conta"}
                            </h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Nome da Conta</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="Ex: Nubank"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Saldo Atual / Inicial</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={balance}
                                    onChange={(e) => setBalance(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="R$ 0,00"
                                />
                            </div>

                            {/* Bank Presets */}
                            <div>
                                <label className="block text-sm text-zinc-400 mb-3">Selecione a Instituição</label>
                                <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-2">
                                    {[
                                        { name: "Nubank", color: "#820ad1", logo: "/banks/nubank.png" },
                                        { name: "Banco do Brasil", color: "#fbfd00", logo: "/banks/bb.png" },
                                        { name: "Santander", color: "#ec0000", logo: "/banks/santander.jpg" },
                                        { name: "Itaú", color: "#ec7000", logo: "/banks/itau.png" },
                                        { name: "Bradesco", color: "#cc092f", logo: "/banks/bradesco.jpg" },
                                        { name: "Inter", color: "#ff7a00", logo: "/banks/inter.png" },
                                        { name: "Inter PJ", color: "#ff7a00", logo: "/banks/inter_pj.png" },
                                        { name: "Caixa", color: "#1f8ef0", logo: "/banks/caixa.png" },
                                    ].map((bank) => (
                                        <button
                                            key={bank.name}
                                            type="button"
                                            onClick={() => {
                                                setName(bank.name);
                                                setColor(bank.color);
                                                setLogoUrl(bank.logo);
                                            }}
                                            className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all group ${name === bank.name ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-zinc-900/50 hover:bg-zinc-900 hover:border-white/20'}`}
                                        >
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 relative overflow-hidden shrink-0 bg-white">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={bank.logo} alt={bank.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className={`font-semibold text-sm ${name === bank.name ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>{bank.name}</span>
                                            </div>
                                            {name === bank.name && (
                                                <div className="ml-auto w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Tipo</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    >
                                        <option value="bank">Banco</option>
                                        <option value="wallet">Carteira</option>
                                        <option value="invest">Investimento</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Cor</label>
                                    <div className="flex items-center gap-3">
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
                                        <span className="text-xs text-zinc-500">Clique para alterar</span>
                                    </div>
                                </div>
                            </div>

                            {/* Primary Account Toggle */}
                            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Star size={18} className={isPrimary ? "text-amber-400" : "text-zinc-500"} />
                                    <div>
                                        <p className="text-sm font-medium text-white">Conta Principal</p>
                                        <p className="text-xs text-zinc-500">Será usada como padrão em novos lançamentos</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isPrimary}
                                        onChange={(e) => setIsPrimary(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors mt-2"
                            >
                                <Save size={18} />
                                Salvar Conta
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
