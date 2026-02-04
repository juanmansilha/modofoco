"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ToastContainer, ToastProps } from "@/components/ui/Toast";
import { useGlobalData } from "./GlobalDataProvider";

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (title: string, message: string) => void;
    markAsRead: (id: string) => void;
    deleteNotification: (id: string) => void;
    clearAll: () => void;
    requestPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const EXPIRY_TIME = 48 * 60 * 60 * 1000; // 48 hours in ms

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const { userData } = useGlobalData();
    const userId = userData.id || "guest"; // Get user ID
    const STORAGE_KEY = `modofoco-notifications-${userId}`;

    // Load from localStorage on mount and check expiry
    useEffect(() => {
        if (!userId) return; // Wait for user ID

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed: Notification[] = JSON.parse(stored);
                // Filter out expired warnings
                const valid = parsed.filter(n => Date.now() - n.timestamp < EXPIRY_TIME);
                setNotifications(valid);
            } catch (e) {
                console.error("Failed to parse notifications", e);
            }
        } else {
            setNotifications([]); // Clear if no storage for this user
        }
    }, [userId]); // Re-run when userId changes

    // Request permission logic (Restored)
    useEffect(() => {
        const handleInteraction = () => {
            if ("Notification" in window && Notification.permission === "default") {
                Notification.requestPermission();
            }
        };

        // Try immediately (Desktop)
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission().catch(() => { });
        }

        // Add listener for mobile support
        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('touchstart', handleInteraction, { once: true });

        // Test Notification on mount (if allowed)
        if ("Notification" in window && Notification.permission === "granted") {
            // navigator.serviceWorker.ready.then(reg => reg.showNotification("ModoFoco", { body: "Sistema de alerta ativo!" }));
        }

        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
        };
    }, []);


    // Save to localStorage whenever notifications change
    useEffect(() => {
        if (userId !== "guest") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
        }
    }, [notifications, userId, STORAGE_KEY]);

    const addNotification = (title: string, message: string) => {
        const id = crypto.randomUUID();
        const newNotification: Notification = {
            id,
            title,
            message,
            timestamp: Date.now(),
            read: false,
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Show toast
        setToasts(prev => [...prev, { id, title, message, onClose: removeToast }]);

        // Native Notification (Mobile/Background Support)
        if ("Notification" in window && Notification.permission === "granted") {
            if (navigator.serviceWorker) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, {
                        body: message,
                        icon: '/icons/icon-192x192.png',
                        badge: '/icons/icon-192x192.png',
                        tag: 'modofoco-notification'
                    });
                });
            } else {
                new Notification(title, { body: message, icon: '/icons/icon-192x192.png' });
            }
        }


    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const requestPermission = async () => {
        if ("Notification" in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                addNotification("Sucesso", "Notificações ativas!");
            }
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            deleteNotification,
            clearAll,
            requestPermission
        }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}
