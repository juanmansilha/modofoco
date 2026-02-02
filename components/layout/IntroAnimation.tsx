"use client";

import { useState, useEffect } from "react";
import { LoadingScreen } from "./LoadingScreen";

export function IntroAnimation({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simple loading delay
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return <>{children}</>;
}
}
