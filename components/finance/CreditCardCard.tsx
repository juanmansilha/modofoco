"use client";

import { useState } from "react";
import { CreditCard as CreditCardIcon, MoreVertical, Pencil, Trash2, Receipt, Calendar, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CreditCardCardProps {
    id: string;
    name: string;
    credit_limit: number;
    available_limit: number;
    closing_day: number;
    due_day: number;
    color?: string;
    logo_url?: string;
    currentInvoiceAmount?: number;
    nextDueDate?: string;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onViewInvoice?: (id: string) => void;
}

export function CreditCardCard({
    id,
    name,
    credit_limit,
    available_limit,
    closing_day,
    due_day,
    color = "#6366f1",
    logo_url,
    currentInvoiceAmount = 0,
    nextDueDate,
    onEdit,
    onDelete,
    onViewInvoice
}: CreditCardCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    const usedLimit = credit_limit - available_limit;
    const usagePercentage = credit_limit > 0 ? (usedLimit / credit_limit) * 100 : 0;

    // Determine usage color
    let usageColor = "bg-emerald-500";
    if (usagePercentage > 80) {
        usageColor = "bg-red-500";
    } else if (usagePercentage > 50) {
        usageColor = "bg-amber-500";
    }

    return (
        <div
            className="relative p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all group"
            style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden bg-white"
                    >
                        {logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logo_url} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            <CreditCardIcon size={20} style={{ color }} />
                        )}
                    </div>
                    <div>
                        <p className="font-semibold text-white text-sm">{name}</p>
                        <p className="text-xs text-zinc-500">
                            Fecha dia {closing_day} • Vence dia {due_day}
                        </p>
                    </div>
                </div>

                {/* Menu */}
                <div className="relative">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
                    >
                        <MoreVertical size={16} />
                    </button>
                    {menuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-8 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-20 py-1 min-w-[140px]">
                                {onViewInvoice && (
                                    <button
                                        onClick={() => { onViewInvoice(id); setMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 transition-colors"
                                    >
                                        <Receipt size={14} />
                                        Ver Fatura
                                    </button>
                                )}
                                {onEdit && (
                                    <button
                                        onClick={() => { onEdit(id); setMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 transition-colors"
                                    >
                                        <Pencil size={14} />
                                        Editar
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => { onDelete(id); setMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                        Excluir
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Limit Usage Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-zinc-400">Limite Usado</span>
                    <span className="text-zinc-300 font-medium">
                        {usedLimit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de {credit_limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${usageColor} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                        <TrendingDown size={12} />
                        Disponível
                    </div>
                    <p className="text-emerald-400 font-bold">
                        {available_limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                        <Receipt size={12} />
                        Fatura Atual
                    </div>
                    <p className="text-amber-400 font-bold">
                        {currentInvoiceAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            </div>

            {/* Next Due Date */}
            {nextDueDate && (
                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                    <Calendar size={12} />
                    Próximo vencimento: {format(new Date(nextDueDate), "dd 'de' MMMM", { locale: ptBR })}
                </div>
            )}

            {/* Quick Action */}
            {currentInvoiceAmount > 0 && onViewInvoice && (
                <button
                    onClick={() => onViewInvoice(id)}
                    className="mt-3 w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium transition-colors"
                >
                    Pagar Fatura
                </button>
            )}
        </div>
    );
}
