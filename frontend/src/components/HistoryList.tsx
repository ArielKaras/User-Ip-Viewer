import React from 'react';
import { Clock, MapPin } from 'lucide-react';

export interface Visit {
    id: number;
    ip: string;
    city: string;
    country: string;
    timestamp: string;
}

interface HistoryListProps {
    visits: Visit[];
}

export const HistoryList: React.FC<HistoryListProps> = ({ visits }) => {
    if (visits.length === 0) return null;

    return (
        <div className="w-full max-w-md mt-8 animate-fade-in [animation-delay:200ms]">
            <div className="flex items-center gap-2 mb-4 px-2">
                <Clock className="w-4 h-4 text-text-secondary" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-text-secondary">Recent Signals</h3>
            </div>

            <div className="space-y-3">
                {visits.map((visit) => (
                    <div key={visit.id} className="group flex items-center justify-between p-4 rounded-xl bg-surface-secondary border border-border-subtle hover:border-border hover:bg-surface-primary transition-all duration-300">
                        <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-sm text-text-primary tracking-tight">{visit.ip}</span>
                            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                <MapPin className="w-3 h-3" />
                                <span>{visit.city}, {visit.country}</span>
                            </div>
                        </div>
                        <span className="text-[10px] font-mono text-text-secondary opacity-60">
                            {new Date(visit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
