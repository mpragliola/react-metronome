import React, { useCallback, useEffect, useState } from 'react';
import { UseMetronomeReturn } from '../hooks/useMetronome.js';
import { clamp } from '../utils/validation.js';
import { CONSTANTS } from '../constants.js';
import { RampControl } from './RampControl.js';
import { AlternatingRampControl } from './AlternatingRampControl.js';
import { NumberInputField } from './NumberInputField.js';
import { styles } from '../styles.js';

interface RampPanelProps {
    metronome: UseMetronomeReturn;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ ...styles.components.label, marginBottom: styles.spacing.margin.sm, fontSize: '0.75em', fontWeight: 600 }}>
            {children}
        </div>
    );
}

export function RampPanel({ metronome }: RampPanelProps) {
    const { isRamping, startRamp, startAlternatingRamp, cancelRamp, bpm, start, stop, currentRampStepIndex } = metronome;
    const [currentRampBpm, setCurrentRampBpm] = useState<number | null>(null);
    const [targetRampBpm, setTargetRampBpm] = useState<number | null>(null);
    const [sharedStartBpm, setSharedStartBpm] = useState(120);
    const [sharedTargetBpm, setSharedTargetBpm] = useState(180);

    // Update current ramp BPM when bpm changes during ramp
    useEffect(() => {
        if (isRamping) {
            setCurrentRampBpm(bpm);
        }
    }, [bpm, isRamping]);

    // Shared logic for starting any type of ramp
    const prepareRampStart = useCallback(async () => {
        if (isRamping) {
            cancelRamp();
            stop();
            setCurrentRampBpm(null);
            setTargetRampBpm(null);
            return false;
        }

        if (metronome.isRunning) {
            stop();
        }

        try {
            await start();
            return true;
        } catch (error) {
            console.error('Failed to start metronome:', error);
            return false;
        }
    }, [isRamping, cancelRamp, stop, metronome.isRunning, start]);

    const handleRampStart = useCallback(async (increment: number, durationSeconds: number) => {
        const ready = await prepareRampStart();
        if (!ready) return;

        const clampedStartBpm = clamp(sharedStartBpm, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX);
        const clampedTargetBpm = clamp(sharedTargetBpm, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX);

        const rampStarted = startRamp(clampedStartBpm, clampedTargetBpm, increment, durationSeconds);
        if (rampStarted) {
            setCurrentRampBpm(clampedStartBpm);
            setTargetRampBpm(clampedTargetBpm);
        }
    }, [prepareRampStart, startRamp, sharedStartBpm, sharedTargetBpm]);

    const handleAlternatingRampStart = useCallback(async (positiveStep: number, negativeStep: number, multiplier: number, measuresPerStep: number) => {
        const ready = await prepareRampStart();
        if (!ready) return;

        const clampedStartBpm = clamp(sharedStartBpm, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX);
        const clampedTargetBpm = clamp(sharedTargetBpm, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX);

        const rampStarted = startAlternatingRamp(clampedStartBpm, clampedTargetBpm, positiveStep, negativeStep, multiplier, measuresPerStep);
        if (rampStarted) {
            setCurrentRampBpm(clampedStartBpm);
            setTargetRampBpm(clampedTargetBpm);
        }
    }, [prepareRampStart, startAlternatingRamp, sharedStartBpm, sharedTargetBpm]);

    // Reset ramp status when ramp completes
    useEffect(() => {
        if (!isRamping && currentRampBpm !== null) {
            setCurrentRampBpm(null);
            setTargetRampBpm(null);
        }
    }, [isRamping, currentRampBpm]);

    const containerStyle: React.CSSProperties = {
        ...styles.components.panelContainer,
    };


    return (
        <div style={containerStyle}>
            <h1 style={{ ...styles.components.heading, marginBottom: styles.spacing.margin.md, fontSize: '1em' }}>
                <i className="fas fa-chart-line" style={{ marginRight: styles.spacing.margin.md }}></i> BPM Ramp
            </h1>

            {/* Shared Start and Target BPM */}
            <div style={{ display: 'flex', gap: styles.spacing.gap.md, margin: `${styles.spacing.margin.md} 0`, justifyContent: 'center', alignItems: 'flex-end' }}>
                <NumberInputField
                    label="Start"
                    value={sharedStartBpm}
                    min={CONSTANTS.BPM.MIN}
                    max={CONSTANTS.BPM.MAX}
                    step={1}
                    disabled={isRamping}
                    onChange={setSharedStartBpm}
                />
                <NumberInputField
                    label="Target"
                    value={sharedTargetBpm}
                    min={CONSTANTS.BPM.MIN}
                    max={CONSTANTS.BPM.MAX}
                    step={1}
                    disabled={isRamping}
                    onChange={setSharedTargetBpm}
                />

                {/* Status display */}
                <div style={{
                    ...styles.components.valueDisplay,
                    fontSize: '0.75em',
                    fontWeight: 500,
                    margin: `${styles.spacing.margin.md} 0`,
                    minHeight: '1em',
                    textAlign: 'center',
                }}>
                    {isRamping && currentRampBpm !== null && targetRampBpm !== null
                        ? `Ramping: ${Math.round(currentRampBpm)} → ${targetRampBpm} BPM`
                        : 'Ready'}
                </div>
            </div>


            <div style={{ marginTop: styles.spacing.margin.section, marginBottom: styles.spacing.margin.sectionLarge, paddingTop: styles.spacing.margin.section, borderTop: `1px solid ${styles.colors.sliderBg}` }}>
                <SectionLabel>Linear Ramp</SectionLabel>
                <RampControl
                    isRamping={isRamping}
                    onStart={handleRampStart}
                />
            </div>

            <div style={{ marginTop: styles.spacing.margin.sectionLarge, paddingTop: styles.spacing.margin.sectionLarge, borderTop: `1px solid ${styles.colors.sliderBg}` }}>
                <SectionLabel>Alternating Ramp</SectionLabel>
                <AlternatingRampControl
                    isRamping={isRamping}
                    startBpm={sharedStartBpm}
                    currentStepIndex={currentRampStepIndex}
                    onStart={handleAlternatingRampStart}
                />
            </div>
        </div>
    );
}

