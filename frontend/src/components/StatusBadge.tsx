import React from 'react';

interface StatusBadgeProps {
    env: 'DEV' | 'PROD';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ env }) => {
    const isProd = env === 'PROD';

    return (
        <div className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border
      ${isProd
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }
    `}>
            <div className={`w-1.5 h-1.5 rounded-full ${isProd ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
            {env}
        </div>
    );
};
