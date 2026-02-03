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
    showMarkers?: boolean;
}

export function RunPathVisualizer({
    points,
    strokeColor = "#f97316", // orange-500
    strokeWidth = 3,
    className = "",
    showMarkers = true
}: RunPathVisualizerProps) {

    // Calculate the path data and viewBox
    const { pathData, viewBox, startPoint, endPoint } = useMemo(() => {
        if (!points || points.length < 2) {
            return { pathData: "", viewBox: "0 0 100 100", startPoint: null, endPoint: null };
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

        const width = (maxLng - minLng);
        const height = (maxLat - minLat);

        const scale = 100 / Math.max(width, height);

        const project = (lat: number, lng: number) => {
            const x = (lng - minLng) * scale;
            const y = (maxLat - lat) * scale;
            return { x, y };
        };

        const drawnWidth = width * scale;
        const drawnHeight = height * scale;
        const offsetX = (100 - drawnWidth) / 2;
        const offsetY = (100 - drawnHeight) / 2;

        let d = "";
        let start = null;
        let end = null;

        points.forEach((p, i) => {
            const { x, y } = project(p.lat, p.lng);
            const finalX = x + offsetX;
            const finalY = y + offsetY;

            if (i === 0) {
                d += `M ${finalX.toFixed(2)} ${finalY.toFixed(2)}`;
                start = { x: finalX, y: finalY };
            } else {
                d += ` L ${finalX.toFixed(2)} ${finalY.toFixed(2)}`;
                if (i === points.length - 1) {
                    end = { x: finalX, y: finalY };
                }
            }
        });

        return { pathData: d, viewBox: "0 0 100 100", startPoint: start, endPoint: end };

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
                vectorEffect="non-scaling-stroke"
            />

            {showMarkers && startPoint && (
                <circle
                    cx={startPoint.x}
                    cy={startPoint.y}
                    r={2}
                    fill="#22c55e" // green-500
                    stroke="#000"
                    strokeWidth={0.5}
                />
            )}

            {showMarkers && endPoint && (
                <circle
                    cx={endPoint.x}
                    cy={endPoint.y}
                    r={2}
                    fill="#ef4444" // red-500
                    stroke="#000"
                    strokeWidth={0.5}
                />
            )}
        </svg>
    );
}
