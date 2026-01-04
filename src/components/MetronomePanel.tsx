import React, { useCallback, useEffect, useRef } from 'react';
import { UseMetronomeReturn } from '../hooks/useMetronome.js';
import { clamp } from '../utils/validation.js';
import { CONSTANTS } from '../constants.js';
import { BPMControl } from './BPMControl.js';
import { SliderControl } from './SliderControl.js';
import { FeelRadioButtons } from './FeelRadioButtons.js';
import { SubdivisionRadioButtons } from './SubdivisionRadioButtons.js';
import { VisualIndicator, VisualIndicatorRef } from './VisualIndicator.js';
import { ToggleButton } from './ToggleButton.js';
import { HelpIcon } from './HelpIcon.js';
import { styles } from '../styles.js';

interface MetronomePanelProps {
    metronome: UseMetronomeReturn;
}

export function MetronomePanel({ metronome }: MetronomePanelProps) {
    const {
        bpm,
        volume,
        accentPattern,
        subdivisionMode,
        feel,
        isRunning,
        isRamping,
        setBpm,
        setVolume,
        setAccentPattern,
        setSubdivisionMode,
        setFeel,
        start,
        stop,
        handleTapTempo,
        beatActive,
    } = metronome;

    const visualIndicatorRef = useRef<VisualIndicatorRef>(null);

    const handleToggle = useCallback(async () => {
        if (isRunning) {
            stop();
        } else {
            await start();
        }
    }, [isRunning, start, stop]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
                return;
            }

            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggle();
            } else if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                visualIndicatorRef.current?.triggerTap();
                handleTapTempo();
            } else if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                if (e.shiftKey) {
                    setBpm(clamp(bpm + 2, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX));
                } else {
                    setBpm(clamp(bpm + 1, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX));
                }
            } else if (e.key === '-' || e.key === '_') {
                e.preventDefault();
                if (e.shiftKey) {
                    setBpm(clamp(bpm - 2, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX));
                } else {
                    setBpm(clamp(bpm - 1, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX));
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [bpm, setBpm, handleToggle, handleTapTempo]);

    const containerStyle: React.CSSProperties = {
        ...styles.components.panelContainer,
    };

    return (
        <div style={containerStyle}>
            <h1 style={{ ...styles.components.heading, marginBottom: styles.spacing.margin.lg, fontSize: '1.2em' }}>
                <i className="fas fa-music" style={{ marginRight: styles.spacing.margin.md }}></i> Metronome
            </h1>

            <BPMControl bpm={bpm} onBpmChange={setBpm} />

            <div style={{ display: 'flex', gap: styles.spacing.margin.section, margin: `${styles.spacing.margin.section} 0` }}>
                <SliderControl
                    label="Volume"
                    icon="fas fa-volume-up"
                    value={volume}
                    min={CONSTANTS.VOLUME.MIN}
                    max={CONSTANTS.VOLUME.MAX}
                    scale={100}
                    onChange={setVolume}
                />
                <div style={{ flex: 1, position: 'relative' }}>
                    <SliderControl
                        label="Accent"
                        icon="fas fa-bullseye"
                        value={accentPattern}
                        min={CONSTANTS.ACCENT.MIN}
                        max={CONSTANTS.ACCENT.MAX}
                        scale={1}
                        onChange={setAccentPattern}
                    />
                    <div style={{ position: 'absolute', top: 0, right: 0 }}>
                        <HelpIcon
                            title="Accent Pattern"
                            content={
                                <div>
                                    <p>The accent pattern determines how many beats make up one measure (or accent cycle).</p>
                                    <p><strong>Range:</strong> {CONSTANTS.ACCENT.MIN} - {CONSTANTS.ACCENT.MAX} beats</p>
                                    <p style={{ marginTop: '12px' }}><strong>How it works:</strong></p>
                                    <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                                        <li>The first beat of each cycle plays an accented sound (higher pitch)</li>
                                        <li>Subsequent beats play regular sounds</li>
                                        <li>For example, with accent = 4: every 4 beats, the first is accented</li>
                                    </ul>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>

            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, right: 0 }}>
                    <HelpIcon
                        title="Feel Mode"
                        content={
                            <div>
                                <p>Feel mode changes the playback speed relative to the base BPM.</p>
                                <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                                    <li><strong>Normal:</strong> Plays at the base BPM.</li>
                                    <li><strong>x2 (Double):</strong> Plays twice as fast as the set BPM.</li>
                                    <li><strong>1/2 (Half):</strong> Plays at half the speed of the set BPM.</li>
                                </ul>
                            </div>
                        }
                    />
                </div>
                <FeelRadioButtons value={feel} onChange={setFeel} />
            </div>

            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, right: 0 }}>
                    <HelpIcon
                        title="Subdivision"
                        content={
                            <div>
                                <p>Subdivisions add extra beats between the main pulses.</p>
                                <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                                    <li><strong>No:</strong> Only play the main beats.</li>
                                    <li><strong>8th:</strong> Splits each beat into 2 (eighth notes).</li>
                                    <li><strong>8th 3:</strong> Splits each beat into 3 (triplets).</li>
                                    <li><strong>16th:</strong> Splits each beat into 4 (sixteenth notes).</li>
                                    <li><strong>16th 3:</strong> Splits each beat into 6 (sextuplets).</li>
                                </ul>
                            </div>
                        }
                    />
                </div>
                <SubdivisionRadioButtons value={subdivisionMode} onChange={setSubdivisionMode} />
            </div>

            <VisualIndicator ref={visualIndicatorRef} active={beatActive} onTap={handleTapTempo} />

            <div style={{ marginTop: styles.spacing.margin.section }}>
                <ToggleButton isRunning={isRunning} disabled={isRamping} onToggle={handleToggle} />
            </div>
        </div>
    );
}

