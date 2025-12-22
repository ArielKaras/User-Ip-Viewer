import React, { useEffect, useState } from 'react';
import { IpCard } from './components/IpCard';
import { Dashboard } from './components/Dashboard';
import { fetchIpData, getEnvironmentMetadata } from './services/ipService';
import { IpData, BuildMetadata } from './types';
import { GitCommit, Activity, Lock, Unlock } from 'lucide-react';

export default function App() {
    const [data, setData] = useState<IpData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [meta, setMeta] = useState<BuildMetadata>({
        env: 'PROD',
        commitSha: '---',
        timestamp: '---'
    });
    const [view, setView] = useState<'PUBLIC' | 'OPSGUARD'>('PUBLIC');

    useEffect(() => {
        // Determine environment and "mock" build data for this demo
        const env = getEnvironmentMetadata();
        const mockSha = "7f3a92b";
        const now = new Date();

        setMeta({
            env,
            commitSha: mockSha,
            timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        const loadData = async () => {
            try {
                const ipData = await fetchIpData();
                await new Promise(resolve => setTimeout(resolve, 800));
                setData(ipData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-zinc-950">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-zinc-900 to-transparent opacity-40 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

            <main className="w-full relative z-10 flex flex-col items-center gap-8 max-w-5xl">

                {/* Header / Brand (Minimal) */}
                <div className={`text-center space-y-2 mb-4 animate-fade-in transition-all duration-500 ${view === 'OPSGUARD' ? 'opacity-50 scale-90' : 'opacity-100'}`}>
                    <div
                        className="inline-flex items-center justify-center p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 shadow-sm mb-4 cursor-pointer hover:border-zinc-700 transition-colors"
                        onClick={() => setView(view === 'PUBLIC' ? 'OPSGUARD' : 'PUBLIC')}
                    >
                        <Activity className={`w-6 h-6 ${view === 'OPSGUARD' ? 'text-cyan-400' : 'text-zinc-100'}`} />
                    </div>
                    <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">System Identity</h1>
                    <p className="text-sm text-zinc-500">Internal diagnostics & network telemetry</p>
                </div>

                {/* View Switcher */}
                {view === 'PUBLIC' ? (
                    <IpCard
                        data={data}
                        loading={loading}
                        error={error}
                        env={meta.env}
                    />
                ) : (
                    <Dashboard />
                )}

                {/* Technical Footer */}
                <footer className="mt-12 text-center animate-fade-in [animation-delay:200ms] opacity-0" style={{ animationFillMode: 'forwards' }}>
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-6 text-[10px] md:text-xs text-zinc-600 font-mono tracking-wide uppercase">
                            <div className="flex items-center gap-1.5 hover:text-zinc-400 transition-colors cursor-default">
                                <GitCommit size={12} />
                                <span>SHA {meta.commitSha}</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-zinc-800" />
                            <button
                                onClick={() => setView(view === 'PUBLIC' ? 'OPSGUARD' : 'PUBLIC')}
                                className="flex items-center gap-1.5 hover:text-cyan-500 transition-colors cursor-pointer group"
                            >
                                {view === 'PUBLIC' ? <Lock size={10} /> : <Unlock size={10} />}
                                <span className="group-hover:underline decoration-zinc-800 underline-offset-4">
                                    {view === 'PUBLIC' ? 'RESTRICTED ACCESS' : 'OPSGUARD ACTIVE'}
                                </span>
                            </button>
                        </div>
                    </div>
                </footer>

            </main>
        </div>
    );
}
