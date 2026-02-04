import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/Card";
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";

export default function FinancePage() {
    // This is largely a mock since we don't have a SaaS subscription table yet.
    // In a real scenario, we would query Stripe or a 'subscriptions' table.

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Financeiro</h1>
                    <p className="text-zinc-400">Visão geral de receitas e assinaturas.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">MRR</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">R$ 45.231,00</div>
                        <p className="text-xs text-green-500">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Assinaturas Ativas</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">+2350</div>
                        <p className="text-xs text-zinc-500">+180 novos usuários</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle>Planos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                <div>
                                    <div className="font-medium text-white">Free</div>
                                    <div className="text-xs text-zinc-500">Plano gratuito</div>
                                </div>
                                <div className="text-zinc-300">R$ 0,00</div>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                <div>
                                    <div className="font-medium text-white">Pro</div>
                                    <div className="text-xs text-zinc-500">Para profissionais</div>
                                </div>
                                <div className="text-zinc-300">R$ 29,90/mês</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
