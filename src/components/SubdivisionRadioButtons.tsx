import React from 'react';
import { SubdivisionMode } from '../types.js';
import { RadioButton } from './RadioButton.js';
import { styles } from '../styles.js';

interface SubdivisionRadioButtonsProps {
    value: SubdivisionMode;
    onChange: (value: SubdivisionMode) => void;
}

const subdivisionOptions: Array<{ value: SubdivisionMode; label: string; icon: string | null; symbol: string | null }> = [
    { value: 'no', label: 'No', icon: 'fas fa-circle', symbol: null },
    { value: 'straight', label: '8th', icon: null, symbol: '♫' }, // Beamed eighth notes
    { value: 'triplet', label: '8th 3', icon: null, symbol: '♫' }, // Beamed eighth notes (triplet)
    { value: 'sixteenth', label: '16th', icon: null, symbol: '♬' }, // Beamed sixteenth notes
    { value: 'sixteenth-triplet', label: '16th 3', icon: null, symbol: '♬' }, // Beamed sixteenth notes (triplet)
];

export function SubdivisionRadioButtons({ value, onChange }: SubdivisionRadioButtonsProps) {
    return (
        <div style={{ margin: `${styles.spacing.margin.section} 0` }}>
            <div style={{ display: 'flex', gap: styles.spacing.gap.md, justifyContent: 'center', flexWrap: 'wrap' }}>
                {subdivisionOptions.map((option) => (
                    <RadioButton
                        key={option.value}
                        value={option.value}
                        label={option.label}
                        icon={option.icon ?? undefined}
                        symbol={option.symbol ?? undefined}
                        isSelected={value === option.value}
                        onClick={() => onChange(option.value)}
                    />
                ))}
            </div>
        </div>
    );
}

