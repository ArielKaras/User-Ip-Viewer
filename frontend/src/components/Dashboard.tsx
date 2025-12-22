import React, { useState, useEffect } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { LogEntry } from '../types';
import { Shield, Activity, Cpu, HardDrive, Wifi, Terminal } from 'lucide-react';

const generateMockData = () => {
    return Array.from({ length: 20 }, (_, i) => ({
        time: i,
        value: 40 + Math.random() * 40,
        latency: 20 + Math.random() * 15
    }));
};

const MOCK_LOGS: LogEntry[] = [
    { timestamp: '10:42:01', level: 'info', msg: 'System initialized', status: 200, duration: 0, trace_id: 'init-001' },
    { timestamp: '10:42:05', level: 'info', msg: 'Uplink established [1Gbps]', status: 200, duration: 0.1, trace_id: 'net-023' },
    { timestamp: '10:42:12', level: 'warn', msg: 'Unusual packet signature detected', status: 429, duration: 0.05, trace_id: 'sec-882' },
    { timestamp: '10:42:15', level: 'info', msg: 'User session verified', status: 200, duration: 0.12, trace_id: 'auth-101' },
    { timestamp: '10:42:28', level: 'error', msg: 'Rate limit threshold approaching (85%)', status: 429, duration: 0.02, trace_id: 'api-999' },
    { timestamp: '10:42:30', level: 'info', msg: 'Garbage collection cycle completed', status: 200, duration: 1.2, trace_id: 'gc-404' },
];

export const Dashboard: React.FC = () => {
    const [data, setData] = useState(generateMockData());
    const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);

    // Simulate live data updates
    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => {
                const newPoint = {
                    time: prev[prev.length - 1].time + 1,
                    value: 40 + Math.random() * 40,
                    latency: 20 + Math.random() * 15
                };
                return [...prev.slice(1), newPoint];
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in p-2 md:p-0">

            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <Shield className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-widest uppercase">OpsGuard</h2>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            LIVE MONITORING
                        </div>
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">Session ID</div>
                    <div className="text-xs text-zinc-400 font-mono">OG-2025-ALPHA-9</div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'CPU LOAD', value: '42%', icon: <Cpu size={14} />, color: 'text-cyan-400' },
                    { label: 'MEMORY', value: '1.2GB', icon: <HardDrive size={14} />, color: 'text-purple-400' },
                    { label: 'LATENCY', value: '24ms', icon: <Activity size={14} />, color: 'text-emerald-400' },
                    { label: 'NETWORK', value: 'Up', icon: <Wifi size={14} />, color: 'text-cyan-400' }
                ].map((metric, i) => (
                    <div key={i} className="p-4 rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-2 opacity-60">
                            <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">{metric.label}</span>
                            <span className={metric.color}>{metric.icon}</span>
                        </div>
                        <div className="text-xl font-mono font-medium text-zinc-200">{metric.value}</div>
                    </div>
                ))}
            </div>

            {/* Main Traffic Chart */}
            <div className="mb-6 p-6 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-50">
                    <div className="text-[10px] text-zinc-600 font-mono uppercase text-right">Traffic Volume</div>
                </div>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '12px' }}
                                itemStyle={{ color: '#06b6d4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Log Console */}
            <div className="rounded-xl border border-white/5 bg-black/40 backdrop-blur-md overflow-hidden flex flex-col h-48">
                <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <Terminal size={12} />
                        System Events
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-2 h-2 rounded-full bg-amber-500/20 border border-amber-500/50" />
                        <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                </div>
                <div className="p-4 overflow-y-auto font-mono text-[10px] space-y-1.5 custom-scrollbar">
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-3 hover:bg-white/5 p-0.5 rounded px-2 transition-colors">
                            <span className="text-zinc-600 shrink-0">{log.timestamp}</span>
                            <span className={`shrink-0 w-12 font-bold ${log.level === 'error' ? 'text-red-500' :
                                    log.level === 'warn' ? 'text-amber-500' :
                                        'text-cyan-500'
                                }`}>{log.level.toUpperCase()}</span>
                            {/* Adapted to use msg instead of message to match LogEntry type if needed, 
                  but user provided code used 'message'. I adapted MOCK_LOGS above to match current LogEntry definition 
                  (msg, status, duration) OR I should update LogEntry type.
                  
                  DECISION: I updated MOCK_LOGS in this file to match the existing 'LogEntry' structure from 'observability.ts' 
                  (msg, status, duration, trace_id, level, timestamp) to avoid type errors.
              */}
                            <span className="text-zinc-500 shrink-0 w-8">{log.trace_id?.substring(0, 3) || 'SYS'}</span>
                            <span className="text-zinc-300">{log.msg}</span>
                        </div>
                    ))}
                    <div className="flex gap-2 items-center text-cyan-500/50 animate-pulse mt-2 px-2">
                        <span>_</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
