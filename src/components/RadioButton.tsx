import React from 'react';
import { styles } from '../styles.js';

interface RadioButtonProps {
    value: string;
    label: string;
    icon?: string | null;
    symbol?: string | null;
    isSelected: boolean;
    onClick: () => void;
}

export function RadioButton({ value, label, icon, symbol, isSelected, onClick }: RadioButtonProps) {
    return (
        <button
            onClick={onClick}
            style={{
                ...styles.components.button,
                padding: styles.spacing.padding.lg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: styles.spacing.gap.xs,
                minWidth: '50px',
                background: isSelected ? styles.colors.primary : 'white',
                color: isSelected ? 'white' : styles.colors.text,
                border: isSelected ? `2px solid ${styles.colors.primary}` : '2px solid #d0d0d0',
                boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
            }}
            title={label}
        >
            {icon ? (
                <i className={icon} style={{ fontSize: '0.9em' }}></i>
            ) : symbol ? (
                <span style={{ fontSize: '1.1em', lineHeight: '1' }}>{symbol}</span>
            ) : null}
            <span style={{ fontSize: '0.65em' }}>{label}</span>
        </button>
    );
}

