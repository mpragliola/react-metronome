import { describe, it, expect } from 'vitest';
import { clamp } from './validation.js';

describe('validation utilities', () => {
    describe('clamp', () => {
        it('returns value when within bounds', () => {
            expect(clamp(50, 0, 100)).toBe(50);
        });

        it('clamps value to minimum when below min', () => {
            expect(clamp(-10, 0, 100)).toBe(0);
        });

        it('clamps value to maximum when above max', () => {
            expect(clamp(150, 0, 100)).toBe(100);
        });

        it('handles value equal to minimum', () => {
            expect(clamp(0, 0, 100)).toBe(0);
        });

        it('handles value equal to maximum', () => {
            expect(clamp(100, 0, 100)).toBe(100);
        });

        it('handles negative ranges', () => {
            expect(clamp(-5, -10, -1)).toBe(-5);
            expect(clamp(-15, -10, -1)).toBe(-10);
            expect(clamp(0, -10, -1)).toBe(-1);
        });

        it('handles decimal values', () => {
            expect(clamp(0.5, 0, 1)).toBe(0.5);
            expect(clamp(-0.5, 0, 1)).toBe(0);
            expect(clamp(1.5, 0, 1)).toBe(1);
        });

        it('handles very small ranges', () => {
            expect(clamp(0.5, 0.4, 0.6)).toBe(0.5);
            expect(clamp(0.3, 0.4, 0.6)).toBe(0.4);
            expect(clamp(0.7, 0.4, 0.6)).toBe(0.6);
        });

        it('handles BPM range (40-280)', () => {
            expect(clamp(120, 40, 280)).toBe(120);
            expect(clamp(30, 40, 280)).toBe(40);
            expect(clamp(300, 40, 280)).toBe(280);
        });

        it('handles volume range (0-1)', () => {
            expect(clamp(0.5, 0, 1)).toBe(0.5);
            expect(clamp(-0.1, 0, 1)).toBe(0);
            expect(clamp(1.1, 0, 1)).toBe(1);
        });

        it('handles when min equals max', () => {
            expect(clamp(5, 10, 10)).toBe(10);
            expect(clamp(15, 10, 10)).toBe(10);
        });
    });
});

