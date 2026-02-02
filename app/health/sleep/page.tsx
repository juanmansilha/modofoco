"use client";

import { useState } from "react";
import { format, subMinutes } from "date-fns";
import { PageBanner } from "@/components/ui/PageBanner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Moon, Clock, BedDouble, Plus, History } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { useGamification } from "@/contexts/GamificationContext";
import { FOCO_POINTS } from "@/lib/gamification";

// Note: SleepLog interface is now in GlobalDataProvider

export default function SleepPage() {
    const [selectedCycles, setSelectedCycles] = useState<number | null>(null);
    const [wakeUpTime, setWakeUpTime] = useState("07:00");
    console.log("DEBUG: SleepPage Render. selectedCycles:", selectedCycles);
    const { sleepLogs, addSleepLog } = useGlobalData();
    const { addNotification } = useNotifications();
    const { awardFP } = useGamification();

    const calculateBedtime = (cycles: number) => {
        // 90 min per cycle
        const minutes = cycles * 90;
        // Need to parse wakeUpTime "HH:MM" to a date object to subtract
        const [h, m] = wakeUpTime.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        // Add 15 min for falling asleep
        const fallAsleepBuffer = 15;
        const bedTimeDate = subMinutes(d, minutes + fallAsleepBuffer);
        return format(bedTimeDate, "HH:mm");
    };

    const handleLogSleep = () => {
        console.log("DEBUG: handleLogSleep called. selectedCycles:", selectedCycles);
        let duration = 8;
        let bedtime = "23:00";

        if (selectedCycles) {
            duration = selectedCycles * 1.5;
            bedtime = calculateBedtime(selectedCycles);
        }

        const newLog = {
            id: Math.random().toString(),
            date: format(new Date(), "yyyy-MM-dd"), // Registra como "hoje/ontem"
            bedtime,
            wakeup: wakeUpTime,
            duration,
            quality: "good" as const
        };

        addSleepLog(newLog);
        addNotification("Sono Registrado", `Noite de ${duration}h registrada com sucesso!`);
        awardFP(FOCO_POINTS.REGISTER_SLEEP, "Sono Registrado");
        setSelectedCycles(null); // Reset selection
    };

    const sortedLogs = [...sleepLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="pb-20 bg-background min-h-screen custom-scrollbar">
            <PageBanner
                title="Higiene do Sono"
                subtitle="Recupere suas energias e otimize sua recuperação."
                gradientColor="indigo"
                icon={Moon}
            />

            <div className="max-w-4xl mx-auto p-6 space-y-8">

                {/* Calculator Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="p-6 bg-zinc-900/50 border-white/5 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Calculadora de Sono</h3>
                                <p className="text-sm text-zinc-400">Baseada em ciclos de 90min</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm text-zinc-400 block">Eu preciso acordar às:</label>
                            <input
                                type="time"
                                value={wakeUpTime}
                                onChange={(e) => setWakeUpTime(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-3xl font-mono text-white text-center focus:border-indigo-500 transition-colors outline-none cursor-pointer"
                            />
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <p className="text-sm text-zinc-500 text-center">Selecione um ciclo para registrar:</p>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setSelectedCycles(6)}
                                    className={`text-center p-3 rounded-lg border transition-all ${selectedCycles === 6
                                        ? "bg-emerald-500/20 border-emerald-500 ring-1 ring-emerald-500/50"
                                        : "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10"
                                        }`}
                                >
                                    <div className="text-emerald-400 font-bold text-lg">{calculateBedtime(6)}</div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">6 Ciclos (9h)</div>
                                </button>

                                <button
                                    onClick={() => setSelectedCycles(5)}
                                    className={`text-center p-3 rounded-lg border transition-all ${selectedCycles === 5
                                        ? "bg-indigo-500/20 border-indigo-500 ring-1 ring-indigo-500/50"
                                        : "bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10"
                                        }`}
                                >
                                    <div className="text-white font-bold text-lg">{calculateBedtime(5)}</div>
                                    <div className="text-[10px] text-indigo-300 uppercase tracking-wider">5 Ciclos (7.5h)</div>
                                </button>

                                <button
                                    onClick={() => setSelectedCycles(4)}
                                    className={`text-center p-3 rounded-lg border transition-all ${selectedCycles === 4
                                        ? "bg-orange-500/20 border-orange-500 ring-1 ring-orange-500/50"
                                        : "bg-orange-500/5 border-orange-500/20 hover:bg-orange-500/10"
                                        }`}
                                >
                                    <div className="text-orange-400 font-bold text-lg">{calculateBedtime(4)}</div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">4 Ciclos (6h)</div>
                                </button>
                            </div>
                            <p className="text-xs text-zinc-600 text-center mt-2">*Inclui 15min para adormecer.</p>
                        </div>
                    </Card>

                    {/* Stats & Quick Actions */}
                    <div className="space-y-4">
                        <Card className="p-6 bg-zinc-900/50 border-white/5 flex flex-col justify-between h-full">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Qualidade do Sono</h3>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-bold text-white">7.5</span>
                                    <span className="text-sm text-zinc-500 mb-1">h / média</span>
                                </div>
                            </div>

                            <div className="mt-8">
                                <Button
                                    className={`w-full h-12 text-white transition-all ${selectedCycles ? "bg-indigo-600 hover:bg-indigo-500" : "bg-zinc-700 hover:bg-zinc-600"}`}
                                    onClick={handleLogSleep}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Plus size={18} />
                                        <span>
                                            {selectedCycles
                                                ? `Registrar (${selectedCycles * 1.5}h)`
                                                : "Registrar Noite"
                                            }
                                        </span>
                                    </div>
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Recent History */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <History size={20} className="text-zinc-500" />
                        Histórico Recente
                    </h3>
                    <div className="space-y-2">
                        {sortedLogs.map(log => (
                            <div key={log.id} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center
                                        ${log.quality === 'good' ? 'bg-emerald-500/10 text-emerald-500' :
                                            log.quality === 'avg' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}
                                    `}>
                                        <BedDouble size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{format(new Date(log.date), "dd 'de' MMMM")}</p>
                                        <p className="text-xs text-zinc-500">{log.bedtime} - {log.wakeup}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-bold text-white">{log.duration}h</p>
                                    <p className="text-xs text-zinc-500 capitalize">{log.quality === 'good' ? 'Bom' : log.quality === 'avg' ? 'Médio' : 'Ruim'}</p>
                                </div>
                            </div>
                        ))}
                        {sortedLogs.length === 0 && (
                            <div className="text-center py-8 text-zinc-500">
                                Nenhum registro de sono ainda.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
