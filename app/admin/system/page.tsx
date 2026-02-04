import { supabaseAdmin } from "@/lib/supabase-admin";
import { AlertOctagon, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

export default async function SystemPage() {
    const { data: logs, error } = await supabaseAdmin
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Sistema & Logs</h1>
                    <p className="text-zinc-400">Monitoramento técnico e auditoria.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                {/* Helper cards for log counts could go here */}
            </div>

            <div className="rounded-md border border-zinc-800 bg-black font-mono text-sm">
                <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs font-medium text-zinc-500">
                    Últimos 100 Logs
                </div>
                <div className="max-h-[600px] overflow-auto p-4 space-y-2">
                    {logs && logs.length > 0 ? (
                        logs.map((log) => (
                            <div key={log.id} className="flex gap-4 border-b border-zinc-900 pb-2 last:border-0 last:pb-0">
                                <div className="w-32 shrink-0 text-zinc-500 text-xs">
                                    {new Date(log.created_at).toLocaleString()}
                                </div>
                                <div className="w-20 shrink-0">
                                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${log.level === 'error' || log.level === 'critical' ? 'bg-red-500/10 text-red-500' :
                                            log.level === 'warn' ? 'bg-yellow-500/10 text-yellow-500' :
                                                'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {log.level.toUpperCase()}
                                    </span>
                                </div>
                                <div className="w-32 shrink-0 text-zinc-400 text-xs font-bold">
                                    [{log.source}]
                                </div>
                                <div className="flex-1 text-zinc-300 break-all">
                                    {log.message}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-zinc-500 text-center py-8">Nenhum log registrado.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
