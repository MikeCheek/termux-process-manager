import React, { useMemo } from 'react';
import type { DashboardData, PM2Process } from '../types';
import type { Socket } from 'socket.io-client';

interface Props {
    processes: PM2Process[];
    searchQuery: string;
    socket: Socket | null;
    portsInfo: DashboardData["ports_info"]
}

const PM2Section: React.FC<Props> = ({ processes, portsInfo, searchQuery, socket }) => {

    if (!portsInfo || !processes) {
        return <div className="p-4 text-gh-dim">Loading process data...</div>;
    }

    const filtered = useMemo(() =>
        processes.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
        [processes, searchQuery]
    );

    const handlePM2Action = (name: string, action: 'start' | 'restart' | 'stop') => {
        if (!socket) return;
        socket.emit('pm2-live', { name, action });
    };

    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${searchQuery && filtered.length === 0 ? 'opacity-30' : 'opacity-100'
            }`}>
            {filtered.map((proc) => {
                const isOnline = proc.pm2_env.status === 'online';

                // 1. Find the matching service info from the backend array
                // We match by name. (If your backend sends a pm2Name field, use that instead)
                const service = portsInfo
                    .filter(info => info.pm2Name != null)
                    .find(info =>
                        info.pm2Name.toLowerCase().includes(proc.name.toLowerCase()) ||
                        proc.name.toLowerCase().includes(info.pm2Name.toLowerCase())
                    );

                return (
                    <div
                        key={proc.name}
                        className="group relative bg-gh-inner border border-gh-border rounded-md p-4 transition-all hover:border-gh-dim"
                    >
                        {/* Top Row: Status & Actions */}
                        <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${isOnline ? 'bg-gh-success/10 text-gh-success' : 'bg-gh-danger/10 text-gh-danger'
                                }`}>
                                {proc.pm2_env.status}
                            </span>

                            <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handlePM2Action(proc.name, 'restart')}
                                    className="w-7 h-7 flex items-center justify-center rounded border border-gh-border bg-gh-card text-xs hover:border-gh-accent hover:text-gh-accent transition-colors"
                                    title="Restart"
                                >
                                    ↻
                                </button>
                                <button
                                    onClick={() => handlePM2Action(proc.name, isOnline ? 'stop' : 'restart')}
                                    className={`w-7 h-7 flex items-center justify-center rounded border border-gh-border bg-gh-card text-xs transition-colors ${isOnline ? 'hover:border-gh-danger hover:text-gh-danger' : 'hover:border-gh-success hover:text-gh-success'
                                        }`}
                                    title={isOnline ? "Stop" : "Start"}
                                >
                                    {isOnline ? '🛑' : '▶️'}
                                </button>
                            </div>
                        </div>

                        {/* Main Info Area */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`relative flex h-2 w-2`}>
                                {isOnline && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gh-success opacity-75"></span>
                                )}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-gh-success shadow-[0_0_8px_#39d353]' : 'bg-gh-danger'}`}></span>
                            </span>

                            {/* 2. Implement the Dynamic Link */}
                            {service ? (
                                <a
                                    href={service.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-semibold truncate text-gh-accent hover:underline flex items-center gap-1.5"
                                >
                                    <span className="text-base">{service.icon}</span>
                                    {proc.name}
                                    <span className="text-[10px] opacity-40">↗</span>
                                </a>
                            ) : (
                                <strong className="text-sm font-semibold truncate text-gh-text">
                                    {proc.name}
                                </strong>
                            )}
                        </div>

                        {/* Stats & Port Info */}
                        <div className="flex justify-between items-center mt-2">
                            <div className="flex gap-3 font-mono text-[11px] text-gh-dim">
                                <span>CPU <b className="text-gh-text">{proc.monit.cpu}%</b></span>
                                <span>MEM <b className="text-gh-text">{(proc.monit.memory / 1024 / 1024).toFixed(1)}MB</b></span>
                            </div>

                            {/* 3. Show Port badge if service is mapped */}
                            {service && (
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${service.isOpen ? 'border-gh-success/30 text-gh-success' : 'border-gh-dim/30 text-gh-dim'
                                    }`}>
                                    :{service.port}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PM2Section;