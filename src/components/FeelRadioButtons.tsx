import React from 'react';
import { FeelMode } from '../types.js';
import { RadioButton } from './RadioButton.js';
import { styles } from '../styles.js';

interface FeelRadioButtonsProps {
    value: FeelMode;
    onChange: (value: FeelMode) => void;
}

const feelOptions: Array<{ value: FeelMode; label: string; icon: string }> = [
    { value: 'half', label: '1/2', icon: 'fas fa-backward' },
    { value: 'normal', label: 'Normal', icon: 'fas fa-clock' },
    { value: 'double', label: 'x2', icon: 'fas fa-forward' },
];

export function FeelRadioButtons({ value, onChange }: FeelRadioButtonsProps) {
    return (
        <div style={{ margin: `${styles.spacing.margin.section} 0` }}>
            <div style={{ display: 'flex', gap: styles.spacing.gap.md, justifyContent: 'center' }}>
                {feelOptions.map((option) => (
                    <RadioButton
                        key={option.value}
                        value={option.value}
                        label={option.label}
                        icon={option.icon}
                        isSelected={value === option.value}
                        onClick={() => onChange(option.value)}
                    />
                ))}
            </div>
        </div>
    );
}

