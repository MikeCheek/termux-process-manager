import React, { useEffect, useRef, useState, useCallback } from 'react';
import ConsoleView from './ConsoleView';
import NetworkView from './NetworkView';
import type { DashboardData } from '../types';

interface DashboardFooterProps {
    lastMessage: string;
    portsInfo: DashboardData["ports_info"];
}

const DashboardFooter: React.FC<DashboardFooterProps> = ({ lastMessage, portsInfo }) => {
    const footerRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);

    // Default height if nothing is saved
    const DEFAULT_HEIGHT = 280;

    // 1. Initialize Height from LocalStorage
    useEffect(() => {
        const savedHeight = localStorage.getItem('dashboard-footer-height');
        if (savedHeight && footerRef.current) {
            footerRef.current.style.height = `${savedHeight}px`;
        } else if (footerRef.current) {
            footerRef.current.style.height = `${DEFAULT_HEIGHT}px`;
        }
    }, []);

    // 2. Mouse Move Logic
    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
        if (footerRef.current) {
            const finalHeight = footerRef.current.offsetHeight;
            localStorage.setItem('dashboard-footer-height', finalHeight.toString());
        }
    }, []);

    const resize = useCallback((e: MouseEvent) => {
        if (isResizing && footerRef.current) {
            // Calculate height: Window height minus current Y mouse position
            const newHeight = window.innerHeight - e.clientY;

            // Constrain height between 150px and 85% of viewport
            if (newHeight > 150 && newHeight < window.innerHeight * 0.85) {
                footerRef.current.style.height = `${newHeight}px`;
            }
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    return (
        <footer
            ref={footerRef}
            className={`sticky bottom-0 z-30 bg-gh-bg/95 backdrop-blur-md border-t border-gh-border flex flex-col transition-shadow ${isResizing ? 'shadow-[0_-10px_30px_rgba(0,0,0,0.5)] ring-1 ring-gh-accent/30' : ''
                }`}
        >
            {/* INVISIBLE DRAG HANDLE (The Top Border) */}
            <div
                onMouseDown={startResizing}
                className={`absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-50 transition-colors ${isResizing ? 'bg-gh-accent' : 'hover:bg-gh-accent/50'
                    }`}
                title="Drag to resize console"
            />

            {/* Content Container - Uses h-full and flex-1 to force children to fill space */}
            <div className="flex-1 flex flex-col min-h-0 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">

                    {/* Console Section */}
                    <div className="md:col-span-2 flex flex-col min-h-0 h-full">
                        <header className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gh-accent animate-pulse" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-gh-dim">Live Logs</span>
                            </div>
                            <span className="text-[9px] font-mono text-gh-dim/50">STDOUT/STDERR</span>
                        </header>

                        {/* The Actual Child Adaptation: flex-1 + overflow-auto */}
                        <div className="flex-1 min-h-0 bg-black/40 rounded-lg border border-gh-border/50 overflow-hidden">
                            <ConsoleView lastOut={lastMessage} />
                        </div>
                    </div>

                    {/* Network Section */}
                    <div className="flex flex-col min-h-0 h-full">
                        <header className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-gh-dim">Traffic</span>
                        </header>

                        <div className="flex-1 min-h-0 bg-black/40 rounded-lg border border-gh-border/50 overflow-hidden">
                            <NetworkView portsInfo={portsInfo} />
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Status Bar */}
            <div className="h-6 px-4 border-t border-gh-border/30 flex items-center justify-between bg-gh-inner/50">
                <div className="text-[9px] text-gh-dim font-mono">
                    PANEL_HEIGHT: {footerRef.current?.offsetHeight || DEFAULT_HEIGHT}px
                </div>
                <div className="flex gap-3 text-[9px] text-gh-dim font-mono">
                    <span>READY</span>
                    <span className="text-gh-success">● SOCKET_ACTIVE</span>
                </div>
            </div>
        </footer>
    );
};

export default DashboardFooter;