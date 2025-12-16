import React, { useEffect, useState } from 'react';
import { IpCard } from './components/IpCard';
import { HistoryList, Visit } from './components/HistoryList';
import { fetchIpData, getEnvironmentMetadata, fetchBuildMetadata, trackVisit, fetchHistory } from './services/ipService';
import { IpData, BuildMetadata } from './types';
import { GitCommit, Activity } from 'lucide-react';

export default function App() {
    const [data, setData] = useState<IpData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<Visit[]>([]);
    const [meta, setMeta] = useState<BuildMetadata>({
        env: 'PROD',
        commitSha: '---',
        timestamp: '---'
    });

    useEffect(() => {
        // 1. Determine Environment (Local vs Prod)
        const env = getEnvironmentMetadata();

        // 2. Fetch Real Build Metadata from Backend
        fetchBuildMetadata().then(backendMeta => {
            setMeta(prev => ({
                ...prev,
                env,
                commitSha: backendMeta.commitSha || 'unknown',
                timestamp: backendMeta.timestamp ? new Date(backendMeta.timestamp).toLocaleString() : 'unknown'
            }));
        });

        // 3. Fetch IP Data & History
        const loadData = async () => {
            try {
                // Artificial delay for smooth animation demonstration (800ms)
                await new Promise(resolve => setTimeout(resolve, 800));

                // Fetch Current IP
                const ipData = await fetchIpData();
                setData(ipData);

                // Track & Update History
                if (ipData) {
                    await trackVisit(ipData);
                    const historyData = await fetchHistory();
                    setHistory(historyData);
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background text-text-primary font-sans selection:bg-brand-primary/20 selection:text-brand-primary">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-zinc-900 to-transparent opacity-40 pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <main className="w-full relative z-10 flex flex-col items-center gap-8 pb-12">

                {/* Header / Brand (Minimal) */}
                <div className="text-center space-y-2 mb-4 animate-fade-in">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-surface-secondary border border-border-subtle shadow-sm mb-4">
                        <Activity className="w-6 h-6 text-text-primary" />
                    </div>
                    <h1 className="text-xl font-semibold text-text-primary tracking-tight">System Identity</h1>
                    <p className="text-sm text-text-secondary">Internal diagnostics & network telemetry</p>
                </div>

                {/* Core Card */}
                <IpCard
                    data={data}
                    loading={loading}
                    error={error}
                    env={meta.env}
                    history={history}
                />

                {/* History List (New Feature) */}
                {!loading && !error && history.length > 0 && (
                    <HistoryList visits={history} />
                )}

                {/* Technical Footer */}
                <footer className="mt-12 text-center animate-fade-in [animation-delay:500ms] opacity-0" style={{ animationFillMode: 'forwards' }}>
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-6 text-[10px] md:text-xs text-text-secondary font-mono tracking-wide uppercase">
                            <div className="flex items-center gap-1.5 hover:text-text-primary transition-colors cursor-default">
                                <GitCommit size={12} />
                                <span>SHA {meta.commitSha.substring(0, 7)}</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-border" />
                            <div className="hover:text-text-primary transition-colors cursor-default">
                                BUILT {meta.timestamp}
                            </div>
                        </div>
                        <p className="text-[10px] text-text-secondary max-w-[200px] leading-relaxed">
                            Restricted access. Use with caution.
                        </p>
                    </div>
                </footer>

            </main>
        </div>
    );
}
