import React from 'react';
import { styles } from '../styles.js';

interface ToggleButtonProps {
    isRunning: boolean;
    disabled?: boolean;
    onToggle: () => void;
}

export function ToggleButton({ isRunning, disabled = false, onToggle }: ToggleButtonProps) {
    return (
        <button
            onClick={onToggle}
            disabled={disabled}
            style={{
                ...styles.components.button,
                ...styles.components.buttonPrimary,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
            }}
        >
            <i className={`fas ${isRunning ? 'fa-pause' : 'fa-play'}`} style={{ marginRight: styles.spacing.margin.md }}></i>
            {isRunning ? 'Stop' : 'Start'}
        </button>
    );
}

