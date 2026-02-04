"use client";

import { useState } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { AlertOctagon, Info, AlertTriangle, CheckCircle2, Filter } from "lucide-react";

interface Log {
    id: string;
    created_at: string;
    level: string;
    source: string;
    message: string;
}

interface SystemPageProps {
    logs: Log[];
}

export default function SystemPage({ logs: initialLogs }: SystemPageProps) {
    const [filter, setFilter] = useState<'all' | 'errors'>('all');
    // In a real app with server components, search/filter should ideally be server-side params
    // But for <100 logs client-side filtering is fine.

    // NOTE: This component was converted to client-side for interactivity.
    // Ideally we'd fetch data in a parent server component and pass it down.
    // For now, let's assume this page receives data from a layout or we refactor to fetch inside styled component.
    // Actually, the original file was a Server Component (async). 
    // To add interactivity (useState), we need to split it or make it a Client Component.

    return (
        <SystemLogsClient initialLogs={initialLogs || []} />
    );
}

function SystemLogsClient({ initialLogs }: { initialLogs: Log[] }) {
    const [filter, setFilter] = useState<'all' | 'errors'>('all');

    const filteredLogs = initialLogs.filter(log => {
        if (filter === 'errors') return log.level === 'error' || log.level === 'critical';
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Sistema & Logs</h1>
                    <p className="text-zinc-400">Monitoramento técnico e auditoria.</p>
                </div>
                <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${filter === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('errors')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${filter === 'errors' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Apenas Erros
                    </button>
                </div>
            </div>

            <div className="rounded-md border border-zinc-800 bg-black font-mono text-sm">
                <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs font-medium text-zinc-500 flex justify-between items-center">
                    <span>Últimos 100 Logs</span>
                    <span className="text-zinc-600">Mostrando {filteredLogs.length} registros</span>
                </div>
                <div className="max-h-[600px] overflow-auto p-4 space-y-2">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                            <div key={log.id} className="flex gap-4 border-b border-zinc-900 pb-2 last:border-0 last:pb-0 font-mono">
                                <div className="w-32 shrink-0 text-zinc-500 text-xs py-1">
                                    {new Date(log.created_at).toLocaleString()}
                                </div>
                                <div className="w-20 shrink-0 py-1">
                                    <span className={`inline-flex items-center justify-center w-full rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${log.level === 'error' || log.level === 'critical' ? 'bg-red-950 text-red-500 border border-red-900' :
                                            log.level === 'warn' ? 'bg-yellow-950 text-yellow-500 border border-yellow-900' :
                                                'bg-blue-950 text-blue-500 border border-blue-900'
                                        }`}>
                                        {log.level}
                                    </span>
                                </div>
                                <div className="w-32 shrink-0 text-zinc-400 text-xs font-bold py-1 truncate" title={log.source}>
                                    [{log.source}]
                                </div>
                                <div className="flex-1 text-zinc-300 break-all py-1">
                                    {log.message}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-zinc-500 text-center py-12 flex flex-col items-center gap-3">
                            <CheckCircle2 className="w-8 h-8 opacity-20" />
                            <p>Nenhum log encontrado para este filtro.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
