"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useNotifications } from "./NotificationContext";
import { FOCO_POINTS, LEVEL_THRESHOLDS } from "@/lib/gamification";

export interface FPHistoryItem {
    id: string;
    reason: string;
    amount: number;
    timestamp: number;
}

interface GamificationContextType {
    fp: number;
    level: number;
    history: FPHistoryItem[];
    awardFP: (amount: number, reason: string) => void;
    nextLevelFP: number;
    progress: number;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const [fp, setFp] = useState(0);
    const [history, setHistory] = useState<FPHistoryItem[]>([]);
    const { addNotification } = useNotifications();

    // Load from local storage
    useEffect(() => {
        // Migration legacy ZP -> FP (simple rename for now, or reset if desired. Let's try to keep it)
        const storedZP = localStorage.getItem("modofoco-zp");
        const storedZPHistory = localStorage.getItem("modofoco-zp-history");

        const storedFP = localStorage.getItem("modofoco-fp");
        const storedFPHistory = localStorage.getItem("modofoco-fp-history");

        if (storedFP) {
            setFp(parseInt(storedFP));
            if (storedFPHistory) setHistory(JSON.parse(storedFPHistory));
        } else if (storedZP) {
            // Migration: Convert ZP to FP (1:1 for now, user might have tons of points but new values are small. 
            // It's safer to just import them as is or maybe scale them down? 
            // Given the user re-calibration, let's just carry them over as FP for continuity).
            setFp(parseInt(storedZP));
            if (storedZPHistory) {
                // Map old ZP history to FP history structure (same structure actually)
                setHistory(JSON.parse(storedZPHistory));
            }
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem("modofoco-fp", fp.toString());
        localStorage.setItem("modofoco-fp-history", JSON.stringify(history));
    }, [fp, history]);

    const calculateLevel = (currentFP: number) => {
        let level = 1;
        for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
            if (currentFP >= LEVEL_THRESHOLDS[i]) {
                level = i + 1;
            } else {
                break;
            }
        }
        return level;
    };

    const level = calculateLevel(fp);
    const currentLevelThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextLevelThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * 2;
    const nextLevelFP = nextLevelThreshold;

    // Progress for current level (0 to 100)
    // Formula: (Current FP - Current Level Base) / (Next Level Base - Current Level Base) * 100
    const levelRange = nextLevelThreshold - currentLevelThreshold;
    const progressInLevel = fp - currentLevelThreshold;
    const progress = Math.min(100, Math.max(0, (progressInLevel / levelRange) * 100));


    const awardFP = (amount: number, reason: string) => {
        const newFP = fp + amount;
        setFp(newFP);

        const newItem: FPHistoryItem = {
            id: crypto.randomUUID(),
            reason,
            amount,
            timestamp: Date.now()
        };
        setHistory(prev => [newItem, ...prev]);

        // Check for Level Up
        const newLevel = calculateLevel(newFP);
        if (newLevel > level) {
            addNotification("NÍVEL SUPERIOR! 🚀", `Parabéns! Você alcançou o Nível ${newLevel}!`);
        } else {
            addNotification(`+${amount} FP`, reason);
        }
    };

    return (
        <GamificationContext.Provider value={{
            fp,
            level,
            history,
            awardFP,
            nextLevelFP,
            progress
        }}>
            {children}
        </GamificationContext.Provider>
    );
}

export function useGamification() {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error("useGamification must be used within a GamificationProvider");
    }
    return context;
}
