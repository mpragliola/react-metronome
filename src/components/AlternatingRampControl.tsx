import React, { useState, useCallback } from 'react';
import { NumberInputField } from './NumberInputField.js';
import { RampButton } from './RampButton.js';
import { SequenceItem } from './SequenceItem.js';
import { styles } from '../styles.js';

interface AlternatingRampControlProps {
    isRamping: boolean;
    currentStepIndex: number | null;
    onStart: (positiveStep: number, negativeStep: number, multiplier: number, measuresPerStep: number) => void;
}

// Static styles - moved outside component to avoid recreation on every render
const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: styles.spacing.gap.sm,
    margin: `${styles.spacing.margin.sm} 0`,
    justifyContent: 'center',
    alignItems: 'flex-end',
};

const operatorSignStyle: React.CSSProperties = {
    fontSize: '0.9em',
    marginBottom: styles.spacing.margin.xs,
    color: styles.colors.text,
    display: 'flex',
    alignItems: 'center',
};

// Base message style - shared by error and validation messages
const baseMessageStyle: React.CSSProperties = {
    fontSize: '0.65em',
    margin: `${styles.spacing.margin.xs} 0`,
    textAlign: 'center',
};

const errorMessageStyle: React.CSSProperties = {
    ...baseMessageStyle,
    color: '#ff6b6b',
};

const validationMessageStyle: React.CSSProperties = {
    ...baseMessageStyle,
    color: styles.colors.textLight,
};

const sequenceContainerStyle: React.CSSProperties = {
    marginBottom: styles.spacing.margin.xs,
};

export function AlternatingRampControl({ isRamping, currentStepIndex, onStart }: AlternatingRampControlProps) {
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
            steps.push(
                <SequenceItem
                    key={`pos-${i}`}
                    step={positiveStep}
                    cumulativeChange={cumulativeChange}
                    isActive={isActive(i)}
                    isPositive={true}
                />
            );
        }

        // Generate negative step
        cumulativeChange -= negativeStep;
        steps.push(' ');
        const negativeStepIndex = multiplier;
        steps.push(
            <SequenceItem
                key="neg"
                step={negativeStep}
                cumulativeChange={cumulativeChange}
                isActive={isActive(negativeStepIndex)}
                isPositive={false}
            />
        );

        return steps;
    };

    return (
        <>
            <div style={containerStyle}>
                <NumberInputField label="Mult" value={multiplier} min={1} max={16} step={1} disabled={isRamping}
                    onChange={(value) => setMultiplier(Math.round(value))} borderColor={hasValidationError ? '#ff6b6b' : undefined}
                />
                <div style={operatorSignStyle}>
                    ×
                </div>
                <NumberInputField label="Step" value={positiveStep} min={1} max={20} step={1} disabled={isRamping}
                    onChange={(value) => setPositiveStep(Math.round(value))} borderColor={hasValidationError ? '#ff6b6b' : undefined}
                />
                <div style={operatorSignStyle}>
                    −
                </div>
                <NumberInputField label="-Step" value={negativeStep} min={1} max={319} step={1} disabled={isRamping}
                    onChange={(value) => setNegativeStep(Math.round(value))} borderColor={hasValidationError ? '#ff6b6b' : undefined}
                />
                <NumberInputField
                    label="Meas"
                    value={measuresPerStep}
                    min={1}
                    max={32}
                    step={1}
                    disabled={isRamping}
                    onChange={(value) => setMeasuresPerStep(Math.round(value))}
                    borderColor={measuresPerStep < 1 ? '#ff6b6b' : undefined}
                />
                <RampButton isRamping={isRamping} isValid={isValid} onClick={handleStart} />
            </div>

            {!isValid && (
                <div style={errorMessageStyle}>
                    {hasValidationError ? `(Mult × +Step) must be greater than -Step` : 'Measures must be at least 1'}
                </div>
            )}

            {isValid && (
                <div style={validationMessageStyle}>
                    <div style={sequenceContainerStyle}>
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

