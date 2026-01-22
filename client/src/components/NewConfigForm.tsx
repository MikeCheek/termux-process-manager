import React, { useState } from 'react';
import SectionWrap from './SectionWrap';

interface NewConfigFormProps {
    refreshData: () => void;
}

const NewConfigForm: React.FC<NewConfigFormProps> = ({ refreshData }) => {
    const [formData, setFormData] = useState({ name: '', cmd: '', desc: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await fetch('/api/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setFormData({ name: '', cmd: '', desc: '' }); // Clear form
                refreshData();
            }
        } catch (err) {
            console.error("Add failed:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap md:flex-nowrap items-end gap-3">
            {/* Name */}
            <div className="flex-1 min-w-[140px]">
                <input
                    required
                    type="text"
                    placeholder="Name (e.g. Build)"
                    className="w-full bg-gh-inner border border-gh-border rounded px-3 py-1.5 text-xs text-gh-text focus:border-gh-accent outline-none transition-all"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
            </div>

            {/* Command - Wider & Monospace */}
            <div className="flex-[2] min-w-[200px]">
                <input
                    required
                    type="text"
                    placeholder="Command (npm run...)"
                    className="w-full bg-gh-inner border border-gh-border rounded px-3 py-1.5 text-xs text-gh-text font-mono focus:border-gh-accent outline-none transition-all"
                    value={formData.cmd}
                    onChange={e => setFormData({ ...formData, cmd: e.target.value })}
                />
            </div>

            {/* Description */}
            <div className="flex-1 min-w-[140px]">
                <input
                    type="text"
                    placeholder="Description (Optional)"
                    className="w-full bg-gh-inner border border-gh-border rounded px-3 py-1.5 text-xs text-gh-text focus:border-gh-accent outline-none transition-all"
                    value={formData.desc}
                    onChange={e => setFormData({ ...formData, desc: e.target.value })}
                />
            </div>

            {/* Submit - Compact Action */}
            <button
                type="submit"
                disabled={isSaving}
                className="whitespace-nowrap bg-gh-success/20 text-gh-success hover:bg-gh-success hover:text-white border border-gh-success/30 px-4 py-1.5 rounded font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
            >
                {isSaving ? 'Saving...' : '+ Add'}
            </button>
        </form>
    );
};

export default NewConfigForm;