import React from 'react';

interface Props {
    header: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    count?: number | string;
}

const SectionWrap: React.FC<Props> = ({ header, children, className = '', count }) => {
    return (
        /* Added: h-full flex flex-col 
           This ensures the section takes up 100% of the parent's height 
        */
        <section className={`bg-gh-card border border-gh-border rounded-md p-6 flex flex-col h-full min-h-0 ${className}`}>

            {/* Header: Fixed height (flex-none) */}
            <div className="flex justify-between items-center mb-5 border-b border-gh-border pb-3 flex-none">
                <div className="text-sm font-semibold flex items-center gap-2 text-gh-text">
                    {header}
                </div>

                {count !== undefined && (
                    <span className="bg-gh-accent/10 text-gh-accent text-[11px] px-2 py-0.5 rounded-full font-bold">
                        {count}
                    </span>
                )}
            </div>

            {/* Content Section: flex-1 and min-h-0 
                This allows the table or console inside to grow and shrink
            */}
            <div className="w-full flex-1 min-h-0 flex flex-col">
                {children}
            </div>
        </section>
    );
};

export default SectionWrap;