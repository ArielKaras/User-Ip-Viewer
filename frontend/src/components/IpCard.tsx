import React from 'react';
import { IpData } from '../types';
import { InfoRow } from './InfoRow';
import { StatusBadge } from './StatusBadge';
import { MapComponent } from './MapComponent';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

import { Visit } from './HistoryList';

interface IpCardProps {
    data: IpData | null;
    loading: boolean;
    error: string | null;
    env: 'DEV' | 'PROD';
    history?: Visit[];
}

export const IpCard: React.FC<IpCardProps> = ({ data, loading, error, env, history }) => {
    if (loading) {
        // ... existing loading block ...
    }

    if (error) {
        // ... existing error block ...
    }

    if (!data) return null;

    return (
        <div className="w-full max-w-md relative group animate-slide-up">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-1000"></div>

            <div className="relative bg-surface-primary backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl">

                {/* Card Header */}
                <div className="p-6 border-b border-border flex justify-between items-start">
                    <div className="space-y-1">
                        <h2 className="text-xs text-text-secondary font-mono uppercase tracking-widest">Public Identity</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-text-primary tracking-tight font-mono">{data.ip}</span>
                            <ShieldCheck className="w-5 h-5 text-status-success-text" />
                        </div>
                    </div>
                    <StatusBadge env={env} />
                </div>

                {/* Map / Visualization (Only if lat/lon available) */}
                {data.lat && data.lon && (
                    <div className="h-48 bg-background relative border-b border-border flex items-center justify-center overflow-hidden">
                        <MapComponent lat={data.lat} lng={data.lon} history={history} />
                    </div>
                )}

                {/* Details List */}
                <div className="p-6 space-y-1">
                    <InfoRow label="Location" value={[data.city, data.country].filter(Boolean).join(', ') || 'Unknown'} delay="100ms" />

                    {/* Optional fields if available, otherwise placeholders or hidden */}
                    <InfoRow label="Region" value={data.region || '-'} delay="200ms" />
                    <InfoRow label="Source" value={data.source} delay="300ms" />

                    {/* Placeholder for ISP/Timezone if we decide to add them back later */}
                    {data.isp && <InfoRow label="ISP" value={data.isp} delay="400ms" />}
                </div>

            </div>
        </div>
    );
};
