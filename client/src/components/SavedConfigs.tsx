import React, { useMemo } from 'react';
import type { CommandConfig } from '../types';
import type { Socket } from 'socket.io-client';

interface Props {
    commands: Record<string, CommandConfig>;
    searchQuery: string;
    socket: Socket | null; // Add your socket instance here
}

const SavedConfigs: React.FC<Props> = ({ commands, searchQuery, socket }) => {
    const filteredCids = useMemo(() => {
        return Object.keys(commands).filter((cid) => {
            const { name, cmd, desc } = commands[cid];
            const query = searchQuery.toLowerCase();
            return (
                name.toLowerCase().includes(query) ||
                cmd.toLowerCase().includes(query) ||
                desc.toLowerCase().includes(query)
            );
        });
    }, [commands, searchQuery]);

    // const handleActionOld = async (cid: string, action: 'run' | 'delete') => {
    //     const endpoint = `/api/${action}/${cid}`;
    //     try {
    //         const response = await fetch(endpoint, { method: 'POST' });
    //         if (response.ok) {
    //             window.location.reload();
    //         }
    //     } catch (err) {
    //         console.error(`Failed to ${action}:`, err);
    //     }
    // };

    const handleAction = async (cid: string, action: 'run' | 'delete') => {
        if (!socket) {
            console.error("No socket available")
            return
        }
        if (action === 'run') {
            // LIVE STREAMING ACTION
            // Trigger the socket event we created in NestJS TerminalGateway
            socket.emit('run-live', { cid });

            // Do NOT reload the page! 
            // The output will start appearing in your ConsoleView automatically.
        } else {
            // STANDARD API ACTION (Delete)
            const endpoint = `/api/${action}/${cid}`;
            try {
                const response = await fetch(endpoint, { method: 'POST' });
                if (response.ok) {
                    window.location.reload(); // Reload is fine for deletion
                }
            } catch (err) {
                console.error(`Failed to delete:`, err);
            }
        }
    };

    return (
        <div
            className={`flex flex-col transition-opacity duration-300 ${searchQuery && filteredCids.length === 0 ? 'opacity-30' : 'opacity-100'
                }`}
        >
            {filteredCids.map((cid) => (
                <div
                    key={cid}
                    className="flex justify-between items-start py-4 border-b border-gh-border last:border-0 group"
                >
                    {/* Left: Info */}
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-gh-accent font-semibold text-sm hover:underline cursor-pointer">
                            {commands[cid].name}
                        </span>
                        {commands[cid].desc && (
                            <p className="text-gh-dim text-xs leading-relaxed truncate">
                                {commands[cid].desc}
                            </p>
                        )}
                        <code className="mt-1 text-[11px] font-mono text-gh-text bg-gh-inner/50 px-2 py-0.5 rounded border border-gh-border/50 self-start">
                            {commands[cid].cmd}
                        </code>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col items-end gap-2 ml-4">
                        <button
                            onClick={() => handleAction(cid, 'run')}
                            className="bg-gh-success/10 text-gh-success border border-gh-success/20 hover:bg-gh-success hover:text-white px-3 py-1 rounded text-xs font-bold transition-all active:scale-95"
                        >
                            Run Live
                        </button>
                        <button
                            onClick={() => handleAction(cid, 'delete')}
                            className="text-gh-dim hover:text-gh-danger text-[10px] uppercase font-bold tracking-wider transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}

            {filteredCids.length === 0 && (
                <div className="py-8 text-center text-gh-dim text-sm italic">
                    No configurations found matching "{searchQuery}"
                </div>
            )}
        </div>
    );
};

export default SavedConfigs;