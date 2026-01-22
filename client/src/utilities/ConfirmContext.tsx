import React, { createContext, useContext, useState, type ReactNode } from 'react';
import ConfirmPopup from '../components/ConfirmPopup';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'accent';
    onConfirm: () => void;
}

interface ConfirmContextType {
    askConfirmation: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<ConfirmOptions | null>(null);

    const askConfirmation = (options: ConfirmOptions) => {
        setConfig(options);
    };

    const close = () => setConfig(null);

    return (
        <ConfirmContext.Provider value={{ askConfirmation }}>
            {children}

            {/* The actual UI component rendered once at the root */}
            <ConfirmPopup
                isOpen={!!config}
                title={config?.title || ''}
                message={config?.message || ''}
                confirmText={config?.confirmText}
                variant={config?.variant}
                onCancel={close}
                onConfirm={() => {
                    config?.onConfirm();
                    close();
                }}
            />
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) throw new Error("useConfirm must be used within a ConfirmProvider");
    return context;
};