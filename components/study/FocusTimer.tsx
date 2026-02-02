"use client";

import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, Square, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FocusTimerProps {
    isOpen: boolean;
    onClose: () => void;
    subjectId?: string;
    subjectName?: string;
    onComplete: (durationMinutes: number) => void;
}

export function FocusTimer({ isOpen, onClose, subjectId, subjectName, onComplete }: FocusTimerProps) {
    const [duration, setDuration] = useState(25); // minutes
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeLeft(duration * 60);
            setIsActive(false);
            setIsPaused(false);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [isOpen, duration]);

    useEffect(() => {
        if (isActive && !isPaused && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            // Timer finished
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsActive(false);
            onComplete(duration);
            // Play sound?
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, isPaused, timeLeft, duration, onComplete]);

    const toggleTimer = () => {
        if (!isActive) {
            setIsActive(true);
            setIsPaused(false);
        } else {
            setIsPaused(!isPaused);
        }
    };

    const stopTimer = () => {
        setIsActive(false);
        setIsPaused(false);
        setTimeLeft(duration * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress for circle
    const totalSeconds = duration * 60;
    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-6"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={32} />
                    </button>

                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">Modo Foco</h2>
                        <p className="text-zinc-400 text-lg">Mantenha o foco e alcance seus objetivos.</p>
                    </div>

                    {!isActive ? (
                        <div className="flex flex-col items-center gap-8">
                            <div className="flex gap-4">
                                {[25, 45, 60].map((mins) => (
                                    <button
                                        key={mins}
                                        onClick={() => setDuration(mins)}
                                        className={`px-6 py-4 rounded-2xl text-xl font-bold border transition-all ${duration === mins
                                            ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)]"
                                            : "bg-zinc-900 border-white/10 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                            }`}
                                    >
                                        {mins} min
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-zinc-500 font-medium">Personalizar:</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="180"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value) || 25)}
                                    className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 w-24 text-center text-white font-bold focus:outline-none focus:border-indigo-500"
                                />
                                <span className="text-zinc-500">minutos</span>
                            </div>

                            <button
                                onClick={toggleTimer}
                                className="group relative px-12 py-6 bg-white text-black text-2xl font-bold rounded-full hover:bg-zinc-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center gap-4 mt-8"
                            >
                                <Play size={28} className="fill-black" />
                                INICIAR FOCO
                                <div className="absolute inset-0 rounded-full border border-white/50 animate-ping opacity-20" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="relative mb-12">
                                {/* SVG Timer Circle */}
                                <svg className="transform -rotate-90 w-80 h-80 md:w-96 md:h-96">
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r={radius}
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-zinc-800"
                                    />
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r={radius}
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        className="text-indigo-500 transition-all duration-1000 ease-linear shadow-[0_0_20px_theme(colors.indigo.500)]"
                                        strokeLinecap="round"
                                    />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-6xl md:text-8xl font-bold text-white tabular-nums tracking-tighter">
                                        {formatTime(timeLeft)}
                                    </span>
                                    <span className="text-indigo-400 font-medium mt-2 animate-pulse">
                                        {isPaused ? "PAUSADO" : "EM FOCO"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <button
                                    onClick={toggleTimer}
                                    className="p-6 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-all border border-white/10"
                                >
                                    {isPaused ? <Play size={32} className="fill-white" /> : <Pause size={32} className="fill-white" />}
                                </button>
                                <button
                                    onClick={stopTimer}
                                    className="p-6 rounded-full bg-zinc-800 text-red-500 hover:bg-red-500/10 transition-all border border-white/10"
                                >
                                    <Square size={32} className="fill-red-500" />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
