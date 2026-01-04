import React, { useState, useCallback } from 'react';
import { NumberInputField } from './NumberInputField.js';
import { RampButton } from './RampButton.js';
import { CONSTANTS } from '../constants.js';
import { styles } from '../styles.js';

interface RampControlProps {
    isRamping: boolean;
    onStart: (increment: number, durationSeconds: number) => void;
}

export function RampControl({ isRamping, onStart }: RampControlProps) {
    const [increment, setIncrement] = useState(1);
    const [durationSeconds, setDurationSeconds] = useState(10);

    const handleStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onStart(increment, durationSeconds);
    }, [increment, durationSeconds, onStart]);

    return (
        <>
            <div style={{ display: 'flex', gap: styles.spacing.gap.md, margin: `${styles.spacing.margin.md} 0`, justifyContent: 'center', alignItems: 'flex-end' }}>
                <NumberInputField
                    label="Inc"
                    value={increment}
                    min={CONSTANTS.RAMP.LINEAR.INCREMENT_MIN}
                    max={CONSTANTS.RAMP.LINEAR.INCREMENT_MAX}
                    step={0.1}
                    disabled={isRamping}
                    onChange={setIncrement}
                />
                <NumberInputField
                    label="Dur (s)"
                    value={durationSeconds}
                    min={CONSTANTS.RAMP.LINEAR.DURATION_MIN}
                    max={CONSTANTS.RAMP.LINEAR.DURATION_MAX}
                    step={1}
                    disabled={isRamping}
                    onChange={setDurationSeconds}
                />
                <RampButton isRamping={isRamping} onClick={handleStart} />

            </div>

        </>
    );
}

