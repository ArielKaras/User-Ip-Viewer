import React from 'react';
import { IpData } from '../types';
import { InfoRow } from './InfoRow';
import { StatusBadge } from './StatusBadge';
import { MapPin, Globe, Network, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

interface IpCardProps {
    data: IpData | null;
    loading: boolean;
    error: string | null;
    env: 'DEV' | 'PROD';
}

export const IpCard: React.FC<IpCardProps> = ({ data, loading, error, env }) => {
    if (loading) {
        return (
            <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] shadow-2xl">
                <Loader2 className="w-8 h-8 text-zinc-500 animate-spin mb-4" />
                <p className="text-zinc-500 text-sm font-medium animate-pulse">Triangulating signal...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-md bg-red-950/20 backdrop-blur-xl border border-red-900/30 rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl">
                <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                <h3 className="text-red-400 font-semibold mb-1">Connection Lost</h3>
                <p className="text-red-500/70 text-sm">{error}</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="w-full max-w-md relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-1000"></div>

            <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">

                {/* Card Header */}
                <div className="p-6 border-b border-zinc-800 flex justify-between items-start">
                    <div className="space-y-1">
                        <h2 className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Public Identity</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-white tracking-tight">{data.ip}</span>
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                    <StatusBadge env={env} />
                </div>

                {/* Map / Visualization Placeholder */}
                <div className="h-32 bg-zinc-950/50 relative border-b border-zinc-800 p-4 flex items-center justify-center overflow-hidden">
                    {/* 
               In a real app, this would be a Mapbox/Leaflet container. 
               For now, we use a static map logic or just a nice visual placeholder.
            */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `radial-gradient(circle at 50% 50%, #6366f1 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                    }}></div>
                    <div className="flex flex-col items-center z-10">
                        <Globe className="w-10 h-10 text-indigo-500/80 mb-2" />
                        <span className="text-xs text-zinc-600 font-mono">{data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}</span>
                    </div>
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
