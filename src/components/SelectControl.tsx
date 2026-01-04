import React from 'react';
import { styles } from '../styles.js';

interface SelectControlProps<T extends string> {
    label: string;
    icon?: string;
    value: T;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
}

export function SelectControl<T extends string>({ label, icon, value, options, onChange }: SelectControlProps<T>) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value as T);
    };

    return (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: styles.spacing.gap.xl }}>
            <label style={{ ...styles.components.label, fontWeight: 500 }}>
                {icon && <i className={icon} style={{ marginRight: styles.spacing.margin.md }}></i>}
                {label}
            </label>
            <select
                value={value}
                onChange={handleChange}
                style={styles.components.select}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

