import React from 'react';

interface StatusBadgeProps {
    status: 'DEV' | 'PROD';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const isProd = status === 'PROD';

    return (
        <div className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border
      ${isProd
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            }
    `}>
            <div className={`w-1.5 h-1.5 rounded-full ${isProd ? 'bg-cyan-400' : 'bg-purple-400'} animate-pulse shadow-[0_0_8px_currentColor]`} />
            {status}
        </div>
    );
};
