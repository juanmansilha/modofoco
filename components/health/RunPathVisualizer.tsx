"use client";

import { useMemo } from "react";

interface LatLng {
    lat: number;
    lng: number;
}

interface RunPathVisualizerProps {
    points: LatLng[];
    strokeColor?: string;
    strokeWidth?: number;
    className?: string;
}

export function RunPathVisualizer({
    points,
    strokeColor = "#f97316", // orange-500
    strokeWidth = 3,
    className = ""
}: RunPathVisualizerProps) {

    // Calculate the path data and viewBox
    const { pathData, viewBox } = useMemo(() => {
        if (!points || points.length < 2) {
            return { pathData: "", viewBox: "0 0 100 100" };
        }

        let minLat = Infinity, maxLat = -Infinity;
        let minLng = Infinity, maxLng = -Infinity;

        points.forEach(p => {
            if (p.lat < minLat) minLat = p.lat;
            if (p.lat > maxLat) maxLat = p.lat;
            if (p.lng < minLng) minLng = p.lng;
            if (p.lng > maxLng) maxLng = p.lng;
        });

        // Add padding (5%)
        const latRange = maxLat - minLat || 0.001;
        const lngRange = maxLng - minLng || 0.001;
        const paddingLat = latRange * 0.1;
        const paddingLng = lngRange * 0.1;

        minLat -= paddingLat;
        maxLat += paddingLat;
        minLng -= paddingLng;
        maxLng += paddingLng;

        // Aspect Ratio Preservation logic
        // We want to map these geo-coords to a 100x100 (or aspect correct) SVG space
        // BUT, lat/lng aren't perfectly square. For visual approximation on small scale, it's fine.
        // Let's normalize everything to 0..100 range based on the largest dimension to preserve shape.

        const width = (maxLng - minLng);
        const height = (maxLat - minLat);

        // We will project to a 100x100 viewport, but center the shape
        // Map lng -> x, lat -> y (inverted because SVG y goes down, Lat goes up)

        const scale = 100 / Math.max(width, height);

        const project = (lat: number, lng: number) => {
            const x = (lng - minLng) * scale;
            // Invert Y: maxLat should be 0 (top), minLat should be 100 (bottom)
            // actually:  (maxLat - lat) * scale
            const y = (maxLat - lat) * scale;
            return { x, y };
        };

        // Center it if aspect ratio is not 1:1
        const drawnWidth = width * scale;
        const drawnHeight = height * scale;
        const offsetX = (100 - drawnWidth) / 2;
        const offsetY = (100 - drawnHeight) / 2;

        let d = "";
        points.forEach((p, i) => {
            const { x, y } = project(p.lat, p.lng);
            // Add offsets
            const finalX = x + offsetX;
            const finalY = y + offsetY;

            if (i === 0) {
                d += `M ${finalX.toFixed(2)} ${finalY.toFixed(2)}`;
            } else {
                d += ` L ${finalX.toFixed(2)} ${finalY.toFixed(2)}`;
            }
        });

        return { pathData: d, viewBox: "0 0 100 100" };

    }, [points]);

    if (!points || points.length === 0) {
        return (
            <div className={`flex items-center justify-center text-zinc-600 ${className}`}>
                <span className="text-xs">Sem traçado</span>
            </div>
        );
    }

    return (
        <svg
            viewBox={viewBox}
            className={`${className}`}
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Optional drop shadow filter */}
            <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* The Path */}
            <path
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                vectorEffect="non-scaling-stroke" // Keeps stroke constant width regardless of scale
            />

            {/* Start Dot */}
            {points.length > 0 && (() => {
                // Re-calculate start point projection (duplicate logic, but cheap)
                // Or we could parse logic. Let's simplfy: We usually don't need markers for "Art" style
                // But user might want them. Let's keep it clean "Strava style" (just the line) for now.
                return null;
            })()}

        </svg>
    );
}
