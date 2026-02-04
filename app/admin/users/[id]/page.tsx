import { supabaseAdmin } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/Card";
import { UserActions } from "@/components/admin/UserActions";
import { CreditCard, History, Shield, Trophy, User } from "lucide-react";

export default async function UserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Fetch full profile
    const { data: profile, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !profile) {
        notFound();
    }

    // Fetch Gamification history
    const { data: gameHistory } = await supabaseAdmin
        .from("gamification_history")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(5);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">{profile.full_name || "Usuário sem nome"}</h1>
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <User className="h-4 w-4" />
                        <span>ID: {profile.id}</span>
                        <span>•</span>
                        <span>{profile.email}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <UserActions userId={profile.id} currentRole={profile.role} currentFp={profile.fp} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Total FP</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
                                    <Trophy className="h-5 w-5" />
                                    {profile.fp || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Plano Atual</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Free
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Nível de Acesso</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    {profile.role || "user"}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5 text-purple-500" />
                                Histórico Recente de Gamificação
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {gameHistory && gameHistory.length > 0 ? (
                                    gameHistory.map((log: any) => (
                                        <div key={log.id} className="flex items-center justify-between border-b border-zinc-800 pb-2 last:border-0 last:pb-0">
                                            <div className="text-sm text-zinc-300">{log.reason}</div>
                                            <div className={`font-mono font-bold ${log.type === 'earn' ? 'text-green-500' : 'text-red-500'}`}>
                                                {log.type === 'earn' ? '+' : '-'}{log.amount} FP
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-zinc-500 text-sm">Nenhum histórico encontrado.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle>Detalhes da Conta</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <div className="text-zinc-500">Data de Cadastro</div>
                                <div className="text-zinc-200">{new Date(profile.created_at).toLocaleDateString('pt-BR')}</div>
                            </div>
                            <div>
                                <div className="text-zinc-500">Último Login</div>
                                <div className="text-zinc-200">-</div> {/* Need to track login time if available */}
                            </div>
                            <div>
                                <div className="text-zinc-500">Telefone</div>
                                <div className="text-zinc-200">{profile.phone || "Não cadastrado"}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
