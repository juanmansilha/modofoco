"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Play, Pause, Square, Share2, MapPin, Trash2, ArrowLeft } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { toPng } from "html-to-image";

// Dynamic import for Leaflet map to avoid SSR issues
const RunMap = dynamic(() => import("./RunMap"), { ssr: false });

interface LatLng {
    lat: number;
    lng: number;
}

interface RunTrackerProps {
    onBack: () => void;
    onSave: (data: { dist: number; duration: string; calories: number; mapImage?: string }) => void;
}

export function RunTracker({ onBack, onSave }: RunTrackerProps) {
    const [points, setPoints] = useState<LatLng[]>([]);
    const [actualPath, setActualPath] = useState<LatLng[]>([]); // GPS Path
    const [distance, setDistance] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // Share State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const shareRef = useRef<HTMLDivElement>(null);

    // Address Search State
    const [startQuery, setStartQuery] = useState("");
    const [endQuery, setEndQuery] = useState("");

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);
    const { addNotification } = useNotifications();

    // Lazy import for geocoding to avoid server-side issues
    // We use require here inside component scope or just imported normally if it was a component,
    // but since it's a lib function we can import it at top or require it. 
    // Let's use standard import if possible, but the instruction suggested lazy.
    // Actually, let's just use the function directly if imported at top, but since we didn't add import at top...
    // I will add the import line at the top in a separate edit if needed, or just use require here.
    const { searchAddress } = require("@/lib/geocoding");

    // Timer Logic
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTime(t => t + 1);
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning]);

    // Format Time (MM:SS)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate Grid Distance (Haversine approx)
    const calculateDistance = (p1: LatLng, p2: LatLng) => {
        const R = 6371; // Earth radius km
        const dLat = (p2.lat - p1.lat) * Math.PI / 180;
        const dLon = (p2.lng - p1.lng) * Math.PI / 180;
        const lat1 = p1.lat * Math.PI / 180;
        const lat2 = p2.lat * Math.PI / 180;

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleAddPoint = (point: LatLng) => {
        if (isRunning || isFinished) return; // Lock map editing while running

        setPoints(prev => {
            const newPoints = [...prev, point];
            // Update distance
            if (prev.length > 0) {
                const lastPoint = prev[prev.length - 1];
                const addedDist = calculateDistance(lastPoint, point);
                setDistance(d => d + addedDist);
            }
            return newPoints;
        });
    };

    const handleClearPoints = () => {
        setPoints([]);
        setDistance(0);
    };

    const handleShareFromModal = async () => {
        if (!shareRef.current) return;
        try {
            const dataUrl = await toPng(shareRef.current, { cacheBust: true, backgroundColor: '#09090b', pixelRatio: 2 });

            // Check if Web Share API is supported (Mobile)
            if (navigator.share) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], "modofoco-story.png", { type: "image/png" });
                await navigator.share({
                    files: [file],
                    title: 'Minha Corrida no ModoFoco',
                });
            } else {
                // Fallback to download
                const link = document.createElement('a');
                link.download = `modofoco-run-${new Date().toISOString()}.png`;
                link.href = dataUrl;
                link.click();
            }
            addNotification("Sucesso", "Pronto para compartilhar!");
            setIsShareModalOpen(false);
        } catch (e) {
            console.error(e);
            addNotification("Erro", "Não foi possível gerar o story.");
        }
    };

    const handleFinish = () => {
        setIsRunning(false);
        setIsFinished(true);
    };

    const handleSaveAndExit = () => {
        // approx 60 kcal per km ? or based on time. 
        // Let's use avg 70kcal/km for simplicity
        const calories = Math.round(distance * 70);

        onSave({
            dist: Number(distance.toFixed(2)),
            duration: formatTime(time),
            calories
        });
    };

    const calories = Math.round(distance * 70);

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack} size="sm">
                    <ArrowLeft size={16} className="mr-2" /> Voltar
                </Button>
                <div className="text-xl font-mono font-bold text-white">
                    {formatTime(time)}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

                {/* Map Section */}
                <div className="lg:col-span-2 bg-zinc-900 rounded-2xl overflow-hidden relative border border-white/10 min-h-[400px]">
                    <RunMap points={points} onAddPoint={handleAddPoint} readOnly={isFinished || isRunning} />

                    {!isRunning && !isFinished && points.length > 0 && (
                        <div className="absolute top-4 right-4 z-[400]">
                            <Button size="icon" variant="destructive" onClick={handleClearPoints}>
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Controls & Stats */}
                <div className="space-y-4">
                    {/* Stats Card */}
                    <div ref={resultRef} className="bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <MapPin className="text-orange-500" /> Resumo
                            </h3>
                            <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">ModoFoco</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-black/40 rounded-xl">
                                <span className="text-zinc-400 text-xs uppercase">Distância</span>
                                <div className="text-2xl font-bold text-white">{distance.toFixed(2)} <span className="text-sm font-normal text-zinc-500">km</span></div>
                            </div>
                            <div className="p-4 bg-black/40 rounded-xl">
                                <span className="text-zinc-400 text-xs uppercase">Tempo</span>
                                <div className="text-2xl font-bold text-white">{formatTime(time)}</div>
                            </div>
                            <div className="p-4 bg-black/40 rounded-xl col-span-2 flex items-center justify-between">
                                <span className="text-zinc-400 text-xs uppercase">Calorias Est.</span>
                                <div className="text-2xl font-bold text-orange-400">{calories} <span className="text-sm font-normal text-zinc-500">kcal</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    {!isFinished ? (
                        <div className="grid grid-cols-2 gap-3">
                            {!isRunning ? (
                                <Button
                                    className="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white py-6"
                                    onClick={() => {
                                        setIsRunning(true);
                                        setDistance(0); // Reset distance to track ACTUAL run from 0
                                        setActualPath([]); // Reset actual path
                                    }}
                                >
                                    <Play fill="currentColor" className="mr-2" /> Iniciar Corrida
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        className="bg-zinc-700 hover:bg-zinc-600 text-white py-6"
                                        onClick={() => setIsRunning(false)}
                                    >
                                        <Pause fill="currentColor" className="mr-2" /> Pausar
                                    </Button>
                                    <Button
                                        className="bg-red-600 hover:bg-red-500 text-white py-6"
                                        onClick={handleFinish}
                                    >
                                        <Square fill="currentColor" className="mr-2" /> Finalizar
                                    </Button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4" onClick={() => setIsShareModalOpen(true)}>
                                <Share2 className="mr-2" /> Pré-visualizar Story
                            </Button>
                            <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4" onClick={handleSaveAndExit}>
                                Salvar e Sair
                            </Button>
                        </div>
                    )}

                    {!isRunning && points.length === 0 && !isFinished && (
                        <div className="text-sm text-zinc-500 text-center p-4">
                            Toque no mapa ou busque um endereço para começar.
                        </div>
                    )}
                </div>
            </div>

            {/* Social Share Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="flex flex-col gap-4 max-h-[90vh]">
                        <div className="flex items-center justify-between text-white">
                            <h3 className="font-bold">Pré-visualização</h3>
                            <Button size="sm" variant="ghost" onClick={() => setIsShareModalOpen(false)}>Fechar</Button>
                        </div>

                        {/* Story Container (Capture Target) */}
                        <div
                            ref={shareRef}
                            className="w-[320px] aspect-[9/16] bg-zinc-950 rounded-2xl overflow-hidden flex flex-col border border-white/10 relative shadow-2xl"
                        >
                            {/* Map Top (65%) */}
                            <div className="h-[65%] relative">
                                <RunMap
                                    points={points}
                                    actualPath={actualPath}
                                    onAddPoint={() => { }}
                                    readOnly={true}
                                    userLocation={actualPath.length > 0 ? actualPath[actualPath.length - 1] : undefined}
                                />
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none z-[400]" />
                            </div>

                            {/* Branding & Stats Bottom (35%) */}
                            <div className="flex-1 flex flex-col justify-between p-6 relative z-[500]">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                                        <MapPin size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white leading-none">ModoFoco</div>
                                        <div className="text-[10px] text-zinc-400">Run Tracker</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Distância</div>
                                        <div className="text-3xl font-black text-white italic">{distance.toFixed(2)}<span className="text-sm not-italic ml-1 text-zinc-400 font-normal">km</span></div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Tempo</div>
                                        <div className="text-3xl font-black text-white italic">{formatTime(time)}</div>
                                    </div>
                                    <div className="col-span-2 pt-4 border-t border-white/10 flex items-center justify-between">
                                        <div className="text-xs text-zinc-400">Energia gasta</div>
                                        <div className="text-xl font-bold text-orange-400">{calories} <span className="text-sm text-zinc-500">kcal</span></div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 flex justify-center">
                                    <div className="text-[10px] text-zinc-600 font-mono">
                                        {new Date().toLocaleDateString('pt-BR')} • {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 text-lg font-bold shadow-xl shadow-indigo-900/20" onClick={handleShareFromModal}>
                            <Share2 className="mr-2" /> Compartilhar no Instagram
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
