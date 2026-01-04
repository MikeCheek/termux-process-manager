import React, { useMemo, useState, useEffect } from 'react';
import type { DashboardData, PM2Process } from '../types';
import type { Socket } from 'socket.io-client';

// DND Kit Imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable';

import SortableProcessCard from './SortableProcessCard';

interface Props {
    processes: PM2Process[];
    searchQuery: string;
    socket: Socket | null;
    portsInfo: DashboardData["ports_info"]
}

const PM2Section: React.FC<Props> = ({ processes, portsInfo, searchQuery, socket }) => {
    // 1. Initialize Order from LocalStorage
    const [order, setOrder] = useState<string[]>(() => {
        const saved = localStorage.getItem('pm2-process-order');
        return saved ? JSON.parse(saved) : [];
    });

    // 2. Configure Sensors (Distance constraint allows clicking buttons without accidental drag)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // 3. Sync local order state with incoming process list
    useEffect(() => {
        if (processes.length > 0) {
            const processNames = processes.map(p => p.name);

            setOrder(prevOrder => {
                // Remove names that no longer exist in PM2
                const validOrder = prevOrder.filter(name => processNames.includes(name));

                // Add new names that aren't in our order yet
                const newNames = processNames.filter(name => !validOrder.includes(name));

                // If it's the very first run, apply your custom sorting logic
                if (prevOrder.length === 0) {
                    const sortedInitial = [...processNames].sort((a, b) => {
                        const getPriority = (n: string) =>
                            (n.includes('cmd-hub-client') || n.includes('cmd-hub-server')) ? 100 : 0;
                        return getPriority(b) - getPriority(a);
                    });
                    localStorage.setItem('pm2-process-order', JSON.stringify(sortedInitial));
                    return sortedInitial;
                }

                const finalOrder = [...validOrder, ...newNames];
                localStorage.setItem('pm2-process-order', JSON.stringify(finalOrder));
                return finalOrder;
            });
        }
    }, [processes]);

    // 4. Compute display list based on Order + Search Query
    const displayProcesses = useMemo(() => {
        const filtered = processes.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return [...filtered].sort((a, b) => {
            const indexA = order.indexOf(a.name);
            const indexB = order.indexOf(b.name);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });
    }, [processes, searchQuery, order]);

    // 5. Handle Drag End
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setOrder((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                localStorage.setItem('pm2-process-order', JSON.stringify(newOrder));
                return newOrder;
            });
        }
    };

    const handlePM2Action = (name: string, action: 'start' | 'restart' | 'stop') => {
        if (!socket) return;
        const confirmed = window.confirm(`Are you sure you want to ${action} "${name}"?`);
        if (confirmed) {
            socket.emit('pm2-live', { name, action });
        }
    };

    if (!portsInfo || !processes || processes.length === 0) {
        return <div className="p-4 text-gh-dim animate-pulse">Waiting for process data...</div>;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={order}
                strategy={rectSortingStrategy}
            >
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-300 ${searchQuery && displayProcesses.length === 0 ? 'opacity-30' : 'opacity-100'
                    }`}>
                    {displayProcesses.map((proc) => {
                        const isOnline = proc.pm2_env.status === 'online';
                        const isCoreApp = proc.name.toLowerCase().includes('cmd-hub-client') ||
                            proc.name.toLowerCase().includes('cmd-hub-server');

                        const service = portsInfo
                            .filter(info => info.pm2Name != null)
                            .find(info =>
                                info.pm2Name.toLowerCase().includes(proc.name.toLowerCase()) ||
                                proc.name.toLowerCase().includes(info.pm2Name.toLowerCase())
                            );

                        return (
                            <SortableProcessCard
                                key={proc.name}
                                proc={proc}
                                isOnline={isOnline}
                                isCoreApp={isCoreApp}
                                service={service}
                                handleAction={handlePM2Action}
                            />
                        );
                    })}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default PM2Section;