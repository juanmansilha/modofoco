import { Wallet, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface CashBalanceCardProps {
    balance: number;
    availableCredit: number;
}

export function CashBalanceCard({ balance, availableCredit }: CashBalanceCardProps) {
    const totalUnified = balance + availableCredit;

    return (
        <Card className="col-span-1 bg-zinc-900/30 border-white/5 p-6 flex flex-col justify-between group hover:border-emerald-500/20 transition-all h-full">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-zinc-400 font-medium">Caixa Atual</p>
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:text-emerald-400 transition-colors">
                    <Wallet size={18} />
                </div>
            </div>

            <div className="space-y-3">
                {/* Saldo em Conta */}
                <div>
                    <p className="text-2xl font-bold text-white tracking-tight">
                        {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-xs text-zinc-500 font-medium">
                        Saldo em Conta
                    </p>
                </div>

                {/* Crédito Disponível */}
                <div className="pt-2 border-t border-white/5">
                    <p className="text-sm font-semibold text-zinc-300">
                        {availableCredit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                        <CreditCard size={10} />
                        Crédito Disponível
                    </p>
                </div>

                {/* Total Unificado */}
                <div className="pt-2 border-t border-white/5">
                    <p className="text-lg font-bold text-emerald-400">
                        {totalUnified.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-xs text-emerald-500/70 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Poder de Compra Total
                    </p>
                </div>
            </div>
        </Card>
    );
}
