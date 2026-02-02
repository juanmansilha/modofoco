

export default function HealthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex w-full h-full">
            <div className="flex-1 min-w-0 h-full flex flex-col bg-[#050505] overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>
    );
}
