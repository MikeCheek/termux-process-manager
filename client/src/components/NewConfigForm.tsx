import React, { useState } from 'react';
import SectionWrap from './SectionWrap';

const NewConfigForm: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', cmd: '', desc: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                // To avoid a full page reload, you could call a refresh function 
                // passed from props, but keeping your original logic for now:
                window.location.reload();
            }
        } catch (err) {
            console.error("Add failed:", err);
        }
    };

    return (
        <SectionWrap
            header={
                <span className="flex items-center gap-2 text-purple-400 font-bold">
                    ➕ New Configuration
                </span>
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* 3-Column Grid for Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Name Input */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gh-dim uppercase tracking-wider">
                            Name
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. API Server"
                            className="bg-gh-inner border border-gh-border rounded-md px-3 py-2 text-sm text-gh-text focus:outline-none focus:border-gh-accent focus:ring-1 focus:ring-gh-accent transition-all placeholder:text-gh-dim/50"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Command Input */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gh-dim uppercase tracking-wider">
                            Command
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="npm start"
                            className="bg-gh-inner border border-gh-border rounded-md px-3 py-2 text-sm text-gh-text font-mono focus:outline-none focus:border-gh-accent focus:ring-1 focus:ring-gh-accent transition-all placeholder:text-gh-dim/50"
                            value={formData.cmd}
                            onChange={e => setFormData({ ...formData, cmd: e.target.value })}
                        />
                    </div>

                    {/* Description Input */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gh-dim uppercase tracking-wider">
                            Description
                        </label>
                        <input
                            type="text"
                            placeholder="Optional notes..."
                            className="bg-gh-inner border border-gh-border rounded-md px-3 py-2 text-sm text-gh-text focus:outline-none focus:border-gh-accent focus:ring-1 focus:ring-gh-accent transition-all placeholder:text-gh-dim/50"
                            value={formData.desc}
                            onChange={e => setFormData({ ...formData, desc: e.target.value })}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="mt-2 bg-gh-accent hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-md text-sm transition-colors shadow-sm active:scale-[0.98]"
                >
                    Add to Dashboard
                </button>
            </form>
        </SectionWrap>
    );
};

export default NewConfigForm;