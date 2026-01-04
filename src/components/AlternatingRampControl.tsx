import React, { useState, useCallback } from 'react';
import { NumberInputField } from './NumberInputField.js';
import { RampButton } from './RampButton.js';
import { CONSTANTS } from '../constants.js';
import { styles } from '../styles.js';

interface AlternatingRampControlProps {
    isRamping: boolean;
    startBpm: number;
    currentStepIndex: number | null;
    onStart: (positiveStep: number, negativeStep: number, multiplier: number, measuresPerStep: number) => void;
}

export function AlternatingRampControl({ isRamping, startBpm, currentStepIndex, onStart }: AlternatingRampControlProps) {
    const [positiveStep, setPositiveStep] = useState(4);
    const [negativeStep, setNegativeStep] = useState(2);
    const [multiplier, setMultiplier] = useState(1);
    const [measuresPerStep, setMeasuresPerStep] = useState(4);

    const handleStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Validate that (multiplier * positiveStep) > negativeStep
        if (multiplier * positiveStep <= negativeStep || positiveStep <= 0 || negativeStep <= 0 || multiplier <= 0) {
            return;
        }

        onStart(positiveStep, negativeStep, multiplier, measuresPerStep);
    }, [positiveStep, negativeStep, multiplier, measuresPerStep, onStart]);

    const isValid = (multiplier * positiveStep) > negativeStep && positiveStep > 0 && negativeStep > 0 &&
        multiplier > 0 && measuresPerStep >= 1 &&
        Number.isInteger(positiveStep) && Number.isInteger(negativeStep) &&
        Number.isInteger(multiplier) && Number.isInteger(measuresPerStep);
    const netPerCycle = (multiplier * positiveStep) - negativeStep;
    const hasValidationError = (multiplier * positiveStep) <= negativeStep;

    const generateSequence = () => {
        const steps: React.ReactNode[] = [];
        let cumulativeChange = 0;
        const isActive = (stepIndex: number) => isRamping && currentStepIndex === stepIndex;

        // Generate positive steps
        for (let i = 0; i < multiplier; i++) {
            cumulativeChange += positiveStep;
            if (i > 0) {
                steps.push(' ');
            }
            const active = isActive(i);
            steps.push(
                <span
                    key={`pos-${i}`}
                    style={{
                        backgroundColor: active ? styles.colors.accent : 'transparent',
                        color: active ? 'white' : 'inherit',
                        padding: active ? '2px 4px' : '0',
                        borderRadius: active ? '3px' : '0',
                        fontWeight: active ? 'bold' : 'normal',
                        transition: 'all 0.2s',
                    }}
                >
                    +{positiveStep}
                    <sub style={{ fontSize: '0.6em' }}>({cumulativeChange})</sub>
                </span>
            );
        }

        // Generate negative step
        cumulativeChange -= negativeStep;
        steps.push(' ');
        const negativeStepIndex = multiplier;
        const active = isActive(negativeStepIndex);
        steps.push(
            <span
                key="neg"
                style={{
                    backgroundColor: active ? styles.colors.accent : 'transparent',
                    color: active ? 'white' : 'inherit',
                    padding: active ? '2px 4px' : '0',
                    borderRadius: active ? '3px' : '0',
                    fontWeight: active ? 'bold' : 'normal',
                    transition: 'all 0.2s',
                }}
            >
                -{negativeStep}
                <sub style={{ fontSize: '0.6em' }}>({cumulativeChange})</sub>
            </span>
        );

        return steps;
    };

    return (
        <>
            <div style={{ display: 'flex', gap: styles.spacing.gap.sm, margin: `${styles.spacing.margin.sm} 0`, justifyContent: 'center', alignItems: 'flex-end' }}>
                <NumberInputField
                    label="Mult"
                    value={multiplier}
                    min={CONSTANTS.RAMP.ALTERNATING.MULTIPLIER_MIN}
                    max={CONSTANTS.RAMP.ALTERNATING.MULTIPLIER_MAX}
                    step={1}
                    disabled={isRamping}
                    onChange={(value) => setMultiplier(Math.round(value))}
                    borderColor={hasValidationError ? '#ff6b6b' : undefined}
                />
                <div style={{
                    fontSize: '0.9em',
                    marginBottom: styles.spacing.margin.xs,
                    color: styles.colors.text,
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    ×
                </div>
                <NumberInputField
                    label="+Step"
                    value={positiveStep}
                    min={CONSTANTS.RAMP.ALTERNATING.STEP_MIN}
                    max={CONSTANTS.RAMP.ALTERNATING.STEP_MAX}
                    step={1}
                    disabled={isRamping}
                    onChange={(value) => setPositiveStep(Math.round(value))}
                    borderColor={hasValidationError ? '#ff6b6b' : undefined}
                />
                <NumberInputField
                    label="-Step"
                    value={negativeStep}
                    min={CONSTANTS.RAMP.ALTERNATING.STEP_MIN}
                    max={CONSTANTS.RAMP.ALTERNATING.STEP_MAX}
                    step={1}
                    disabled={isRamping}
                    onChange={(value) => setNegativeStep(Math.round(value))}
                    borderColor={hasValidationError ? '#ff6b6b' : undefined}
                />
                <NumberInputField
                    label="Meas"
                    value={measuresPerStep}
                    min={CONSTANTS.RAMP.ALTERNATING.MEASURES_MIN}
                    max={CONSTANTS.RAMP.ALTERNATING.MEASURES_MAX}
                    step={1}
                    disabled={isRamping}
                    onChange={(value) => setMeasuresPerStep(Math.round(value))}
                    borderColor={measuresPerStep < 1 ? '#ff6b6b' : undefined}
                />
                <RampButton isRamping={isRamping} isValid={isValid} onClick={handleStart} />
            </div>

            {!isValid && (
                <div style={{
                    fontSize: '0.65em',
                    color: '#ff6b6b',
                    margin: `${styles.spacing.margin.xs} 0`,
                    textAlign: 'center',
                }}>
                    {hasValidationError ? `(Mult × +Step) must be greater than -Step` : 'Measures must be at least 1'}
                </div>
            )}

            {isValid && (
                <div style={{
                    fontSize: '0.65em',
                    color: styles.colors.textLight,
                    margin: `${styles.spacing.margin.xs} 0`,
                    textAlign: 'center',
                }}>
                    <div style={{ marginBottom: styles.spacing.margin.xs }}>
                        <strong>Sequence:</strong> {generateSequence()}
                    </div>
                    <div>
                        <strong>Net:</strong> +{netPerCycle.toFixed(1)} BPM per cycle
                    </div>
                </div>
            )}


        </>
    );
}

