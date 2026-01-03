import React, { useRef, useEffect, useState } from 'react';
import SectionWrap from './SectionWrap';
import Convert from 'ansi-to-html';

const convert = new Convert();

interface Props {
    lastOut: string; // This should be the latest chunk from the backend
}

const ConsoleView: React.FC<Props> = ({ lastOut }) => {
    const consoleRef = useRef<HTMLPreElement>(null);
    // 1. Maintain a history of logs instead of just the last message
    const [logHistory, setLogHistory] = useState<string>("");

    // 2. Append new data as it arrives
    useEffect(() => {
        if (lastOut) {
            // Convert newlines from terminal to HTML breaks
            const formatted = lastOut.replace(/\n/g, '<br />');
            const html = convert.toHtml(formatted);
            setLogHistory(prev => prev + html);

            setLogHistory((prev) => prev + formatted);
        }
    }, [lastOut]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [logHistory]);

    const copyToClipboard = () => {
        // Strip HTML tags when copying to clipboard for clean text
        const plainText = logHistory.replace(/<[^>]*>/g, '');
        navigator.clipboard.writeText(plainText || "");
    };

    const clearConsole = () => setLogHistory("");

    return (
        <SectionWrap
            className="md:col-span-2 sticky bottom-0 z-10"
            header={
                <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2 text-gh-text uppercase tracking-wider text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live Console Output
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={clearConsole}
                            className="text-[10px] text-gh-dim hover:text-red-400 transition-colors mr-2"
                        >
                            CLEAR
                        </button>
                        <button
                            onClick={copyToClipboard}
                            className="p-1.5 rounded-md border border-gh-border text-gh-dim hover:text-gh-text hover:border-gh-accent hover:bg-gh-bg transition-colors"
                            title="Copy Output"
                        >
                            <span className="text-sm">📋</span>
                        </button>
                    </div>
                </div>
            }
        >
            <pre
                ref={consoleRef}
                className="bg-black rounded-md p-4 h-64 overflow-y-auto font-mono text-xs text-green-400 custom-scrollbar scroll-smooth border border-gh-border"
            >
                {/* 3. Use dangerouslySetInnerHTML to render the streamed HTML breaks */}
                <code
                    dangerouslySetInnerHTML={{
                        __html: logHistory || "> System idle. Awaiting command..."
                    }}
                />
            </pre>
        </SectionWrap>
    );
};

export default ConsoleView;