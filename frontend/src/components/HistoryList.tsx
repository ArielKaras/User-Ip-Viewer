import React, { useMemo } from 'react';
import { Clock, MapPin, ArrowRightLeft, Move } from 'lucide-react';

export interface Visit {
    id: number;
    ip: string;
    city: string;
    country: string;
    timestamp: string;
    latitude?: number;
    longitude?: number;
}

interface HistoryListProps {
    visits: Visit[];
    onClear?: () => void;
}

// Haversine formula to calculate distance in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1)); // Return rounded to 1 decimal
};

export const HistoryList: React.FC<HistoryListProps> = ({ visits, onClear }) => {
    if (visits.length === 0) return null;

    return (
        <div className="w-full max-w-md mt-8 animate-fade-in [animation-delay:200ms]">
            <div className="flex items-center justify-between gap-2 mb-4 px-2">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-text-secondary" />
                    <h3 className="text-xs font-mono uppercase tracking-widest text-text-secondary">Recent Signals</h3>
                </div>
                {onClear && (
                    <button
                        onClick={onClear}
                        className="text-[10px] text-text-secondary hover:text-status-error-text transition-colors uppercase tracking-wider font-mono opacity-60 hover:opacity-100"
                    >
                        Clear History
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {visits.map((visit, index) => {
                    // Compare with the *previous* visit (which is index + 1 in a descending list)
                    const previousVisit = visits[index + 1];
                    let movementBadge = null;

                    if (previousVisit && visit.latitude && visit.longitude && previousVisit.latitude && previousVisit.longitude) {
                        const distance = calculateDistance(visit.latitude, visit.longitude, previousVisit.latitude, previousVisit.longitude);

                        if (distance > 1) { // Only show if moved > 1km
                            movementBadge = (
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-status-warning-text bg-status-warning-bg px-1.5 py-0.5 rounded border border-status-warning-border w-fit font-mono">
                                    <Move className="w-3 h-3" />
                                    <span>Moved {distance}km</span>
                                </div>
                            );
                        } else if (visit.ip !== previousVisit.ip) {
                            movementBadge = (
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-text-secondary bg-surface-primary px-1.5 py-0.5 rounded border border-border-subtle w-fit font-mono">
                                    <ArrowRightLeft className="w-3 h-3" />
                                    <span>IP Change</span>
                                </div>
                            );
                        }
                    }

                    return (
                        <div key={visit.id} className="group flex items-start justify-between p-4 rounded-xl bg-surface-secondary border border-border-subtle hover:border-border hover:bg-surface-primary transition-all duration-300">
                            <div className="flex flex-col gap-1">
                                <span className="font-mono text-sm text-text-primary tracking-tight">{visit.ip}</span>
                                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                    <MapPin className="w-3 h-3" />
                                    <span>{visit.city}, {visit.country}</span>
                                </div>
                                {movementBadge}
                            </div>
                            <span className="text-[10px] font-mono text-text-secondary opacity-60 mt-1">
                                {new Date(visit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
