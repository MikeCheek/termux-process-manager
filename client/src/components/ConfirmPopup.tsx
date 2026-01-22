import React from 'react';

interface ConfirmPopupProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    variant?: 'danger' | 'accent';
}

const ConfirmPopup: React.FC<ConfirmPopupProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    variant = 'accent'
}) => {
    if (!isOpen) return null;

    const buttonColors = {
        danger: "bg-gh-danger hover:bg-red-600 text-white",
        accent: "bg-gh-accent hover:bg-blue-600 text-white"
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onCancel}
            />

            {/* Modal Card */}
            <div className="relative bg-gh-inner border border-gh-border rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <h3 className="text-gh-text font-bold text-lg mb-2">{title}</h3>
                    <p className="text-gh-dim text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions Footer */}
                <div className="bg-gh-border/20 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-xs font-bold text-gh-dim hover:text-gh-text transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-xs font-bold rounded-md transition-all active:scale-95 cursor-pointer ${buttonColors[variant]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmPopup;