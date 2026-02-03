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
    onAddPoint: (point: LatLng) => void;
    readOnly?: boolean;
}

function LocationMarker() {
    const [position, setPosition] = useState<LatLng | null>(null);
    const map = useMapEvents({
        locationfound(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        map.locate();
    }, [map]);

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

export default function RunMap({ points, onAddPoint, readOnly = false }: RunMapProps) {
    const defaultCenter = { lat: -23.55052, lng: -46.633309 }; // Sao Paulo fallback

    return (
        <MapContainer
            center={points.length > 0 ? points[0] : defaultCenter}
            zoom={13}
            style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {points.length === 0 && !readOnly && <LocationMarker />}

            <MapEvents onAddPoint={onAddPoint} readOnly={readOnly} />

            {/* Start Marker */}
            {points.length > 0 && (
                <Marker position={points[0]} icon={new L.Icon({
                    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
                    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })} />
            )}

            {/* End Marker */}
            {points.length > 1 && (
                <Marker position={points[points.length - 1]} icon={new L.Icon({
                    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })} />
            )}

            {/* Route Polyline */}
            {points.length > 1 && (
                <Polyline positions={points} color="#f97316" weight={5} />
            )}
        </MapContainer>
    );
}
