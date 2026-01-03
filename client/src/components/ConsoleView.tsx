import React, { useRef, useEffect } from 'react';
import SectionWrap from './SectionWrap';

interface Props {
    lastOut: string;
}

const ConsoleView: React.FC<Props> = ({ lastOut }) => {
    const consoleRef = useRef<HTMLPreElement>(null);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(lastOut);
        // Optional: Add a temporary toast or change icon to checkmark here
    };

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [lastOut]);

    return (
        <SectionWrap
            // md:col-span-2 ensures it takes up 2/3 of the bottom grid area
            className="md:col-span-2 sticky bottom-0 z-10"
            header={
                <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2 text-gh-text uppercase tracking-wider text-xs font-bold">
                        Console Output
                    </span>
                    <button
                        onClick={copyToClipboard}
                        className="p-1.5 rounded-md border border-gh-border text-gh-dim hover:text-gh-text hover:border-gh-accent hover:bg-gh-bg transition-colors"
                        title="Copy Output"
                    >
                        <span className="text-sm">📋</span>
                    </button>
                </div>
            }
        >
            <pre
                ref={consoleRef}
                className="bg-black rounded-md p-4 h-48 overflow-y-auto font-mono text-xs text-green-400 custom-scrollbar scroll-smooth"
            >
                <code>{lastOut || "> System idle. Awaiting command..."}</code>
            </pre>
        </SectionWrap>
    );
};

export default ConsoleView;