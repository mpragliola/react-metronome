import { FeelMode } from '../types.js';
import { FEEL_MULTIPLIERS } from '../constants.js';

/**
 * Converts BPM to milliseconds per beat
 */
export function bpmToMs(bpm: number): number {
    return (60 / bpm) * 1000;
}

/**
 * Converts milliseconds to BPM
 */
export function msToBpm(ms: number): number {
    return Math.round((60 * 1000) / ms);
}

/**
 * Calculates beat interval with feel multiplier applied
 */
export function calculateBeatInterval(bpm: number, feel: FeelMode): number {
    const baseInterval = bpmToMs(bpm);
    const multiplier = FEEL_MULTIPLIERS[feel] ?? FEEL_MULTIPLIERS.normal;
    return baseInterval * multiplier;
}

/**
 * Calculates average interval from an array of timestamps
 */
export function calculateAverageInterval(timestamps: number[]): number {
    if (timestamps.length < 2) {
        return 0;
    }

    const intervals = timestamps.slice(1).map((time, i) => time - timestamps[i]);
    return intervals.reduce((a, b) => a + b, 0) / intervals.length;
}

