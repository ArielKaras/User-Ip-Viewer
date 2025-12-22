import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../../types/observability';
import { Terminal, AlignLeft } from 'lucide-react';

interface LogConsoleProps {
    logs: LogEntry[];
}

export const LogConsole: React.FC<LogConsoleProps> = ({ logs }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="w-full h-72 md:h-[400px] bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden flex flex-col font-mono text-xs shadow-2xl relative">
            <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400">
                    <Terminal size={14} className="text-cyan-500/70" />
                    <span className="uppercase tracking-wider text-[10px] font-bold">Telemetry Stream</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-zinc-700/50" />
                    <div className="w-2 h-2 rounded-full bg-zinc-700/50" />
                    <div className="w-2 h-2 rounded-full bg-cyan-500/50 animate-pulse" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {logs.length === 0 && (
                    <div className="text-zinc-700 italic text-center mt-20 flex flex-col items-center gap-2">
                        <Terminal size={32} className="opacity-20" />
                        <span>Awaiting Signal...</span>
                    </div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors group">
                        <span className="text-zinc-600 shrink-0 select-none w-16 text-right">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, second: '2-digit', fractionalSecondDigits: 3 })}
                        </span>

                        <span className={`shrink-0 w-12 font-bold ${log.level === 'error' ? 'text-red-500' :
                                log.level === 'warn' ? 'text-amber-400' :
                                    'text-cyan-500'
                            }`}>
                            {log.level.toUpperCase().slice(0, 4)}
                        </span>

                        <span className="text-zinc-300 break-all group-hover:text-white transition-colors flex-1">
                            {log.msg}
                            {log.trace_id && <span className="text-zinc-700 ml-2 select-all">#{log.trace_id.substring(0, 8)}</span>}
                        </span>

                        {log.duration && (
                            <span className="text-zinc-600 ml-auto shrink-0 pl-4">
                                {log.duration.toFixed(3)}s
                            </span>
                        )}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
