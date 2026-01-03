import React from 'react';

interface Props {
    header: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    count?: number | string; // Optional badge like "7 Active"
}

const SectionWrap: React.FC<Props> = ({ header, children, className = '', count }) => {
    return (
        <section className={`bg-gh-card border border-gh-border rounded-md p-6 ${className}`}>
            <div className="flex justify-between items-center mb-5 border-b border-gh-border pb-3">
                {/* Header Title/Icon */}
                <div className="text-sm font-semibold flex items-center gap-2 text-gh-text">
                    {header}
                </div>

                {/* Count Badge - Matches the blue "7 Active" badge in your image */}
                {count !== undefined && (
                    <span className="bg-gh-accent/10 text-gh-accent text-[11px] px-2 py-0.5 rounded-full font-bold">
                        {count}
                    </span>
                )}
            </div>

            {/* Section Content */}
            <div className="w-full">
                {children}
            </div>
        </section>
    );
};

export default SectionWrap;