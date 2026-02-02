"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function IntroAnimation({ children }: { children: React.ReactNode }) {
    const [showIntro, setShowIntro] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");

        if (!hasSeenIntro) {
            setShowIntro(true);
            const timer = setTimeout(() => {
                setShowIntro(false);
                sessionStorage.setItem("hasSeenIntro", "true");
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <>
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, filter: "blur(10px)" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] text-white"
                    >
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="text-2xl md:text-5xl font-bold tracking-tighter"
                        >
                            Foco. Disciplina. Resultado.
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showIntro ? 0 : 1 }}
                transition={{ duration: 1 }}
            >
                {children}
            </motion.div>
        </>
    );
}
