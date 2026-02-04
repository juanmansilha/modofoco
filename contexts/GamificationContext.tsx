"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useNotifications } from "./NotificationContext";
import { FOCO_POINTS, LEVELS } from "@/lib/gamification";
import { supabase } from "@/lib/supabase";

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
    awardFP: (amount: number, reason: string) => Promise<void>;
    spendFP: (amount: number, reason: string) => Promise<boolean>;
    nextLevelFP: number;
    progress: number;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const [fp, setFp] = useState(0); // Spendable
    const [lifetimeFP, setLifetimeFP] = useState(0); // XP
    const [history, setHistory] = useState<FPHistoryItem[]>([]);
    const { addNotification } = useNotifications();

    // 1. Calculate Level Helpers
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
    const nextLevelThreshold = nextLevel ? nextLevel.minFP : LEVELS[LEVELS.length - 1].minFP * 1.5;

    // Progress
    const currentLevelBase = currentLevel.minFP;
    const progressRange = nextLevelThreshold - currentLevelBase;
    const progressInLevel = lifetimeFP - currentLevelBase;
    const progress = nextLevel
        ? Math.min(100, Math.max(0, (progressInLevel / progressRange) * 100))
        : 100;


    // 2. Load Data from Supabase
    useEffect(() => {
        const fetchGamificationData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Profile Points
            const { data: profile } = await supabase
                .from('profiles')
                .select('fp, lifetime_fp')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFp(profile.fp || 0);
                setLifetimeFP(profile.lifetime_fp || 0);
            }

            // Fetch History (if table exists)
            try {
                const { data: historyData } = await supabase
                    .from('gamification_history')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (historyData) {
                    setHistory(historyData.map((h: any) => ({
                        id: h.id,
                        reason: h.reason,
                        amount: h.amount,
                        timestamp: new Date(h.created_at).getTime(),
                        type: h.type as any
                    })));
                } else {
                    // Fallback to local storage if DB is empty (migration scenario)
                    const storedHistory = localStorage.getItem("modofoco-fp-history");
                    if (storedHistory) setHistory(JSON.parse(storedHistory));
                }
            } catch (e) {
                console.log("History table likely not ready, ignoring", e);
            }
        };

        fetchGamificationData();

        // Realtime Subscription for Profile Updates (e.g. from Webhook)
        const channel = supabase
            .channel('gamification_updates')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles' },
                async (payload) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user && payload.new.id === user.id) {
                        const newProfile = payload.new as any;
                        if (newProfile.fp !== undefined) setFp(newProfile.fp);
                        if (newProfile.lifetime_fp !== undefined) setLifetimeFP(newProfile.lifetime_fp);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);


    // 3. Actions
    const awardFP = async (amount: number, reason: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // Should handle offline mode differently? For now, enforce online.

        const newFP = fp + amount;
        const newLifetime = lifetimeFP + amount;

        // Optimistic Update
        setFp(newFP);
        setLifetimeFP(newLifetime);

        // Check for Level Up (Optimistic)
        const newLevelCalc = calculateLevel(newLifetime);
        if (newLevelCalc.level > currentLevel.level) {
            addNotification("NÍVEL SUPERIOR! 🚀", `Parabéns! Você alcançou o Nível ${newLevelCalc.level} - ${newLevelCalc.name}!`);
        } else {
            addNotification(`+${amount} FP: ${reason}`, "success");
        }

        // DB Update
        try {
            await supabase.from('profiles').update({
                fp: newFP,
                lifetime_fp: newLifetime
            }).eq('id', user.id);

            await supabase.from('gamification_history').insert({
                user_id: user.id,
                amount: amount,
                reason: reason,
                type: 'earn'
            });

            // Refresh history local
            const newItem: FPHistoryItem = {
                id: crypto.randomUUID(), // Temp ID
                reason,
                amount,
                timestamp: Date.now(),
                type: "earn"
            };
            setHistory(prev => [newItem, ...prev]);

        } catch (error) {
            console.error("Failed to sync points", error);
            // Revert?
        }
    };

    const spendFP = async (amount: number, reason: string): Promise<boolean> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        if (fp < amount) {
            addNotification("Saldo insuficiente de FocoPoints!", "error");
            return false;
        }

        const newFP = fp - amount;
        setFp(newFP);

        addNotification(`-${amount} FP: ${reason}`, "info");

        try {
            await supabase.from('profiles').update({ fp: newFP }).eq('id', user.id);

            await supabase.from('gamification_history').insert({
                user_id: user.id,
                amount: -amount,
                reason: reason,
                type: 'spend'
            });

            // Refresh history local
            const newItem: FPHistoryItem = {
                id: crypto.randomUUID(),
                reason,
                amount: -amount,
                timestamp: Date.now(),
                type: "spend"
            };
            setHistory(prev => [newItem, ...prev]);

            return true;
        } catch (error) {
            console.error("Failed to spend points", error);
            return false;
        }
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
