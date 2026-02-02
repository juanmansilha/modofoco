"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Bell } from "lucide-react";
import { useEffect } from "react";

export interface ToastProps {
    id: string;
    title: string;
    message: string;
    onClose: (id: string) => void;
}

export function Toast({ id, title, message, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 5000); // Auto-dismiss from screen after 5s

        return () => clearTimeout(timer);
    }, [id, onClose]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-zinc-900 border border-white/10 shadow-lg shadow-black/50 ring-1 ring-black/5"
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Bell className="h-6 w-6 text-indigo-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-white">{title}</p>
                        <p className="mt-1 text-sm text-zinc-400">{message}</p>
                    </div>
                    <div className="ml-4 flex flex-shrink-0">
                        <button
                            type="button"
                            className="inline-flex rounded-md bg-transparent text-zinc-400 hover:text-white focus:outline-none"
                            onClick={() => onClose(id)}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export function ToastContainer({ toasts, removeToast }: { toasts: ToastProps[], removeToast: (id: string) => void }) {
    return (
        <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 sm:p-6 lg:items-end w-full max-w-md pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} onClose={removeToast} />
                ))}
            </AnimatePresence>
        </div>
    );
}
