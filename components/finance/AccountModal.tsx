"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
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

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name);
            setBalance(initialData.balance?.toString() || "");
            setType(initialData.type);
            setColor(initialData.color);
            setLogoUrl(initialData.logo_url || null);
        } else {
            setName("");
            setBalance("");
            setType("bank");
            setColor("#3b82f6");
            setLogoUrl(null);
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            balance: parseFloat(balance) || 0,
            type,
            color,
            logo_url: logoUrl
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
                                <label className="block text-sm text-zinc-400 mb-2">Bancos Populares</label>
                                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                    {[
                                        { name: "Nubank", color: "#820ad1", logo: "/banks/nubank.png" },
                                        { name: "Banco do Brasil", color: "#fbfd00", logo: "/banks/bb.png" },
                                        { name: "Santander", color: "#ec0000", logo: "/banks/santander.jpg" },
                                        { name: "Itaú", color: "#ec7000", logo: "/banks/itau.png" },
                                        { name: "Bradesco", color: "#cc092f", logo: "/banks/bradesco.jpg" },
                                        { name: "Inter", color: "#ff7a00", logo: "/banks/inter.png" },
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
                                            className="flex flex-col items-center gap-1 min-w-[70px] group"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1 border border-white/10 group-hover:border-indigo-500 transition-colors relative overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={bank.logo} alt={bank.name} className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-[10px] text-zinc-400 text-center truncate w-full">{bank.name}</span>
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
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-full h-[46px] bg-zinc-900 border border-white/10 rounded-xl cursor-pointer"
                                    />
                                </div>
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
