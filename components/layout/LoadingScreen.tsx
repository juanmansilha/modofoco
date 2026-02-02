"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-50 bg-[#050505] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative h-16 w-64"
            >
                <Image
                    src="/icon.png"
                    alt="ModoFoco"
                    fill
                    className="object-contain"
                    priority
                />
            </motion.div>

            <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
        </div>
    );
}
