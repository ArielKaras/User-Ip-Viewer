import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MetricPoint } from '../../types/observability';

interface TrafficChartProps {
    data: MetricPoint[];
}

export const TrafficChart: React.FC<TrafficChartProps> = ({ data }) => {
    return (
        <div className="w-full h-72 bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                    Traffic Throughput
                </h3>
                <span className="text-[10px] font-mono text-cyan-500/50 uppercase">Live Metrics</span>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="time"
                        stroke="#52525b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        fontFamily="JetBrains Mono"
                    />
                    <YAxis
                        stroke="#52525b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        fontFamily="JetBrains Mono"
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#e4e4e7', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="requests"
                        stroke="#06b6d4"
                        fillOpacity={1}
                        fill="url(#colorRequests)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
