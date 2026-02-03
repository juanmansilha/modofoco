"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LatLng {
    lat: number;
    lng: number;
}

interface RunMapProps {
    points: LatLng[];
    actualPath?: LatLng[];
    onAddPoint: (point: LatLng) => void;
    readOnly?: boolean;
    userLocation?: LatLng | undefined;
}

function LocationMarker({ userLocation }: { userLocation?: LatLng | undefined }) {
    const [position, setPosition] = useState<LatLng | null>(null);
    const map = useMapEvents({
        locationfound(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        if (userLocation) {
            setPosition(userLocation);
            map.flyTo(userLocation, map.getZoom());
        } else {
            map.locate();
        }
    }, [map, userLocation]);

    return position === null ? null : (
        <Marker position={position} icon={DefaultIcon}>
        </Marker>
    );
}

function MapEvents({ onAddPoint, readOnly }: { onAddPoint: (p: LatLng) => void, readOnly: boolean }) {
    useMapEvents({
        click(e) {
            if (!readOnly) {
                onAddPoint(e.latlng);
            }
        },
    });
    return null;
}

export default function RunMap({ points, actualPath = [], onAddPoint, readOnly = false, userLocation }: RunMapProps) {
    const defaultCenter = { lat: -23.55052, lng: -46.633309 }; // Sao Paulo fallback

    // Start point is either the first planned point or the start of the actual run
    const startPoint = points.length > 0 ? points[0] : (actualPath.length > 0 ? actualPath[0] : null);

    // End point is only relevant for planned routes or finished runs
    const endPoint = points.length > 1 ? points[points.length - 1] : (actualPath.length > 1 && readOnly ? actualPath[actualPath.length - 1] : null);

    return (
        <MapContainer
            center={startPoint || defaultCenter}
            zoom={13}
            style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                crossOrigin="anonymous"
            />

            <LocationMarker userLocation={userLocation} />

            <MapEvents onAddPoint={onAddPoint} readOnly={readOnly} />

            {/* Start Marker */}
            {startPoint && (
                <Marker position={startPoint} icon={new L.Icon({
                    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
                    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })} />
            )}

            {/* End Marker */}
            {endPoint && (
                <Marker position={endPoint} icon={new L.Icon({
                    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })} />
            )}

            {/* Planned Route (Dashed Gray) */}
            {points.length > 1 && (
                <Polyline positions={points} pathOptions={{ color: 'gray', dashArray: '10, 10', opacity: 0.6 }} />
            )}

            {/* Actual Run Path (Solid Orange) */}
            {actualPath.length > 1 && (
                <Polyline positions={actualPath} pathOptions={{ color: '#f97316', weight: 5, opacity: 1 }} />
            )}
        </MapContainer>
    );
}
