import React from 'react';
import SectionWrap from './SectionWrap';

interface Props {
    portInfo: string;
}

const NetworkView: React.FC<Props> = ({ portInfo }) => {
    return (
        <SectionWrap
            header={
                <span className="flex items-center gap-2 text-gh-text uppercase tracking-wider text-xs font-bold">
                    🌐 Network Ports
                </span>
            }
        >
            <div className="bg-gh-inner border border-gh-border rounded-md p-4 h-48 overflow-y-auto custom-scrollbar">
                <pre className="m-0 text-amber-400 font-mono text-[11px] leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: portInfo || "Scanning network..." }}
                >
                </pre>
            </div>
        </SectionWrap>
    );
};

export default NetworkView;