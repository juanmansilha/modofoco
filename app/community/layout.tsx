import { RoomSidebar } from "@/components/community/RoomSidebar";

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex w-full h-full">
            <div className="flex-1 min-w-0 h-full flex flex-col">
                {/* Banner Area */}
                <div className="h-48 w-full bg-[#0A0A0A] relative shrink-0 overflow-hidden border-b border-white/5 group">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-80"
                        style={{
                            backgroundImage: "url('/banner.png')",
                            backgroundPosition: "center 20%" // Focus on faces
                        }}
                    />

                    {/* Gradient Overlay - Cinematic Fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-6 z-10 w-full">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-2 drop-shadow-2xl">The Club</h1>
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-12 bg-red-600 rounded-full shadow-[0_0_10px_red]" />
                            <p className="text-zinc-300 text-sm font-medium drop-shadow-md">
                                A primeira regra: você não fala sobre o Clube.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-h-0">
                    {children}
                </div>
            </div>
            <RoomSidebar />
        </div>
    );
}
