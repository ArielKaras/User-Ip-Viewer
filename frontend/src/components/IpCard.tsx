import React from 'react';
import { IpData } from '../types';
import { InfoRow } from './InfoRow';
import { StatusBadge } from './StatusBadge';
import { MapComponent } from './MapComponent';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

interface IpCardProps {
    data: IpData | null;
    loading: boolean;
    error: string | null;
    env: 'DEV' | 'PROD';
}

export const IpCard: React.FC<IpCardProps> = ({ data, loading, error, env }) => {
    if (loading) {
        return (
            <div className="w-full max-w-md bg-surface-primary backdrop-blur-xl border border-border rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] shadow-2xl animate-fade-in">
                <Loader2 className="w-8 h-8 text-text-secondary animate-spin mb-4" />
                <p className="text-text-secondary text-sm font-medium animate-pulse">Triangulating signal...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-md bg-status-error-bg backdrop-blur-xl border border-status-error-border rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl animate-fade-in">
                <AlertCircle className="w-10 h-10 text-status-error-text mb-3" />
                <h3 className="text-status-error-text font-semibold mb-1">Connection Lost</h3>
                <p className="text-status-error-text opacity-70 text-sm">{error}</p>
            </div>
        );
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

                {/* Map / Visualization */}
                <div className="h-48 bg-background relative border-b border-border flex items-center justify-center overflow-hidden">
                    <MapComponent lat={data.latitude} lng={data.longitude} />
                </div>

                {/* Details List */}
                <div className="p-6 space-y-1">
                    <InfoRow label="Location" value={`${data.city}, ${data.country}`} delay="100ms" />
                    <InfoRow label="ISP" value={data.connection.isp} delay="200ms" />
                    <InfoRow label="Timezone" value={data.timezone.id} delay="300ms" />
                    <InfoRow label="ASN" value={`AS${data.connection.asn} ${data.connection.org}`} delay="400ms" />
                </div>

            </div>
        </div>
    );
};
