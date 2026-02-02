import { cn } from "@/lib/utils";

interface HealthBannerProps {
    title: string;
    subtitle: string;
    image?: string; // URL path to image
    gradientColor?: string; // Optional accent color for gradient
    imagePosition?: string; // CSS background-position
}

export function HealthBanner({ title, subtitle, image, gradientColor = "blue", imagePosition = "center" }: HealthBannerProps) {
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
            case 'blue': return "bg-blue-600 text-blue-600";
            case 'green':
            case 'emerald': return "bg-emerald-600 text-emerald-600";
            case 'red': return "bg-red-600 text-red-600";
            case 'purple': return "bg-purple-600 text-purple-600";
            case 'orange': return "bg-orange-600 text-orange-600";
            case 'pink': return "bg-pink-600 text-pink-600";
            case 'indigo': return "bg-indigo-600 text-indigo-600";
            case 'yellow': return "bg-yellow-600 text-yellow-600";
            default: return "bg-zinc-600 text-zinc-600";
        }
    };

    return (
        <div className="h-48 w-full bg-[#0A0A0A] relative shrink-0 overflow-hidden border-b border-white/5 group">
            {/* Background - Image or Fallback Gradient */}
            {/* Background - Gradient Only */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-40 transition-colors duration-500", // Increased opacity slightly for visibility without image
                getGradientClass(gradientColor)
            )} />

            {/* Cinematic Fade Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

            <div className="absolute bottom-0 left-0 p-6 z-10 w-full">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-2 drop-shadow-2xl">{title}</h1>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "h-1 w-12 rounded-full shadow-[0_0_10px_currentColor]",
                        getAccentClass(gradientColor)
                    )} />
                    <p className="text-zinc-300 text-sm font-medium drop-shadow-md">
                        {subtitle}
                    </p>
                </div>
            </div>
        </div>
    );
}
