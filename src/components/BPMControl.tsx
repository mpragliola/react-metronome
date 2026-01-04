import React, { useCallback } from 'react';
import { clamp } from '../utils/validation.js';
import { CONSTANTS } from '../constants.js';
import { styles } from '../styles.js';
import { HelpIcon } from './HelpIcon.js';

interface BPMControlProps {
    bpm: number;
    onBpmChange: (bpm: number) => void;
}

interface BPMAdjustButtonProps {
    delta: number;
    onAdjust: (delta: number) => void;
    small?: boolean;
}

function BPMAdjustButton({ delta, onAdjust, small = false }: BPMAdjustButtonProps) {
    const sign = delta > 0 ? '+' : '';
    const title = `${delta > 0 ? 'Increase' : 'Decrease'} by ${Math.abs(delta)}`;

    return (
        <button
            onClick={() => onAdjust(delta)}
            title={title}
            style={{
                ...styles.components.button,
                ...styles.components.buttonLight,
                padding: styles.spacing.padding.md,
                fontSize: small ? '0.7em' : undefined,
                minWidth: '36px',
            }}
        >
            {sign}{delta}
        </button>
    );
}

function BPMButtonGroup({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.gap.sm }}>
            {children}
        </div>
    );
}

export function BPMControl({ bpm, onBpmChange }: BPMControlProps) {
    const adjustBpm = useCallback((delta: number) => {
        const newBpm = clamp(bpm + delta, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX);
        onBpmChange(newBpm);
    }, [bpm, onBpmChange]);

    const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onBpmChange(Number(e.target.value));
    }, [onBpmChange]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        adjustBpm(delta);
    }, [adjustBpm]);

    const sliderStyle: React.CSSProperties = {
        ...styles.components.slider,
        margin: `${styles.spacing.margin.md} 0`,
    };

    const thumbStyle = `
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${styles.colors.primary};
    cursor: pointer;
    border: none;
  `;

    return (
        <div style={{ margin: `${styles.spacing.margin.lg} 0` }}>
            <div style={{ ...styles.components.label, marginBottom: styles.spacing.margin.sm, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Beats Per Minute (BPM)
                <HelpIcon
                    title="BPM (Beats Per Minute)"
                    content={
                        <div>
                            <p>BPM controls the tempo of the metronome. Higher values mean faster tempo.</p>
                            <p><strong>Current value:</strong> {Math.round(bpm)} BPM</p>
                            <p><strong>Range:</strong> {CONSTANTS.BPM.MIN} - {CONSTANTS.BPM.MAX} BPM</p>
                            <p><strong>Controls:</strong></p>
                            <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                                <li>Use the slider to adjust</li>
                                <li>Click +/- buttons for quick adjustments</li>
                                <li>Scroll mouse wheel over the BPM display</li>
                            </ul>
                        </div>
                    }
                />
            </div>
            <div
                style={{
                    ...styles.components.valueDisplayLarge,
                    margin: `${styles.spacing.margin.md} 0`,
                }}
                onWheel={handleWheel}
            >
                {Math.round(bpm)}
            </div>
            <style>{`
        input[type="range"]::-webkit-slider-thumb { ${thumbStyle} }
        input[type="range"]::-moz-range-thumb { ${thumbStyle} }
      `}</style>
            <div style={{ display: 'flex', alignItems: 'center', gap: styles.spacing.gap.md }}>
                <BPMButtonGroup>
                    <BPMAdjustButton delta={-10} onAdjust={adjustBpm} small />
                    <BPMAdjustButton delta={-1} onAdjust={adjustBpm} />
                </BPMButtonGroup>
                <input
                    type="range"
                    min={CONSTANTS.BPM.MIN}
                    max={CONSTANTS.BPM.MAX}
                    value={bpm}
                    onChange={handleSliderChange}
                    onWheel={handleWheel}
                    style={{ ...sliderStyle, flex: 1 }}
                />
                <BPMButtonGroup>
                    <BPMAdjustButton delta={1} onAdjust={adjustBpm} />
                    <BPMAdjustButton delta={10} onAdjust={adjustBpm} small />
                </BPMButtonGroup>
            </div>
        </div>
    );
}

