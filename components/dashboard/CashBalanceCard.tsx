import { Wallet } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface CashBalanceCardProps {
    balance: number;
}

export function CashBalanceCard({ balance }: CashBalanceCardProps) {
    return (
        <Card className="col-span-1 bg-zinc-900/30 border-white/5 p-6 flex flex-col justify-between group hover:border-emerald-500/20 transition-all">
            <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400 font-medium">Caixa Atual</p>
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:text-emerald-400 transition-colors">
                    <Wallet size={18} />
                </div>
            </div>
            <div>
                <p className="text-2xl font-bold text-white tracking-tight">
                    {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-xs text-emerald-500 mt-1 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Disponível
                </p>
            </div>
        </Card>
    );
}
