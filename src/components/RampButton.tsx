import React from 'react';
import { styles } from '../styles.js';

interface RampButtonProps {
    isRamping: boolean;
    isValid?: boolean;
    onClick: (e: React.MouseEvent) => void;
}

export function RampButton({ isRamping, isValid = true, onClick }: RampButtonProps) {
    return (
        <div style={{ marginTop: styles.spacing.margin.xs }}>
            <button
                type="button"
                onClick={onClick}
                disabled={!isValid}
                style={{
                    ...styles.components.button,
                    ...styles.components.buttonPrimary,
                    background: isRamping ? styles.colors.accent : styles.colors.primary,
                    opacity: isValid ? 1 : 0.5,
                    cursor: isValid ? 'pointer' : 'not-allowed',
                    fontSize: '0.7em',
                    padding: styles.spacing.padding.md,
                    minWidth: '50px',
                }}
            >
                <i className={`fas ${isRamping ? 'fa-stop' : 'fa-play'}`} style={{ marginRight: styles.spacing.margin.lg }}></i>
                {isRamping ? 'Stop' : 'Start'}
            </button>
        </div>
    );
}

