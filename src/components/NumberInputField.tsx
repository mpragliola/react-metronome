import React from 'react';
import { styles } from '../styles.js';

interface NumberInputFieldProps {
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    onChange: (value: number) => void;
    borderColor?: string;
}

export function NumberInputField({
    label,
    value,
    min,
    max,
    step = 1,
    disabled = false,
    onChange,
    borderColor,
}: NumberInputFieldProps) {
    const inputStyle: React.CSSProperties = {
        ...styles.components.input,
        width: '50px',
        fontSize: '0.75em',
        padding: styles.spacing.padding.xs,
        ...(borderColor && { borderColor }),
    };

    const labelStyle: React.CSSProperties = {
        ...styles.components.labelSmall,
        fontSize: '0.65em',
        marginBottom: styles.spacing.margin.xs,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={labelStyle}>{label}</div>
            <input
                type="number"
                min={min}
                max={max}
                value={value}
                step={step}
                onChange={(e) => onChange(Number(e.target.value))}
                disabled={disabled}
                style={{
                    ...inputStyle,
                    opacity: disabled ? 0.5 : 1,
                }}
            />
        </div>
    );
}

