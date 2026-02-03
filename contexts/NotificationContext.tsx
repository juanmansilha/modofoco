"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ToastContainer, ToastProps } from "@/components/ui/Toast";

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
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const EXPIRY_TIME = 48 * 60 * 60 * 1000; // 48 hours in ms

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    // Load from localStorage on mount and check expiry
    useEffect(() => {
        const stored = localStorage.getItem("modofoco-notifications");
        if (stored) {
            try {
                const parsed: Notification[] = JSON.parse(stored);
                // Filter out expired warnings
                const valid = parsed.filter(n => Date.now() - n.timestamp < EXPIRY_TIME);
                setNotifications(valid);
            } catch (e) {
                console.error("Failed to parse notifications", e);
            }
        }
    }, []);

    // Request notification permission on mount
    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    }, []);

    // Save to localStorage whenever notifications change
    useEffect(() => {
        localStorage.setItem("modofoco-notifications", JSON.stringify(notifications));
    }, [notifications]);

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

        // System Notification
        if ("Notification" in window && Notification.permission === "granted") {
            try {
                // Check if document is hidden or just always show for prominence
                // Usually we show if hidden OR if user wants consistent alerts
                // The user requested ALL notifications.

                // Mobile service worker support is complex, but basic Notification API works
                // heavily on Android (Chrome) and standard Desktop.
                // iOS requires PWA install + user interaction context mostly.

                const n = new Notification(title, {
                    body: message,
                    icon: '/icons/icon-192x192.png', // Assuming pwa icon exists, fallback handled by browser
                    badge: '/icons/icon-192x192.png',
                    tag: 'modofoco-notification', // Overwrites previous if simultaneous? No, keep unique or standard.
                });

                // Close after a few seconds automatically? System handles this usually.
                // n.onclick = () => window.focus();
            } catch (error) {
                console.error("System notification failed", error);
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

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            deleteNotification,
            clearAll
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
