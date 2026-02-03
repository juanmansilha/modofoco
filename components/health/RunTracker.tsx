"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Play, Pause, Square, Share2, MapPin, Trash2, ArrowLeft } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import html2canvas from "html2canvas";

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

    const handleShare = async () => {
        if (!resultRef.current) return;
        try {
            const canvas = await html2canvas(resultRef.current, { useCORS: true, backgroundColor: '#09090b' });
            const link = document.createElement('a');
            link.download = `modofoco-run-${new Date().toISOString()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            addNotification("Imagem Salva", "Compartilhe sua conquista no Instagram!");
        } catch (e) {
            console.error(e);
            addNotification("Erro", "Não foi possível gerar a imagem.");
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
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4" onClick={handleShare}>
                                <Share2 className="mr-2" /> Compartilhar Instagram
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
        </div>
    );
}
