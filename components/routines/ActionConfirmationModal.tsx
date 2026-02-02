"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Copy, Repeat } from "lucide-react";

interface ActionConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (scope: 'this' | 'all') => void;
    action: 'edit' | 'delete';
}

export function ActionConfirmationModal({ isOpen, onClose, onConfirm, action }: ActionConfirmationModalProps) {
    if (!isOpen) return null;

    const isDelete = action === 'delete';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                >
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                            <Repeat size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            Rotina Recorrente
                        </h3>
                        <p className="text-zinc-400 text-sm">
                            Esta rotina se repete em outros dias. Como você deseja aplicar esta alteração?
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => onConfirm('this')}
                            className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="w-2 h-2 rounded-full bg-white"></span>
                            Apenas para hoje
                        </button>
                        <button
                            onClick={() => onConfirm('all')}
                            className={`w-full py-3 px-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${isDelete
                                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                                }`}
                        >
                            <Repeat size={16} />
                            Para todos os dias
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full mt-4 py-2 text-zinc-500 hover:text-white text-sm transition-colors"
                    >
                        Cancelar
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
