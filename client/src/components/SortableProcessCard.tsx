import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PM2Process } from '../types';
import { useConfirm } from '../utilities/ConfirmContext';

interface SortableCardProps {
    proc: PM2Process;
    isOnline: boolean;
    isCoreApp: boolean;
    service: any; // Mapped from portsInfo
    handleAction: (name: string, action: 'start' | 'restart' | 'stop') => void;
}

const SortableProcessCard: React.FC<SortableCardProps> = ({
    proc,
    isOnline,
    isCoreApp,
    service,
    handleAction
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: proc.name });

    const { askConfirmation } = useConfirm();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.6 : 1,
        scale: isDragging ? '1.02' : '1',
    };

    const handleActionWithConfirm = (action: 'start' | 'restart' | 'stop') => {
        const actionLabels = {
            start: { title: 'Start Process', variant: 'accent' as const },
            stop: { title: 'Stop Process', variant: 'danger' as const },
            restart: { title: 'Restart Process', variant: 'accent' as const },
        };

        askConfirmation({
            title: actionLabels[action].title,
            message: `Are you sure you want to ${action} "${proc.name}"?`,
            confirmText: action.toUpperCase(),
            variant: actionLabels[action].variant,
            onConfirm: () => handleAction(proc.name, action),
        });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`group relative bg-gh-inner border rounded-md p-4 transition-all cursor-grab active:cursor-grabbing ${isCoreApp
                ? 'border-gh-accent/50 ring-2 ring-gh-accent/20 shadow-[0_0_15px_rgba(56,139,253,0.1)]'
                : 'border-gh-border hover:border-gh-dim'
                } ${isDragging ? 'shadow-2xl ring-2 ring-gh-accent/50' : ''}`}
        >
            {/* Top Row: Status & Actions */}
            <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${isOnline ? 'bg-gh-success/10 text-gh-success' : 'bg-gh-danger/10 text-gh-danger'
                    }`}>
                    {proc.pm2_env.status}
                </span>

                <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                        onPointerDown={(e) => e.stopPropagation()} // Crucial: Prevents drag when clicking
                        onClick={(e) => {
                            e.stopPropagation();
                            handleActionWithConfirm('restart');
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded border border-gh-border bg-gh-card text-xs hover:border-gh-accent hover:text-gh-accent transition-colors cursor-pointer"
                        title="Restart"
                    >
                        ↻
                    </button>
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleActionWithConfirm(isOnline ? 'stop' : 'start');
                        }}
                        className={`w-7 h-7 flex items-center justify-center rounded border border-gh-border bg-gh-card text-xs transition-colors cursor-pointer ${isOnline ? 'hover:border-gh-danger hover:text-gh-danger' : 'hover:border-gh-success hover:text-gh-success'
                            }`}
                        title={isOnline ? "Stop" : "Start"}
                    >
                        {isOnline ? '🛑' : '▶️'}
                    </button>
                </div>
            </div>

            {/* Main Info Area */}
            <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                    {isOnline && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gh-success opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-gh-success shadow-[0_0_8px_#39d353]' : 'bg-gh-danger'}`}></span>
                </span>

                {service ? (
                    isOnline ?
                        <a
                            onPointerDown={(e) => e.stopPropagation()}
                            href={service.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold truncate text-gh-accent hover:underline flex items-center gap-1.5 cursor-pointer"
                        >
                            <span className="text-base">{service.icon}</span>
                            {proc.name}
                            <span className="text-[10px] opacity-40">↗</span>
                        </a>
                        :
                        <p
                            className="text-sm font-semibold truncate flex items-center gap-1.5 "
                        >
                            <span className="text-base">{service.icon}</span>
                            {proc.name}
                        </p>

                ) : (
                    <strong className={`text-sm font-semibold truncate ${isCoreApp ? 'text-gh-accent' : 'text-gh-text'}`}>
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

                {service && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${service.isOpen ? 'border-gh-success/30 text-gh-success' : 'border-gh-dim/30 text-gh-dim'
                        }`}>
                        :{service.port}
                    </span>
                )}
            </div>
        </div>
    );
};

export default SortableProcessCard;