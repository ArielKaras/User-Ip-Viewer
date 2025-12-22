import React from 'react';
import { IpData } from '../types';
import { InfoRow } from './InfoRow';
import { StatusBadge } from './StatusBadge';
import { Globe, MapPin, Network, Clock, ShieldCheck, ExternalLink, Crosshair } from 'lucide-react';

interface IpCardProps {
    data: IpData | null;
    loading: boolean;
    error: string | null;
    env: 'DEV' | 'PROD';
    history?: any[]; // Keep prop for compatibility, though seemingly unused in this layout
}

export const IpCard: React.FC<IpCardProps> = ({ data, loading, error, env }) => {
    const openMap = () => {
        if (data) {
            // Opens Google Maps with a query for the specific coordinates
            window.open(`https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-md mx-auto p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md animate-pulse">
                <div className="flex justify-between items-center mb-8">
                    <div className="h-4 w-12 bg-zinc-800 rounded"></div>
                    <div className="h-6 w-16 bg-zinc-800 rounded-full"></div>
                </div>
                <div className="space-y-6">
                    <div className="h-10 w-3/4 bg-zinc-800 rounded mx-auto"></div>
                    <div className="space-y-3 pt-4">
                        <div className="h-4 w-full bg-zinc-800 rounded"></div>
                        <div className="h-4 w-full bg-zinc-800 rounded"></div>
                        <div className="h-4 w-full bg-zinc-800 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-md mx-auto p-8 rounded-2xl border border-red-900/30 bg-red-950/10 backdrop-blur-md text-center">
                <div className="flex justify-center mb-4 text-red-500">
                    <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="text-red-400 font-medium mb-2">Signal Lost</h3>
                <p className="text-zinc-500 text-sm font-mono">{error}</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="w-full max-w-md mx-auto rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-slide-up transition-all duration-500 hover:border-white/10 group">
            {/* Header / Status */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-zinc-900/20">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                    System Online
                </span>
                <StatusBadge status={env} />
            </div>

            {/* Main IP Display */}
            <div className="px-6 py-10 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <h2 className="text-[10px] text-zinc-500 font-semibold mb-3 uppercase tracking-widest">Public Endpoint Identifier</h2>
                <div className="font-mono text-4xl md:text-5xl font-bold text-white tracking-tight select-all drop-shadow-lg">
                    {data.ip}
                </div>

                <div className="mt-6 flex justify-center">
                    <button
                        onClick={openMap}
                        className="group/btn flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 active:scale-95"
                    >
                        <Crosshair className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-cyan-400 transition-colors" />
                        <span className="text-xs font-medium text-zinc-300 group-hover/btn:text-white">Locate Signal</span>
                        <ExternalLink className="w-3 h-3 text-zinc-600 group-hover/btn:text-cyan-500/50 ml-1" />
                    </button>
                </div>
            </div>

            {/* Details Grid */}
            <div className="px-6 py-4 bg-zinc-950/30 border-t border-white/5">
                <div className="space-y-px">
                    <InfoRow
                        label="COORDINATES"
                        value={`${data.latitude?.toFixed(4) ?? '0.0000'}, ${data.longitude?.toFixed(4) ?? '0.0000'}`}
                        icon={<MapPin size={12} />}
                        isMono
                    />
                    <InfoRow
                        label="REGION"
                        value={`${data.region} (${data.region_code})`}
                        icon={<Globe size={12} />}
                    />
                    <InfoRow
                        label="ISP LINK"
                        value={data.connection?.isp || 'Unknown'}
                        icon={<Network size={12} />}
                    />
                    <InfoRow
                        label="LOCAL TIME"
                        value={data.timezone?.current_time || '--:--'}
                        icon={<Clock size={12} />}
                        isMono
                    />
                </div>
            </div>
        </div>
    );
};
