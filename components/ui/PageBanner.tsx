import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageBannerProps {
    title: string;
    subtitle: string;
    image?: string; // URL path to image
    gradientColor?: "blue" | "green" | "red" | "purple" | "emerald" | "orange" | "pink" | "indigo" | "yellow" | "zinc"; // Expanded colors
    imagePosition?: string; // CSS background-position
    icon?: LucideIcon; // Optional icon
}

export function PageBanner({
    title,
    subtitle,
    image,
    gradientColor = "blue",
    imagePosition = "center",
    icon: Icon
}: PageBannerProps) {

    const getGradientClass = (color: string) => {
        switch (color) {
            case 'blue': return "from-blue-900 to-transparent";
            case 'green':
            case 'emerald': return "from-emerald-900 to-transparent";
            case 'red': return "from-red-900 to-transparent";
            case 'purple': return "from-purple-900 to-transparent";
            case 'orange': return "from-orange-900 to-transparent";
            case 'pink': return "from-pink-900 to-transparent";
            case 'indigo': return "from-indigo-900 to-transparent";
            case 'yellow': return "from-yellow-900 to-transparent";
            default: return "from-zinc-900 to-transparent";
        }
    };

    const getAccentClass = (color: string) => {
        switch (color) {
            case 'blue': return "bg-blue-500 text-blue-500 shadow-blue-500/50";
            case 'green':
            case 'emerald': return "bg-emerald-500 text-emerald-500 shadow-emerald-500/50";
            case 'red': return "bg-red-500 text-red-500 shadow-red-500/50";
            case 'purple': return "bg-purple-500 text-purple-500 shadow-purple-500/50";
            case 'orange': return "bg-orange-500 text-orange-500 shadow-orange-500/50";
            case 'pink': return "bg-pink-500 text-pink-500 shadow-pink-500/50";
            case 'indigo': return "bg-indigo-500 text-indigo-500 shadow-indigo-500/50";
            case 'yellow': return "bg-yellow-500 text-yellow-500 shadow-yellow-500/50";
            default: return "bg-zinc-500 text-zinc-500 shadow-zinc-500/50";
        }
    };

    return (
        <div className="h-48 w-full bg-[#050505] relative shrink-0 overflow-hidden border-b border-white/5 group">
            {/* Background - Image or Fallback Gradient */}
            {/* Background - Gradient Only */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br transition-colors duration-500",
                getGradientClass(gradientColor)
            )} />

            {/* Cinematic Fade Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 p-6 md:p-8 z-10 w-full flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        {Icon && (
                            <div className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-white/80",
                                // Optional: Tint icon/bg with color if desired, keeping neutral for now
                            )}>
                                <Icon size={18} />
                            </div>
                        )}
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white drop-shadow-2xl">{title}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "h-1 w-12 rounded-full shadow-[0_0_10px_currentColor]",
                            getAccentClass(gradientColor).split(' ').slice(0, 2).join(' ') // just bg and text
                        )} />
                        <p className="text-zinc-300 text-sm font-medium drop-shadow-md">
                            {subtitle}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
