import React from 'react';
import SectionWrap from './SectionWrap';
import type { DashboardData } from '../types';

interface Props {
    portsInfo: DashboardData["ports_info"];
}

const NetworkView: React.FC<Props> = ({ portsInfo }) => {
    if (!portsInfo) {
        return (
            <SectionWrap header={<span className="text-xs flex-1 min-h-0 font-bold uppercase">🌐 Network Services</span>}>
                <div className="bg-gh-inner border border-gh-border rounded-md h-64 flex items-center justify-center">
                    <span className="text-gh-dim text-xs animate-pulse">Initializing network scan...</span>
                </div>
            </SectionWrap>
        );
    }
    return (
        <SectionWrap
            header={
                <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2 text-gh-text uppercase tracking-wider text-xs font-bold">
                        🌐 Network Services
                    </span>
                    <span className="text-[10px] text-gh-dim font-mono ml-4">
                        {portsInfo.filter(p => p.isOpen).length} Active
                    </span>
                </div>
            }
        >
            <div className="bg-gh-inner border border-gh-border rounded-md flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gh-inner shadow-sm">
                        <tr className="border-b border-gh-border">
                            <th className="p-2 pl-4 text-[10px] text-gh-dim uppercase font-bold">Service</th>
                            <th className="p-2 text-[10px] text-gh-dim uppercase font-bold text-center">Port</th>
                            <th className="p-2 pr-4 text-[10px] text-gh-dim uppercase font-bold text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-[11px]">
                        {portsInfo.length > 0 ? (
                            portsInfo.map((item) => (
                                <tr key={item.port} className="border-b border-gh-border/30 hover:bg-gh-bg/50 transition-colors">
                                    <td className="p-2 pl-4">
                                        <div className="flex items-center gap-2">
                                            <span>{item.icon}</span>
                                            {
                                                item.isOpen ?
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-gh-accent hover:underline truncate max-w-[120px]"
                                                    >
                                                        {item.name}
                                                    </a>
                                                    :
                                                    <p
                                                        className="truncate max-w-[120px]"
                                                    >
                                                        {item.name}
                                                    </p>
                                            }

                                        </div>
                                    </td>
                                    <td className="p-2 text-gh-text text-center">
                                        {item.port}
                                    </td>
                                    <td className="p-2 pr-4 text-right">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm ${item.isOpen
                                            ? 'text-gh-success bg-gh-success/10'
                                            : 'text-gh-danger bg-gh-danger/10 opacity-50'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.isOpen ? 'bg-gh-success animate-pulse' : 'bg-gh-danger'}`} />
                                            {item.isOpen ? 'OPEN' : 'DOWN'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-gh-dim italic">
                                    Scanning network ports...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </SectionWrap>
    );
};

export default NetworkView;