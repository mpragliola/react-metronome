import React from 'react';
import { styles } from '../styles.js';

interface SequenceItemProps {
    step: number;
    cumulativeChange: number;
    isActive: boolean;
    isPositive: boolean;
}

const sequenceItemStyle = (isActive: boolean): React.CSSProperties => ({
    backgroundColor: isActive ? styles.colors.accent : "transparent",
    color: isActive ? 'white' : 'inherit',
    padding: "2px",
    borderRadius: "2px",
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s',
});

const subscriptStyle: React.CSSProperties = {
    fontSize: '0.6em',
};

export function SequenceItem({ step, cumulativeChange, isActive, isPositive }: SequenceItemProps) {
    const sign = isPositive ? '+' : '-';
    return (
        <span style={sequenceItemStyle(isActive)}>
            {sign}{step}
            <sub style={subscriptStyle}>({cumulativeChange})</sub>
        </span>
    );
}

