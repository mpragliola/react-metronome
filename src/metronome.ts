import { FeelMode, SubdivisionMode } from './types.js';
import { AudioGenerator, ToneConfig } from './audio.js';
import { clamp } from './utils/validation.js';
import { bpmToMs, msToBpm, calculateBeatInterval, calculateAverageInterval } from './utils/timing.js';
import { CONSTANTS } from './constants.js';

/**
 * Metronome engine with event-driven architecture
 * Uses native EventTarget API for event handling
 */
export class Metronome extends EventTarget {
    private audioGenerator: AudioGenerator;
    private intervalId: number | null = null;
    private isRunning: boolean = false;
    private bpm: number;
    private beatInterval: number = 0;
    private volume: number;
    private accentPattern: number;
    private beatCounter: number = 0;
    private subdivisionMode: SubdivisionMode = 'no';
    private subdivisionTimeoutIds: number[] = [];
    private feel: FeelMode = 'normal';
    private tapTimes: number[] = [];
    private tapTimeoutId: number | null = null;
    private rampIntervalId: ReturnType<typeof setTimeout> | null = null;
    private alternatingRampMultiplier: number | null = null;
    private currentRampStepIndex: number | null = null;

    constructor(
        initialBpm: number = CONSTANTS.BPM.DEFAULT,
        initialVolume: number = CONSTANTS.VOLUME.DEFAULT,
        initialAccent: number = CONSTANTS.ACCENT.DEFAULT
    ) {
        super();
        this.audioGenerator = new AudioGenerator();
        this.bpm = clamp(initialBpm, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX);
        this.volume = clamp(initialVolume, CONSTANTS.VOLUME.MIN, CONSTANTS.VOLUME.MAX);
        this.accentPattern = clamp(initialAccent, CONSTANTS.ACCENT.MIN, CONSTANTS.ACCENT.MAX);
        this.updateBeatInterval();
    }

