import React, { useCallback, useEffect, useState } from 'react';
import { UseMetronomeReturn } from '../hooks/useMetronome.js';
import { clamp } from '../utils/validation.js';
import { CONSTANTS } from '../constants.js';
import { RampControl } from './RampControl.js';
import { AlternatingRampControl } from './AlternatingRampControl.js';
import { NumberInputField } from './NumberInputField.js';
import { HelpIcon } from './HelpIcon.js';
import { styles } from '../styles.js';

interface RampPanelProps {
    metronome: UseMetronomeReturn;
}

function SectionLabel({ children, helpContent, helpTitle }: { children: React.ReactNode; helpContent?: React.ReactNode; helpTitle?: string }) {
    return (
        <div style={{ ...styles.components.label, marginBottom: styles.spacing.margin.sm, fontSize: '0.75em', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: styles.spacing.gap.xs }}>
            {children}
            {helpContent && (
                <HelpIcon content={helpContent} title={helpTitle} />
            )}
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
                <SectionLabel
                    helpTitle="Linear Ramp"
                    helpContent={
                        <div>
                            <p>A linear ramp gradually changes BPM from the start value ({sharedStartBpm} BPM) to the target value ({sharedTargetBpm} BPM) over a specified duration.</p>
                            <p><strong>Parameters:</strong></p>
                            <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                                <li><strong>Inc (Increment):</strong> How much BPM changes per step (0.1 - 10)</li>
                                <li><strong>Dur (Duration):</strong> Total time for the entire ramp in seconds (1 - 300)</li>
                            </ul>
                            <p style={{ marginTop: '12px' }}>The ramp calculates step intervals automatically based on the increment and duration to smoothly transition from start to target BPM.</p>
                        </div>
                    }
                >
                    Linear Ramp
                </SectionLabel>
                <RampControl
                    isRamping={isRamping}
                    onStart={handleRampStart}
                />
            </div>

            <div style={{ marginTop: styles.spacing.margin.sectionLarge, paddingTop: styles.spacing.margin.sectionLarge, borderTop: `1px solid ${styles.colors.sliderBg}` }}>
                <SectionLabel
                    helpTitle="Alternating Ramp"
                    helpContent={
                        <div>
                            <p>An alternating ramp creates a repeating pattern of positive and negative BPM steps, gradually increasing overall tempo from {sharedStartBpm} BPM toward {sharedTargetBpm} BPM.</p>
                            <p><strong>How it works:</strong></p>
                            <p>The pattern repeats: multiple positive steps followed by one negative step. Each cycle results in a net BPM increase.</p>
                            <p style={{ marginTop: '12px' }}><strong>Parameters:</strong></p>
                            <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                                <li><strong>Mult:</strong> Number of positive steps (1 - 10)</li>
                                <li><strong>+Step:</strong> Positive step value in BPM (1 - 20)</li>
                                <li><strong>-Step:</strong> Negative step value in BPM (1 - 20)</li>
                                <li><strong>Meas:</strong> Measures per step (1 - 32)</li>
                            </ul>
                            <p style={{ marginTop: '12px' }}>The active step is highlighted in real-time as the ramp progresses.</p>
                        </div>
                    }
                >
                    Alternating Ramp
                </SectionLabel>
                <AlternatingRampControl
                    isRamping={isRamping}
                    currentStepIndex={currentRampStepIndex}
                    onStart={handleAlternatingRampStart}
                />
            </div>
        </div>
    );
}

