import React, { useCallback, useEffect, useRef } from 'react';
import { UseMetronomeReturn } from '../hooks/useMetronome.js';
import { clamp } from '../utils/validation.js';
import { CONSTANTS } from '../constants.js';
import { BPMControl } from './BPMControl.js';
import { SliderControl } from './SliderControl.js';
import { SelectControl } from './SelectControl.js';
import { FeelRadioButtons } from './FeelRadioButtons.js';
import { SubdivisionRadioButtons } from './SubdivisionRadioButtons.js';
import { VisualIndicator, VisualIndicatorRef } from './VisualIndicator.js';
import { ToggleButton } from './ToggleButton.js';
import { styles } from '../styles.js';
import { FeelMode, SubdivisionMode } from '../types.js';

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
                <SliderControl
                    label="Accent"
                    icon="fas fa-bullseye"
                    value={accentPattern}
                    min={CONSTANTS.ACCENT.MIN}
                    max={CONSTANTS.ACCENT.MAX}
                    scale={1}
                    onChange={setAccentPattern}
                />
            </div>

            <FeelRadioButtons value={feel} onChange={setFeel} />

            <SubdivisionRadioButtons value={subdivisionMode} onChange={setSubdivisionMode} />

            <VisualIndicator ref={visualIndicatorRef} active={beatActive} onTap={handleTapTempo} />

            <div style={{ marginTop: styles.spacing.margin.section }}>
                <ToggleButton isRunning={isRunning} disabled={isRamping} onToggle={handleToggle} />
            </div>
        </div>
    );
}

