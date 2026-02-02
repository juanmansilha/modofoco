"use client";

import { motion } from "framer-motion";
import { X, CheckCheck, Trash2 } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";

interface NotificationPanelProps {
    onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
    const { notifications, markAsRead, deleteNotification, clearAll } = useNotifications();

    if (notifications.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full bg-zinc-900/90 border border-white/10 backdrop-blur-xl rounded-xl shadow-2xl p-4"
            >
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white">Notificações</h3>
                    <button onClick={onClose}><X size={16} className="text-zinc-500 hover:text-white" /></button>
                </div>
                <div className="text-center py-8 text-zinc-500 text-sm">
                    Nenhuma notificação nova.
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-zinc-900/90 border border-white/10 backdrop-blur-xl rounded-xl shadow-2xl flex flex-col max-h-[400px]"
        >
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-900/50 rounded-t-xl sticky top-0">
                <h3 className="font-bold text-white">Notificações ({notifications.length})</h3>
                <div className="flex items-center gap-2">
                    <button onClick={clearAll} title="Limpar tudo" className="text-zinc-500 hover:text-red-400">
                        <Trash2 size={16} />
                    </button>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white ml-2">
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-2">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={cn(
                            "p-3 rounded-lg border transition-all cursor-pointer relative group",
                            n.read ? "bg-zinc-900 border-transparent opacity-60 hover:opacity-100" : "bg-white/5 border-white/10 hover:bg-white/10"
                        )}
                        onClick={() => markAsRead(n.id)}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h4 className={cn("text-sm font-medium", n.read ? "text-zinc-400" : "text-white")}>{n.title}</h4>
                            {!n.read && <div className="h-2 w-2 rounded-full bg-indigo-500" />}
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-zinc-600 mt-2 block">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <button
                            onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-opacity bg-zinc-900/80 rounded"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
