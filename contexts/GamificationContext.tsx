"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useNotifications } from "./NotificationContext";
import { FOCO_POINTS, LEVELS } from "@/lib/gamification";

export interface FPHistoryItem {
    id: string;
    reason: string;
    amount: number;
    timestamp: number;
    type: "earn" | "spend";
}

interface GamificationContextType {
    fp: number; // Spendable Balance
    lifetimeFP: number; // Total XP (Level)
    level: number;
    levelData: typeof LEVELS[0];
    history: FPHistoryItem[];
    awardFP: (amount: number, reason: string) => void;
    spendFP: (amount: number, reason: string) => boolean;
    nextLevelFP: number;
    progress: number;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const [fp, setFp] = useState(0); // Spendable
    const [lifetimeFP, setLifetimeFP] = useState(0); // XP
    const [history, setHistory] = useState<FPHistoryItem[]>([]);
    const { addNotification } = useNotifications();

    // Load from local storage
    useEffect(() => {
        const storedFP = localStorage.getItem("modofoco-fp");
        const storedLifetime = localStorage.getItem("modofoco-lifetime-fp");
        const storedHistory = localStorage.getItem("modofoco-fp-history");

        if (storedFP) setFp(parseInt(storedFP));

        if (storedLifetime) {
            setLifetimeFP(parseInt(storedLifetime));
        } else if (storedFP) {
            // Migration: If no lifetime, assume current FP is lifetime (first run after update)
            setLifetimeFP(parseInt(storedFP));
        }

        if (storedHistory) setHistory(JSON.parse(storedHistory));
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem("modofoco-fp", fp.toString());
        localStorage.setItem("modofoco-lifetime-fp", lifetimeFP.toString());
        localStorage.setItem("modofoco-fp-history", JSON.stringify(history));
    }, [fp, lifetimeFP, history]);

    const calculateLevel = (currentXP: number) => {
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (currentXP >= LEVELS[i].minFP) {
                return LEVELS[i];
            }
        }
        return LEVELS[0];
    };

    const currentLevel = calculateLevel(lifetimeFP);

    // Calculate Next Level
    const currentLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level);
    const nextLevel = LEVELS[currentLevelIndex + 1];

    const nextLevelThreshold = nextLevel ? nextLevel.minFP : LEVELS[LEVELS.length - 1].minFP * 1.5; // Cap or infinite

    // Progress for current level
    const currentLevelBase = currentLevel.minFP;
    const progressRange = nextLevelThreshold - currentLevelBase;
    const progressInLevel = lifetimeFP - currentLevelBase;

    // If max level, progress is 100%
    const progress = nextLevel
        ? Math.min(100, Math.max(0, (progressInLevel / progressRange) * 100))
        : 100;

    const awardFP = (amount: number, reason: string) => {
        const newFP = fp + amount;
        const newLifetime = lifetimeFP + amount;

        setFp(newFP);
        setLifetimeFP(newLifetime);

        const newItem: FPHistoryItem = {
            id: crypto.randomUUID(),
            reason,
            amount,
            timestamp: Date.now(),
            type: "earn"
        };
        setHistory(prev => [newItem, ...prev]);

        // Check for Level Up
        const newLevelCalc = calculateLevel(newLifetime);
        if (newLevelCalc.level > currentLevel.level) {
            addNotification("NÍVEL SUPERIOR! 🚀", `Parabéns! Você alcançou o Nível ${newLevelCalc.level} - ${newLevelCalc.name}!`);
        } else {
            addNotification(`+${amount} FP`, reason);
        }
    };

    const spendFP = (amount: number, reason: string): boolean => {
        if (fp < amount) {
            addNotification("Saldo Insuficiente", "Você precisa de mais Foco Points.");
            return false;
        }

        setFp(prev => prev - amount); // Only reduce spendable

        const newItem: FPHistoryItem = {
            id: crypto.randomUUID(),
            reason,
            amount: -amount,
            timestamp: Date.now(),
            type: "spend"
        };
        setHistory(prev => [newItem, ...prev]);
        addNotification("Resgate Efetuado!", `-${amount} FP: ${reason}`);
        return true;
    };

    return (
        <GamificationContext.Provider value={{
            fp,
            lifetimeFP,
            level: currentLevel.level,
            levelData: currentLevel,
            history,
            awardFP,
            spendFP,
            nextLevelFP: nextLevelThreshold,
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
