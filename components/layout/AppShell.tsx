"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav"; // Import
import { cn } from "@/lib/utils";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { GamificationProvider } from "@/contexts/GamificationContext";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { LoadingScreen } from "./LoadingScreen";

export function AppShell({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu State
    const pathname = usePathname();
    const router = useRouter();
    const { userData, isAuthLoading } = useGlobalData();
    // More robust check dealing with potential null pathname or trailing slashes
    // Treat /admin routes as "public" regarding user-auth (handled by admin layout)
    const isPublicOrAdmin = pathname?.startsWith("/login") || pathname === "/onboarding" || pathname?.startsWith("/admin");

    // Redirect to login if not authenticated (Skip for admin)
    useEffect(() => {
        if (!isAuthLoading && !isPublicOrAdmin && !userData.email) {
            router.push("/login");
        }
    }, [userData.email, isPublicOrAdmin, router, isAuthLoading]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Show loading screen while checking auth
    if (isAuthLoading && !isPublicOrAdmin) {
        return <LoadingScreen />;
    }

    // Don't render protected content if not authenticated
    if (!isPublicOrAdmin && !userData.email) {
        return <LoadingScreen />;
    }

    const content = isPublicOrAdmin ? (
        <main className="min-h-screen bg-[#050505]">{children}</main>
    ) : (
        <div className="flex h-screen overflow-hidden bg-[#050505]">
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <div className="hidden md:block">
                <Sidebar
                    isCollapsed={isCollapsed}
                    toggleSidebar={() => setIsCollapsed(!isCollapsed)}
                />
            </div>

            {/* Mobile Sidebar (Overlay) */}
            <div className={cn(
                "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden transition-opacity duration-300",
                isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )} onClick={() => setIsMobileMenuOpen(false)}>
                <div
                    className={cn(
                        "absolute left-0 top-0 h-full w-64 bg-black border-r border-white/10 shadow-2xl transition-transform duration-300",
                        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Sidebar
                        isCollapsed={false}
                        isMobile={true} // Add this prop to Sidebar to hide the toggle button?
                        toggleSidebar={() => setIsMobileMenuOpen(false)}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out h-full",
                isCollapsed ? "md:ml-20" : "md:ml-64", // Only apply margin on desktop
                "ml-0" // Full width on mobile
            )}>
                <TopBar />
                <main className="flex-1 overflow-y-auto custom-scrollbar relative pb-20 md:pb-0">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <BottomNav openMobileMenu={() => setIsMobileMenuOpen(true)} />
        </div>
    );

    return (
        <>
            {content}
        </>
    );
}
