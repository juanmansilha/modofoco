import { cn } from "@/lib/utils";
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "bg-card border border-card-border rounded-xl p-6 shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