    /**
     * Set BPM with validation and emit event
     */
    setBpm(bpm: number): void {
        const clampedBpm = clamp(bpm, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX);
        if (this.bpm !== clampedBpm) {
            this.bpm = clampedBpm;
            this.updateBeatInterval();
            this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.BPM_CHANGED, { detail: { bpm: this.bpm } }));
        }
    }

    getBpm(): number {
        return this.bpm;
    }

    /**
     * Start a BPM ramp with high-level parameters
     * Calculates step intervals internally based on total duration
     * @param startBpm Starting BPM (will be set if different from current)
     * @param targetBpm Target BPM to reach
     * @param incrementPerStep How much to change BPM per step
     * @param durationSeconds Total duration for the entire ramp in seconds
     * @returns true if ramp was started, false if invalid parameters
     */
    startRamp(startBpm: number, targetBpm: number, incrementPerStep: number, durationSeconds: number): boolean {
        // Set start BPM if different from current
        const clampedStartBpm = clamp(startBpm, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX);
        if (Math.abs(this.bpm - clampedStartBpm) > 0.1) {
            this.setBpm(clampedStartBpm);
        }

        // Calculate ramp parameters
        const clampedTargetBpm = clamp(targetBpm, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX);
        const bpmDifference = Math.abs(clampedTargetBpm - clampedStartBpm);

        if (bpmDifference < 0.1) {
            return false; // Already at target
        }

        const steps = Math.ceil(bpmDifference / incrementPerStep);
        const stepIntervalMs = steps > 0 ? (durationSeconds * 1000) / steps : 1000;
        const clampedInterval = Math.max(100, Math.min(stepIntervalMs, 10000)); // Between 100ms and 10s

        // Start the ramp
        this.rampToBpm(clampedTargetBpm, incrementPerStep, clampedInterval);
        return true;
    }

    /**
     * Gradually transition BPM to a target value using incremental steps
     * @param targetBpm Target BPM to reach
     * @param incrementPerStep How much to change BPM per step
     * @param stepIntervalMs How often to update BPM in milliseconds (default: 1000ms = 1 second per step)
     */
    rampToBpm(targetBpm: number, incrementPerStep: number, stepIntervalMs: number = 1000): void {
        // Cancel any existing ramp
        const wasRamping = this.isRamping();
        this.cancelRamp();

        const clampedTarget = clamp(targetBpm, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX);
        const startBpm = this.bpm;
        const bpmDifference = clampedTarget - startBpm;

        // If already at target, do nothing
        if (Math.abs(bpmDifference) < 0.1) {
            return;
        }

        // Emit ramp start event if not already ramping
        if (!wasRamping) {
            this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.RAMP_START));
        }

        const direction = bpmDifference > 0 ? 1 : -1;
        const clampedIncrement = Math.abs(incrementPerStep);

        this.rampIntervalId = window.setInterval(() => {
            const currentBpm = this.bpm;
            const remaining = Math.abs(clampedTarget - currentBpm);

            // Check if we've reached or would pass the target
            if (remaining < clampedIncrement) {
                this.setBpm(clampedTarget);
                this.cancelRamp();
                this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.RAMP_COMPLETE, { detail: { bpm: clampedTarget } }));
            } else {
                const newBpm = currentBpm + (direction * clampedIncrement);
                this.setBpm(newBpm);
            }
        }, stepIntervalMs);
    }

    /**
     * Start an alternating ramp that oscillates between positive and negative steps
     * @param startBpm Starting BPM
     * @param targetBpm Target BPM to reach
     * @param positiveStep Positive step value (must be > negativeStep)
     * @param negativeStep Negative step value (must be < positiveStep)
     * @param measuresPerStep Number of measures (beats) per step
     * @returns true if ramp was started, false if invalid parameters
     */
    startAlternatingRamp(
        startBpm: number,
        targetBpm: number,
        positiveStep: number,
        negativeStep: number,
        multiplier: number,
        measuresPerStep: number
    ): boolean {
        // Validate that (multiplier * positiveStep) > negativeStep (net positive per cycle) and measures >= 1
        if ((multiplier * positiveStep) <= negativeStep || positiveStep <= 0 || negativeStep <= 0 ||
            multiplier <= 0 || measuresPerStep < 1 ||
            !Number.isInteger(positiveStep) || !Number.isInteger(negativeStep) ||
            !Number.isInteger(multiplier) || !Number.isInteger(measuresPerStep)) {
            return false;
        }

        // Cancel any existing ramp
        const wasRamping = this.isRamping();
        this.cancelRamp();

        // Set start BPM if different from current
        const clampedStartBpm = clamp(startBpm, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX);
        if (Math.abs(this.bpm - clampedStartBpm) > 0.1) {
            this.setBpm(clampedStartBpm);
        }

        const clampedTargetBpm = clamp(targetBpm, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX);
        const bpmDifference = clampedTargetBpm - clampedStartBpm;

        if (bpmDifference <= 0) {
            return false; // Target must be greater than start
        }

        // Emit ramp start event if not already ramping
        if (!wasRamping) {
            this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.RAMP_START));
        }

        // Store ramp parameters for step tracking
        this.alternatingRampMultiplier = multiplier;
        this.currentRampStepIndex = 0;
        this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.RAMP_STEP_CHANGED, { detail: { stepIndex: 0 } }));

        let stepCount = 0;
        let currentBpmValue = clampedStartBpm;

        const scheduleNextStep = () => {
            if (this.rampIntervalId === null) {
                return; // Ramp was cancelled
            }

            // Calculate which step in the cycle: 0 to (multiplier-1) are positive, multiplier is negative
            const cyclePosition = stepCount % (multiplier + 1);
            const isPositiveStep = cyclePosition < multiplier;
            const stepValue = isPositiveStep ? positiveStep : -negativeStep;
            currentBpmValue += stepValue;

            // Update and emit step index
            this.currentRampStepIndex = cyclePosition;
            this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.RAMP_STEP_CHANGED, { detail: { stepIndex: cyclePosition } }));

            // Clamp to valid BPM range
            currentBpmValue = clamp(currentBpmValue, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX);
            this.setBpm(currentBpmValue);

            // Check if we've reached or exceeded the target
            if (currentBpmValue >= clampedTargetBpm) {
                this.setBpm(clampedTargetBpm);
                this.currentRampStepIndex = null;
                this.alternatingRampMultiplier = null;
                this.cancelRamp();
                this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.RAMP_COMPLETE, { detail: { bpm: clampedTargetBpm } }));
            } else {
                stepCount++;
                // Calculate interval based on current BPM and measures per step
                // A measure contains beats equal to the accent pattern (beats per measure)
                const beatIntervalMs = bpmToMs(currentBpmValue);
                const beatsPerMeasure = this.accentPattern;
                const beatsPerStep = measuresPerStep * beatsPerMeasure;
                const stepIntervalMs = beatIntervalMs * beatsPerStep;
                // Clamp interval to reasonable bounds (100ms to 10s)
                const clampedInterval = Math.max(100, Math.min(stepIntervalMs, 10000));
                this.rampIntervalId = window.setTimeout(scheduleNextStep, clampedInterval);
            }
        };

        // Calculate initial interval based on start BPM
        // A measure contains beats equal to the accent pattern (beats per measure)
        const initialBeatIntervalMs = bpmToMs(clampedStartBpm);
        const beatsPerMeasure = this.accentPattern;
        const initialBeatsPerStep = measuresPerStep * beatsPerMeasure;
        const initialStepIntervalMs = initialBeatIntervalMs * initialBeatsPerStep;
        const clampedInitialInterval = Math.max(100, Math.min(initialStepIntervalMs, 10000));
        this.rampIntervalId = window.setTimeout(scheduleNextStep, clampedInitialInterval);

        return true;
    }

    /**
     * Cancel any active BPM ramp
     */
    cancelRamp(): void {
        if (this.rampIntervalId !== null) {
            clearTimeout(this.rampIntervalId);
            this.rampIntervalId = null;
            this.currentRampStepIndex = null;
            this.alternatingRampMultiplier = null;
            this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.RAMP_CANCELLED));
        }
    }

    /**
     * Get the current alternating ramp step index (0 to multiplier)
     * Returns null if not ramping or not an alternating ramp
     */
    getCurrentRampStepIndex(): number | null {
        return this.currentRampStepIndex;
    }

    /**
     * Check if a BPM ramp is currently active
     */
    isRamping(): boolean {
        return this.rampIntervalId !== null;
    }

    /**
     * Set volume with validation and emit event
     */
    setVolume(volume: number): void {
        const clampedVolume = clamp(volume, CONSTANTS.VOLUME.MIN, CONSTANTS.VOLUME.MAX);
        if (this.volume !== clampedVolume) {
            this.volume = clampedVolume;
            this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.VOLUME_CHANGED, { detail: { volume: this.volume } }));
        }
    }

    getVolume(): number {
        return this.volume;
    }

    /**
     * Set accent pattern with validation and emit event
     */
    setAccentPattern(accent: number): void {
        const clampedAccent = clamp(accent, CONSTANTS.ACCENT.MIN, CONSTANTS.ACCENT.MAX);
        if (this.accentPattern !== clampedAccent) {
            this.accentPattern = clampedAccent;
            if (this.isRunning) {
                this.beatCounter = 0;
            }
            this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.ACCENT_PATTERN_CHANGED, { detail: { pattern: this.accentPattern } }));
        }
    }

    getAccentPattern(): number {
        return this.accentPattern;
    }

    /**
     * Set subdivision mode and emit event
     */
    setSubdivisionMode(mode: SubdivisionMode): void {
        if (this.subdivisionMode !== mode) {
            this.subdivisionMode = mode;
            this.clearSubdivisionTimeouts();
            this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.SUBDIVISION_MODE_CHANGED, { detail: { mode: this.subdivisionMode } }));
        }
    }

    getSubdivisionMode(): SubdivisionMode {
        return this.subdivisionMode;
    }

    /**
     * Set feel mode and emit event
     */
    setFeel(feel: FeelMode): void {
        if (this.feel !== feel) {
            this.feel = feel;
            this.updateBeatInterval();
            this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.FEEL_CHANGED, { detail: { feel: this.feel } }));
        }
    }

    getFeel(): FeelMode {
        return this.feel;
    }

    /**
     * Handle tap tempo input
     * @returns Calculated BPM or null if insufficient taps
     */
    handleTapTempo(): number | null {
        const now = Date.now();

        // Clear existing timeout
        if (this.tapTimeoutId !== null) {
            clearTimeout(this.tapTimeoutId);
        }

        // Add current tap
        this.tapTimes.push(now);

        // Keep only recent taps
        if (this.tapTimes.length > CONSTANTS.TAP_TEMPO.MAX_TAPS) {
            this.tapTimes.shift();
        }

        // Calculate BPM if we have enough taps
        if (this.tapTimes.length >= CONSTANTS.TAP_TEMPO.MIN_TAPS_REQUIRED) {
            try {
                const averageInterval = calculateAverageInterval(this.tapTimes);
                const tappedBpm = msToBpm(averageInterval);
                const newBpm = clamp(tappedBpm, CONSTANTS.BPM.MIN, CONSTANTS.BPM.MAX);

                this.setBpm(newBpm);
                return newBpm;
            } catch (error) {
                this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.ERROR, {
                    detail: {
                        error: error instanceof Error ? error : new Error(String(error)),
                        context: 'tapTempo',
                    }
                }));
                return null;
            }
        }

        // Reset taps after timeout
        this.tapTimeoutId = window.setTimeout(() => {
            this.tapTimes = [];
            this.tapTimeoutId = null;
        }, CONSTANTS.TAP_TEMPO.RESET_TIMEOUT_MS);

        return null;
    }

    /**
     * Start the metronome
     */
    async start(): Promise<void> {
        if (this.isRunning) {
            return;
        }

        try {
            // Resume audio context if needed (required after user interaction)
            await this.audioGenerator.resume();

            this.isRunning = true;
            this.beatCounter = 0;

            this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.STATE_CHANGED, { detail: { isRunning: true } }));

            // Get audio context to schedule first beat with proper timing
            const audioContext = this.audioGenerator.getContext();

            // Schedule first beat with a small lookahead to ensure audio context is ready
            // This prevents the first beat from being misplaced due to audio context latency
            const lookaheadTime = 0.05; // 50ms lookahead in seconds
            const firstBeatTime = audioContext.currentTime + lookaheadTime;

            // Schedule first beat using audio context time for precise timing
            this.playBeat(firstBeatTime);
            // Schedule subsequent beats
            this.scheduleNextBeat();
        } catch (error) {
            this.isRunning = false;
            this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.ERROR, {
                detail: {
                    error: error instanceof Error ? error : new Error(String(error)),
                    context: 'start',
                }
            }));
        }
    }

    /**
     * Stop the metronome
     */
    stop(): void {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;
        this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.STATE_CHANGED, { detail: { isRunning: false } }));

        // Clear main interval
        if (this.intervalId !== null) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }

        // Clear subdivision timeouts
        this.clearSubdivisionTimeouts();
    }

    /**
     * Update beat interval based on current BPM and feel
     */
    private updateBeatInterval(): void {
        this.beatInterval = calculateBeatInterval(this.bpm, this.feel);
    }

    /**
     * Create and play a tone
     */
    private createTone(config: Partial<ToneConfig> = {}, scheduleTime?: number): void {
        const toneConfig: ToneConfig = {
            isAccent: config.isAccent ?? false,
            volume: config.volume ?? this.volume,
            volumeMultiplier: config.volumeMultiplier ?? 1.0,
        };
        this.audioGenerator.createTone(toneConfig, scheduleTime);
    }

    /**
     * Play a main beat
     */
    private playBeat(scheduleTime?: number): void {
        const isAccent = this.beatCounter === 0;
        this.createTone({ isAccent, volumeMultiplier: 1.0 }, scheduleTime);

        // Emit beat event
        this.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.BEAT, {
            detail: {
                isAccent,
                beatNumber: this.beatCounter,
            }
        }));

        // Update beat counter
        this.beatCounter = (this.beatCounter + 1) % this.accentPattern;

        // Schedule subdivision notes if enabled
        if (this.subdivisionMode !== 'no' && this.isRunning) {
            this.scheduleSubdivisionNotes();
        }
    }

    /**
     * Schedule subdivision notes
     */
    private scheduleSubdivisionNotes(): void {
        if (!this.isRunning || this.subdivisionMode === 'no') {
            return;
        }

        this.clearSubdivisionTimeouts();

        const callback = () => {
            if (this.isRunning && this.subdivisionMode !== 'no') {
                this.createTone({
                    isAccent: false,
                    volumeMultiplier: CONSTANTS.AUDIO.SUBDIVISION_VOLUME_MULTIPLIER,
                });
            }
        };

        switch (this.subdivisionMode) {
            case 'straight':
                this.subdivisionTimeoutIds.push(
                    window.setTimeout(callback, this.beatInterval / 2)
                );
                break;

            case 'triplet':
                this.subdivisionTimeoutIds.push(
                    window.setTimeout(callback, this.beatInterval / 3),
                    window.setTimeout(callback, (this.beatInterval * 2) / 3)
                );
                break;

            case 'sixteenth':
                for (let i = 1; i <= 3; i++) {
                    this.subdivisionTimeoutIds.push(
                        window.setTimeout(callback, (this.beatInterval * i) / 4)
                    );
                }
                break;

            case 'sixteenth-triplet':
                for (let i = 1; i <= 5; i++) {
                    this.subdivisionTimeoutIds.push(
                        window.setTimeout(callback, (this.beatInterval * i) / 6)
                    );
                }
                break;
        }
    }

    /**
     * Clear all subdivision timeouts
     */
    private clearSubdivisionTimeouts(): void {
        this.subdivisionTimeoutIds.forEach(id => clearTimeout(id));
        this.subdivisionTimeoutIds = [];
    }

    /**
     * Schedule the next beat using recursive setTimeout
     * This allows BPM changes to take effect smoothly
     */
    private scheduleNextBeat(): void {
        if (!this.isRunning) {
            return;
        }

        this.intervalId = window.setTimeout(() => {
            if (this.isRunning) {
                this.playBeat();
                this.scheduleNextBeat();
            }
        }, this.beatInterval);
    }

    /**
     * Cleanup resources
     */
    dispose(): void {
        this.stop();
        this.cancelRamp();
        this.audioGenerator.dispose();
    }
}
