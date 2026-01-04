import { CONSTANTS } from './constants.js';

/**
 * Configuration for audio tone generation
 */
export interface ToneConfig {
    isAccent: boolean;
    volume: number;
    volumeMultiplier: number;
}

/**
 * Audio generator using Web Audio API
 * Handles creation of metronome click sounds with envelope shaping
 */
export class AudioGenerator {
    private audioContext: AudioContext | null = null;

    /**
     * Initialize the audio context (lazy initialization)
     */
    private getAudioContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioContext;
    }

    /**
     * Creates a metronome click tone with configurable parameters
     * @param config Tone configuration
     */
    createTone(config: ToneConfig, scheduleTime?: number): void {
        const { isAccent, volume, volumeMultiplier } = config;
        const ctx = this.getAudioContext();

        // Create audio nodes
        const oscillator = ctx.createOscillator();
        const envelopeGain = ctx.createGain();
        const volumeGain = ctx.createGain();

        // Connect audio graph
        oscillator.connect(envelopeGain);
        envelopeGain.connect(volumeGain);
        volumeGain.connect(ctx.destination);

        // Configure oscillator
        oscillator.frequency.value = isAccent
            ? CONSTANTS.AUDIO.ACCENT_FREQUENCY
            : CONSTANTS.AUDIO.REGULAR_FREQUENCY;
        oscillator.type = 'sine';

        // Use provided schedule time or current time with small lookahead
        const now = scheduleTime ?? (ctx.currentTime + 0.01); // 10ms lookahead if not specified
        this.applyEnvelope(envelopeGain, now);

        // Apply volume (separate from envelope to maintain shape)
        volumeGain.gain.setValueAtTime(volume * volumeMultiplier, now);

        // Schedule playback
        oscillator.start(now);
        oscillator.stop(now + CONSTANTS.AUDIO.TONE_DURATION);
    }

    /**
     * Applies an AD envelope to the gain node
     */
    private applyEnvelope(gainNode: GainNode, startTime: number): void {
        const { AUDIO } = CONSTANTS;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(
            AUDIO.ENVELOPE_PEAK,
            startTime + AUDIO.ENVELOPE_ATTACK_TIME
        );
        gainNode.gain.exponentialRampToValueAtTime(
            AUDIO.ENVELOPE_DECAY_END,
            startTime + AUDIO.ENVELOPE_DECAY_TIME
        );
    }

    /**
     * Get the audio context (for scheduling purposes)
     */
    getContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioContext;
    }

    /**
     * Resume audio context if suspended (required after user interaction)
     */
    async resume(): Promise<void> {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    /**
     * Dispose of audio context (cleanup)
     */
    dispose(): void {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}
