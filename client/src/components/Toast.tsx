import React from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, type }) => {
    const isSuccess = type === 'success';

    return (
        <div
            className={`
        fixed top-6 right-6 z-[100] 
        flex items-center gap-3 px-4 py-3 rounded-md shadow-2xl border
        animate-in slide-in-from-right-10 duration-300
        ${isSuccess
                    ? 'bg-gh-card border-gh-success text-gh-text'
                    : 'bg-gh-card border-gh-danger text-gh-text'
                }
      `}
        >
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
        ${isSuccess ? 'bg-gh-success/20 text-gh-success' : 'bg-gh-danger/20 text-gh-danger'}
      `}>
                {isSuccess ? '✓' : '✕'}
            </span>

            <p className="text-sm font-medium tracking-tight">
                {message}
            </p>

            {/* Decorative progress bar animation (3s matching your timeout) */}
            <div className={`absolute bottom-0 left-0 h-1 bg-current opacity-20 animate-[progress_3s_linear]`}></div>
        </div>
    );
};