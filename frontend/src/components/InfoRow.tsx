import React, { ReactNode } from 'react';

interface InfoRowProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
    isMono?: boolean;
    delay?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon, isMono = false, delay = '0ms' }) => (
    <div
        className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 -mx-2 rounded transition-colors group"
        style={{ animationDelay: delay }}
    >
        <div className="flex items-center gap-2">
            {icon && <span className="text-zinc-600 group-hover:text-cyan-500/70 transition-colors">{icon}</span>}
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{label}</span>
        </div>
        <span className={`text-sm text-zinc-300 ${isMono ? 'font-mono' : 'font-sans'} text-right truncate max-w-[200px]`} title={String(value)}>
            {value}
        </span>
    </div>
);
