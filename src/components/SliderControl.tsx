import React, { useCallback, useRef, useEffect } from 'react';
import { clamp } from '../utils/validation.js';
import { styles } from '../styles.js';

interface SliderControlProps {
    label: string;
    icon?: string;
    value: number;
    min: number;
    max: number;
    scale: number; // For converting between display and actual value (e.g., 100 for percentage)
    onChange: (value: number) => void;
}

export function SliderControl({ label, icon, value, min, max, scale, onChange }: SliderControlProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = Number(e.target.value);
        const actualValue = rawValue / scale;
        const clampedValue = clamp(actualValue, min, max);
        onChange(clampedValue);
    }, [min, max, scale, onChange]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -1 : 1;
            const step = scale === 100 ? 0.01 : 1; // Smaller steps for percentage values
            const newValue = clamp(value + delta * step, min, max);
            onChange(newValue);
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [value, min, max, scale, onChange]);

    const displayValue = scale === 100 ? `${Math.round(value * 100)}%` : value.toString();

    const sliderStyle: React.CSSProperties = {
        ...styles.components.slider,
        margin: `${styles.spacing.margin.md} 0`,
    };

    const thumbStyle = `
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${styles.colors.primary};
    cursor: pointer;
    border: none;
  `;

    return (
        <div ref={containerRef} style={{ flex: 1 }}>
            <div style={{ ...styles.components.label, marginBottom: styles.spacing.margin.sm }}>
                {icon && <i className={icon} style={{ marginRight: styles.spacing.margin.md }}></i>}
                {label}
            </div>
            <div
                style={{
                    ...styles.components.valueDisplay,
                    margin: `${styles.spacing.margin.sm} 0`,
                }}
            >
                {displayValue}
            </div>
            <style>{`
        input[type="range"]::-webkit-slider-thumb { ${thumbStyle} }
        input[type="range"]::-moz-range-thumb { ${thumbStyle} }
      `}</style>
            <input
                type="range"
                min={min * scale}
                max={max * scale}
                value={value * scale}
                onChange={handleChange}
                style={sliderStyle}
            />
        </div>
    );
}

