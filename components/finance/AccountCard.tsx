"use client";

import { Edit, Trash2, CreditCard, Landmark, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountCardProps {
    id: string;
    name: string;
    balance: number;
    type: string;
    color: string;
    credit_limit?: number;
    account_limit?: number;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const getIcon = (type: string) => {
    switch (type) {
        case "bank": return Landmark;
        case "wallet": return Wallet;
        default: return CreditCard;
    }
};

export function AccountCard({ id, name, balance, type, color, credit_limit = 0, account_limit = 0, onEdit, onDelete }: AccountCardProps) {
    const Icon = getIcon(type);

    // Logic:
    // If Credit Card (has credit_limit > 0):
    // - Balance = Available Limit (as per user convention)
    // - Invoice (Fatura) = Credit Limit - Available Limit
    // If Bank Account (has account_limit > 0):
    // - Balance = Actual Money
    // - Available (w/ Limit) = Balance + Account Limit

    const isCreditCard = credit_limit > 0;
    const hasOverdraft = account_limit > 0;

    const invoiceAmount = isCreditCard ? (credit_limit - balance) : 0;
    const totalAvailable = hasOverdraft ? (balance + account_limit) : balance;

    return (
        <div className="group relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
            {/* Background Gradient */}
            <div
                className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
                style={{ backgroundColor: color }}
            />

            <div className="relative z-10 flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5">
                    <Icon size={24} style={{ color }} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(id)} className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => onDelete(id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="relative z-10">
                <p className="text-zinc-500 text-sm mb-1">{name}</p>
                <p className="text-xl font-bold text-white mb-1">
                    {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>

                {/* Extra Info based on Limits */}
                <div className="space-y-1 mt-2">
                    {isCreditCard && (
                        <>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-500">Limite Total</span>
                                <span className="text-zinc-300">{credit_limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-500">Fatura Atual</span>
                                <span className="text-red-400 font-medium">
                                    {invoiceAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        </>
                    )}

                    {hasOverdraft && !isCreditCard && (
                        <div className="flex justify-between items-center text-xs pt-1 border-t border-white/5 mt-1">
                            <span className="text-zinc-500">Disponível Total</span>
                            <span className="text-emerald-400 font-medium">
                                {totalAvailable.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
