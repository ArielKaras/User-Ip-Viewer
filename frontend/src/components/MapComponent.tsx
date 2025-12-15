import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
}

// Helper to center map when props change
const RecenterAutomatically = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({ lat, lng }) => {
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
                        <span className="font-bold text-zinc-900">Endpoint</span><br />
                        {lat.toFixed(4)}, {lng.toFixed(4)}
                    </Popup>
                </Marker>

                <RecenterAutomatically lat={lat} lng={lng} />
            </MapContainer>
        </div>
    );
};
