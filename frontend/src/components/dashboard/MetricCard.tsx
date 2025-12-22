import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    unit?: string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'brand' | 'error' | 'success';
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, icon: Icon, color = 'brand' }) => {
    const colorClasses = {
        brand: 'text-cyan-400 bg-cyan-500/5 border-cyan-500/20 shadow-[0_0_15px_-5px_rgba(6,182,212,0.1)]',
        error: 'text-red-400 bg-red-500/5 border-red-500/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.1)]',
        success: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.1)]',
    };

    return (
        <div className={`p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:bg-white/5 ${colorClasses[color]} group`}>
            <div className="flex items-start justify-between mb-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{title}</p>
                <div className={`p-2 rounded-lg bg-white/5 group-hover:scale-110 transition-transform ${color === 'brand' ? 'text-cyan-400' : color === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                    <Icon size={16} />
                </div>
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold font-mono tracking-tight text-white">{value}</span>
                {unit && <span className="text-xs font-mono text-zinc-500">{unit}</span>}
            </div>
        </div>
    );
};
