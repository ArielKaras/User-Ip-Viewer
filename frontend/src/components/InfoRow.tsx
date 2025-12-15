import React from 'react';

interface InfoRowProps {
    label: string;
    value: string;
    delay?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value, delay = '0ms' }) => (
    <div
        className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-0 animate-fade-in opacity-0"
        style={{ animationDelay: delay, animationFillMode: 'forwards' }}
    >
        <span className="text-sm text-zinc-500 font-medium">{label}</span>
        <span className="text-sm text-zinc-300 font-mono text-right truncate max-w-[200px]" title={value}>
            {value}
        </span>
    </div>
);
