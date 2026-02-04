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

    // Load from Supabase & Realtime Sync
    useEffect(() => {
        const fetchGamificationData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch Points
            const { data: profile } = await supabase
                .from('profiles')
                .select('fp, lifetime_fp')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFp(profile.fp || 0);
                setLifetimeFP(profile.lifetime_fp || 0);
            }

            // 2. Fetch History (Optional: Create table 'gamification_history' or keep local for now?)
            // Ideally we fetch from DB. For now, we will mix or just keep local until table exists.
            // Let's assume table exists since we provided migration.
            const { data: historyData } = await supabase
                .from('gamification_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (historyData) {
                setHistory(historyData.map(h => ({
                    id: h.id,
                    reason: h.reason,
                    amount: h.amount,
                    timestamp: new Date(h.created_at).getTime(),
                    type: h.type as any
                })));
            }
        };

        fetchGamificationData();

        // Realtime Subscription
        const channel = supabase
            .channel('gamification_updates')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles' },
                (payload) => {
                    // Update if it's our user
                    if (payload.new.id === supabase.auth.getUser().then(({ data }) => data.user?.id)) { // Logic simplification needed
                        // Just re-fetch or use payload
                        const newProfile = payload.new as any;
                        setFp(newProfile.fp);
                        setLifetimeFP(newProfile.lifetime_fp);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Save to Supabase (instead of LocalStorage)
    const updatePoints = async (newFP: number, newLifetime: number) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('profiles').update({
            fp: newFP,
            lifetime_fp: newLifetime
        }).eq('id', user.id);
    };

    const awardFP = async (amount: number, reason: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const newFP = fp + amount;
        const newLifetime = lifetimeFP + amount;

        setFp(newFP); // Optimistic
        setLifetimeFP(newLifetime);

        // Update Profile
        await supabase.from('profiles').update({
            fp: newFP,
            lifetime_fp: newLifetime
        }).eq('id', user.id);

        // Insert History
        await supabase.from('gamification_history').insert({
            user_id: user.id,
            amount: amount,
            reason: reason,
            type: 'earn'
        });

        // Refresh history
        setHistory(prev => [{
            id: crypto.randomUUID(),
            reason,
            amount,
            timestamp: Date.now(),
            type: "earn"
        }, ...prev]);

        // ... notification logic
        addNotification(`+${amount} FP: ${reason}`, "success");
    };

    const spendFP = async (amount: number, reason: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        if (fp < amount) {
            addNotification("Saldo insuficiente de FocoPoints!", "error");
            return false;
        }

        const newFP = fp - amount;
        setFp(newFP); // Optimistic

        // Update Profile
        await supabase.from('profiles').update({
            fp: newFP
        }).eq('id', user.id);

        // Insert History
        await supabase.from('gamification_history').insert({
            user_id: user.id,
            amount: -amount, // Store as negative or just value? Logic uses type 'spend'
            reason: reason,
            type: 'spend'
        });

        setHistory(prev => [{
            id: crypto.randomUUID(),
            reason,
            amount: -amount,
            timestamp: Date.now(),
            type: "spend"
        }, ...prev]);

        addNotification(`-${amount} FP: ${reason}`, "info"); // Changed type to info/neutral
        return true;
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
