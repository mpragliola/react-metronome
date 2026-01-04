import { describe, it, expect } from 'vitest';
import { bpmToMs, msToBpm, calculateBeatInterval, calculateAverageInterval } from './timing.js';
import { FEEL_MULTIPLIERS } from '../constants.js';

describe('timing utilities', () => {
    describe('bpmToMs', () => {
        it('converts 60 BPM to 1000ms', () => {
            expect(bpmToMs(60)).toBe(1000);
        });

        it('converts 120 BPM to 500ms', () => {
            expect(bpmToMs(120)).toBe(500);
        });

        it('converts 240 BPM to 250ms', () => {
            expect(bpmToMs(240)).toBe(250);
        });

        it('handles decimal BPM values', () => {
            expect(bpmToMs(100.5)).toBeCloseTo(597.01, 2);
        });

        it('handles very slow tempos', () => {
            expect(bpmToMs(40)).toBe(1500);
        });

        it('handles very fast tempos', () => {
            expect(bpmToMs(280)).toBeCloseTo(214.29, 2);
        });
    });

    describe('msToBpm', () => {
        it('converts 1000ms to 60 BPM', () => {
            expect(msToBpm(1000)).toBe(60);
        });

        it('converts 500ms to 120 BPM', () => {
            expect(msToBpm(500)).toBe(120);
        });

        it('converts 250ms to 240 BPM', () => {
            expect(msToBpm(250)).toBe(240);
        });

        it('rounds to nearest integer', () => {
            expect(msToBpm(333)).toBe(180); // 180.18... rounds to 180
        });

        it('handles very slow intervals', () => {
            expect(msToBpm(1500)).toBe(40);
        });

        it('handles very fast intervals', () => {
            expect(msToBpm(214)).toBe(280); // 280.37... rounds to 280
        });
    });

    describe('calculateBeatInterval', () => {
        it('calculates normal feel interval correctly', () => {
            const bpm = 120;
            const interval = calculateBeatInterval(bpm, 'normal');
            expect(interval).toBe(500); // 120 BPM = 500ms, normal = 1.0x
        });

        it('calculates double feel interval correctly', () => {
            const bpm = 120;
            const interval = calculateBeatInterval(bpm, 'double');
            expect(interval).toBe(250); // 120 BPM = 500ms, double = 0.5x
        });

        it('calculates half feel interval correctly', () => {
            const bpm = 120;
            const interval = calculateBeatInterval(bpm, 'half');
            expect(interval).toBe(1000); // 120 BPM = 500ms, half = 2.0x
        });

        it('handles different BPM values with normal feel', () => {
            expect(calculateBeatInterval(60, 'normal')).toBe(1000);
            expect(calculateBeatInterval(240, 'normal')).toBe(250);
        });

        it('handles different BPM values with double feel', () => {
            expect(calculateBeatInterval(60, 'double')).toBe(500);
            expect(calculateBeatInterval(240, 'double')).toBe(125);
        });

        it('handles different BPM values with half feel', () => {
            expect(calculateBeatInterval(60, 'half')).toBe(2000);
            expect(calculateBeatInterval(240, 'half')).toBe(500);
        });

        it('defaults to normal feel for unknown feel modes', () => {
            const interval = calculateBeatInterval(120, 'unknown' as any);
            expect(interval).toBe(500); // Should use normal multiplier (1.0)
        });
    });

    describe('calculateAverageInterval', () => {
        it('returns 0 for empty array', () => {
            expect(calculateAverageInterval([])).toBe(0);
        });

        it('returns 0 for single timestamp', () => {
            expect(calculateAverageInterval([1000])).toBe(0);
        });

        it('calculates average for two timestamps', () => {
            const timestamps = [1000, 2000];
            expect(calculateAverageInterval(timestamps)).toBe(1000);
        });

        it('calculates average for multiple timestamps', () => {
            const timestamps = [1000, 2000, 3000, 4000];
            // Intervals: 1000, 1000, 1000
            // Average: 1000
            expect(calculateAverageInterval(timestamps)).toBe(1000);
        });

        it('calculates average for irregular intervals', () => {
            const timestamps = [1000, 1500, 2500, 4000];
            // Intervals: 500, 1000, 1500
            // Average: (500 + 1000 + 1500) / 3 = 1000
            expect(calculateAverageInterval(timestamps)).toBe(1000);
        });

        it('handles decimal intervals', () => {
            const timestamps = [1000, 1500.5, 2001, 2501.5];
            // Intervals: 500.5, 500.5, 500.5
            // Average: 500.5
            expect(calculateAverageInterval(timestamps)).toBeCloseTo(500.5, 1);
        });

        it('handles large timestamp arrays', () => {
            const timestamps = [1000, 2000, 3000, 4000, 5000, 6000];
            // All intervals are 1000
            expect(calculateAverageInterval(timestamps)).toBe(1000);
        });
    });
});

