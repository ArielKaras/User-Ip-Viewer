import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Visit } from './HistoryList';

// Fix for default marker icon missing in Vite builds
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Clean up default icon issues
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
    lat: number;
    lng: number;
    history?: Visit[];
}

// Helper to center/fit map when props change
const RecenterAutomatically = ({ lat, lng, history }: { lat: number, lng: number, history?: Visit[] }) => {
    const map = useMap();

    useEffect(() => {
        if (history && history.length > 0) {
            // Collect all valid points including current
            const points: [number, number][] = [];

            // Add current point
            points.push([lat, lng]);

            // Add history points
            history.forEach(h => {
                if (h.latitude && h.longitude) {
                    points.push([h.latitude, h.longitude]);
                }
            });

            // If we have distinct points, fit bounds
            if (points.length > 1) {
                const bounds = L.latLngBounds(points);
                map.fitBounds(bounds, { padding: [50, 50] });
                return;
            }
        }

        // Fallback to simple view
        map.setView([lat, lng], 13);
    }, [lat, lng, history, map]);

    return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({ lat, lng, history }) => {
    // Extract path coordinates
    const pathPositions: [number, number][] = history
        ?.filter(h => h.latitude && h.longitude)
        .map(h => [h.latitude!, h.longitude!] as [number, number]) || [];

    // Ensure current position is part of the path visual if needed, 
    // but usually history contains it if data is synced. 
    // If not, we could prepend/append [lat, lng].

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={[lat, lng]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                className="bg-zinc-950" // Fallback background
            >
                {/* Dark Mode Map Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <Marker position={[lat, lng]}>
                    <Popup className="font-sans text-xs">
                        <span className="font-bold text-zinc-900">Current</span><br />
                        {lat.toFixed(4)}, {lng.toFixed(4)}
                    </Popup>
                </Marker>

                {/* History Path */}
                {pathPositions.length > 0 && (
                    <Polyline
                        positions={pathPositions}
                        pathOptions={{ color: '#f59e0b', weight: 3, opacity: 0.6, dashArray: '5, 10' }}
                    />
                )}

                {/* Markers for history points (optional, maybe too cluttered? Let's just do line for now) */}

                <RecenterAutomatically lat={lat} lng={lng} history={history} />
            </MapContainer>
        </div>
    );
};
