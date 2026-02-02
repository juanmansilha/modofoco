"use client";

import { ArrowUpRight, ArrowDownLeft, Coffee, ShoppingCart, Home, Car, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    date: Date;
    accountId: string;
}

interface TransactionListProps {
    transactions: Transaction[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const getCategoryIcon = (category: string) => {
    switch (category) {
        case "food": return Coffee;
        case "shopping": return ShoppingCart;
        case "housing": return Home;
        case "transport": return Car;
        default: return DollarSign;
    }
};

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-500">
                Nenhuma transação encontrada.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {transactions.map((transaction) => {
                const Icon = getCategoryIcon(transaction.category);
                const isExpense = transaction.type === "expense";

                return (
                    <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isExpense ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                                <Icon size={18} />
                            </div>
                            <div>
                                <p className="font-medium text-white text-sm">{transaction.description}</p>
                                <p className="text-xs text-zinc-500">
                                    {format(new Date(transaction.date), "dd 'de' MMM", { locale: ptBR })}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className={`font-bold text-sm ${isExpense ? "text-red-400" : "text-emerald-400"}`}>
                                {isExpense ? "-" : "+"} {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                            <div className="flex justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEdit(transaction.id)} className="text-xs text-zinc-500 hover:text-white">Editar</button>
                                <button onClick={() => onDelete(transaction.id)} className="text-xs text-zinc-500 hover:text-red-400">Excluir</button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
