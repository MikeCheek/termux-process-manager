import React, { useMemo } from 'react';
import type { PM2Process } from '../types';

interface Props {
    processes: PM2Process[];
    searchQuery: string;
}

const PM2Section: React.FC<Props> = ({ processes, searchQuery }) => {
    const filtered = useMemo(() =>
        processes.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
        [processes, searchQuery]
    );

    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${searchQuery && filtered.length === 0 ? 'opacity-30' : 'opacity-100'
            }`}>
            {filtered.map((proc) => {
                const isOnline = proc.pm2_env.status === 'online';

                return (
                    <div
                        key={proc.name}
                        className="group relative bg-gh-inner border border-gh-border rounded-md p-4 transition-all hover:border-gh-dim"
                    >
                        {/* Top Row: Status Pill & Action Buttons */}
                        <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${isOnline ? 'bg-gh-success/10 text-gh-success' : 'bg-gh-danger/10 text-gh-danger'
                                }`}>
                                {proc.pm2_env.status}
                            </span>

                            <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button className="w-7 h-7 flex items-center justify-center rounded border border-gh-border bg-gh-card text-xs hover:border-gh-accent hover:text-gh-accent transition-colors" title="Restart">
                                    ↻
                                </button>
                                <button className="w-7 h-7 flex items-center justify-center rounded border border-gh-border bg-gh-card text-xs hover:border-gh-danger hover:text-gh-danger transition-colors" title="Stop">
                                    🛑
                                </button>
                            </div>
                        </div>

                        {/* Main Info */}
                        <div className="flex items-center gap-2 mb-2">
                            {/* Status Indicator Dot with Pulse */}
                            <span className={`relative flex h-2 w-2`}>
                                {isOnline && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gh-success opacity-75"></span>
                                )}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-gh-success shadow-[0_0_8px_#39d353]' : 'bg-gh-danger'}`}></span>
                            </span>
                            <strong className="text-sm font-semibold truncate text-gh-text">{proc.name}</strong>
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-4 font-mono text-[11px] text-gh-dim">
                            <span>CPU <b className="text-gh-text ml-1">{proc.monit.cpu}%</b></span>
                            <span>MEM <b className="text-gh-text ml-1">{(proc.monit.memory / 1024 / 1024).toFixed(1)}MB</b></span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PM2Section;