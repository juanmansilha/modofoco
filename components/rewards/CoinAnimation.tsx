"use client";

import { motion } from "framer-motion";

interface CoinAnimationProps {
    points?: number;
}

export function CoinAnimation({ points = 0 }: CoinAnimationProps) {
    // Repeated text 3 times
    const text = "FOCO POINTS • FOCO POINTS • FOCO POINTS • ";

    // Shared face styles
    const Face = ({ isBack = false }: { isBack?: boolean }) => (
        <div
            className="absolute inset-0 rounded-full backface-hidden flex items-center justify-center overflow-hidden border-[6px] border-slate-300/80 bg-slate-200 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]"
            style={{
                backfaceVisibility: "hidden",
                transform: isBack ? "rotateY(180deg)" : "none"
            }}
        >
            {/* Animated Inner Gradient (The "degrade suave") */}
            {/* Enhanced colors for better visibility */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-indigo-200 via-slate-100 to-indigo-300 opacity-90"
                animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{ backgroundSize: "200% 200%" }}
            />

            {/* Shine Overlay for Metallic feel */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/80 to-transparent"
                animate={{
                    x: ["-100%", "100%"]
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                    ease: "linear"
                }}
                style={{ opacity: 0.3 }}
            />

            {/* Circular Text (SVG) */}
            <div className="absolute inset-0 animate-spin-slow">
                <svg viewBox="0 0 100 100" className="w-full h-full p-1.5">
                    <path
                        id={isBack ? "curve_back" : "curve_front"}
                        d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                        fill="transparent"
                    />
                    <text className="text-[8.5px] font-black fill-slate-600/90 uppercase tracking-[0.2em]">
                        <textPath href={`#${isBack ? "curve_back" : "curve_front"}`} startOffset="0%">
                            {text}
                        </textPath>
                    </text>
                </svg>
            </div>

            {/* Center Text */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                {isBack ? (
                    <>
                        <span className="text-xs font-bold text-slate-500 tracking-wider">SALDO</span>
                        <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-600 to-slate-900 drop-shadow-sm">
                            {(points || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-500/80">POINTS</span>
                    </>
                ) : (
                    <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-600 to-slate-900 drop-shadow-md">
                        FP
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <div className="relative w-48 h-48 md:w-60 md:h-60 flex items-center justify-center perspective-[1000px]">
            {/* Glow Behind */}
            <div className="absolute inset-0 bg-indigo-500/20 blur-[50px] rounded-full animate-pulse" />

            {/* Rotating 3D Object */}
            <motion.div
                className="relative w-full h-full preserve-3d"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: 360 }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                {/* FRONT FACE */}
                <div style={{ transform: "translateZ(1px)" }} className="absolute inset-0 w-full h-full preserve-3d z-20">
                    <Face />
                </div>

                {/* THICKNESS Layer 1 */}
                <div
                    className="absolute inset-0 rounded-full bg-slate-300 z-10"
                    style={{
                        transform: "translateZ(0px)",
                    }}
                />
                {/* THICKNESS Layer 2 */}
                <div
                    className="absolute inset-0 rounded-full bg-slate-400 z-10"
                    style={{
                        transform: "translateZ(-1px)",
                    }}
                />
                {/* THICKNESS Layer 3 */}
                <div
                    className="absolute inset-0 rounded-full bg-slate-500 z-10"
                    style={{
                        transform: "translateZ(-2px)",
                    }}
                />
                {/* THICKNESS Layer 4 */}
                <div
                    className="absolute inset-0 rounded-full bg-slate-600 z-10"
                    style={{
                        transform: "translateZ(-3px)",
                    }}
                />
                {/* THICKNESS Layer 5 */}
                <div
                    className="absolute inset-0 rounded-full bg-slate-700 z-10"
                    style={{
                        transform: "translateZ(-4px)",
                    }}
                />

                {/* BACK FACE */}
                <div style={{ transform: "translateZ(-5px)" }} className="absolute inset-0 w-full h-full preserve-3d z-20">
                    <Face isBack />
                </div>
            </motion.div>
        </div>
    );
}
