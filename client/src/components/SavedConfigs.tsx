import React, { useMemo } from 'react';
import type { CommandConfig } from '../types';
import type { Socket } from 'socket.io-client';
import { useConfirm } from '../utilities/ConfirmContext';

interface Props {
    commands: Record<string, CommandConfig>;
    searchQuery: string;
    socket: Socket | null;
    refreshData: () => void;
}

const SavedConfigs: React.FC<Props> = ({ commands, searchQuery, socket, refreshData }) => {
    const { askConfirmation } = useConfirm(); // 2. Initialize the hook

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

    const handleAction = async (cid: string, action: 'run' | 'delete') => {
        if (!socket) {
            console.error("No socket available");
            return;
        }

        if (action === 'run') {
            socket.emit('run-live', { cid });
        } else {
            const endpoint = `/api/${action}/${cid}`;
            try {
                const response = await fetch(endpoint, { method: 'POST' });
                if (response.ok) {
                    refreshData();
                }
            } catch (err) {
                console.error(`Failed to delete:`, err);
            }
        }
    };

    // 3. Wrapper for the Delete Confirmation
    const confirmDelete = (cid: string) => {
        const commandName = commands[cid]?.name || cid;

        askConfirmation({
            title: "Delete Configuration",
            message: `Are you sure you want to delete "${commandName}"? This action is permanent and cannot be undone.`,
            confirmText: "Delete Command",
            variant: "danger",
            onConfirm: () => handleAction(cid, 'delete'),
        });
    };

    const confirmRun = (cid: string) => {
        askConfirmation({
            title: "Execute Command",
            message: `Are you sure you want to run: "${commands[cid].cmd}"?`,
            confirmText: "Run Now",
            variant: "accent", // Blue/Purple theme for execution
            onConfirm: () => handleAction(cid, 'run'),
        });
    };

    return (
        <div
            className={`flex flex-col transition-opacity duration-300 ${searchQuery && filteredCids.length === 0 ? 'opacity-30' : 'opacity-100'
                }`}
        >
            {filteredCids.map((cid) => (
                <div
                    key={cid}
                    className="flex items-center justify-between py-2 px-3 border-b border-gh-border last:border-0 group hover:bg-gh-inner/30 transition-colors"
                >
                    {/* Left Side: Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-gh-accent font-semibold text-sm whitespace-nowrap">
                            {commands[cid].name}
                        </span>

                        <code className="hidden sm:block truncate text-[10px] font-mono text-gh-dim bg-gh-inner/50 px-2 py-0.5 rounded border border-gh-border/30 max-w-[300px]">
                            {commands[cid].cmd}
                        </code>

                        {commands[cid].desc && (
                            <span className="hidden md:block text-gh-dim text-xs truncate italic">
                                — {commands[cid].desc}
                            </span>
                        )}
                    </div>

                    {/* Right Side: Actions */}
                    <div className="flex items-center gap-3 ml-4">
                        <button
                            onClick={() => confirmDelete(cid)}
                            className="opacity-0 group-hover:opacity-100 text-gh-dim hover:text-gh-danger text-[10px] uppercase font-bold tracking-wider transition-all"
                        >
                            Delete
                        </button>

                        <button
                            onClick={() => confirmRun(cid)}
                            className="bg-gh-success/10 text-gh-success border border-gh-success/20 hover:bg-gh-success hover:text-white px-4 py-1 rounded-full text-[11px] font-bold transition-all active:scale-95"
                        >
                            Run
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