/**
 * Application-wide constants
 */
export const CONSTANTS = {
    BPM: {
        MIN: 40,
        MAX: 280,
        DEFAULT: 120,
    },
    VOLUME: {
        MIN: 0,
        MAX: 1,
        DEFAULT: 0.5,
    },
    ACCENT: {
        MIN: 1,
        MAX: 32,
        DEFAULT: 4,
    },
    TAP_TEMPO: {
        MAX_TAPS: 4,
        RESET_TIMEOUT_MS: 2000,
        MIN_TAPS_REQUIRED: 2,
    },
    AUDIO: {
        ACCENT_FREQUENCY: 1600,
        REGULAR_FREQUENCY: 800,
        ENVELOPE_PEAK: 0.8,
        ENVELOPE_ATTACK_TIME: 0.001,
        ENVELOPE_DECAY_TIME: 0.02,
        ENVELOPE_DECAY_END: 0.01,
        TONE_DURATION: 0.1,
        SUBDIVISION_VOLUME_MULTIPLIER: 0.5,
    },
    UI: {
        VISUAL_INDICATOR_ACTIVE_DURATION_MS: 50,
    },
    RAMP: {
        LINEAR: {
            INCREMENT_MIN: 0.1,
            INCREMENT_MAX: 10,
            DURATION_MIN: 1,
            DURATION_MAX: 300,
        },
        ALTERNATING: {
            MULTIPLIER_MIN: 1,
            MULTIPLIER_MAX: 10,
            STEP_MIN: 1,
            STEP_MAX: 20,
            MEASURES_MIN: 1,
            MEASURES_MAX: 32,
        },
    },
    EVENTS: {
        BEAT: 'beat',
        BPM_CHANGED: 'bpmChanged',
        RAMP_START: 'rampStart',
        RAMP_COMPLETE: 'rampComplete',
        RAMP_CANCELLED: 'rampCancelled',
        RAMP_STEP_CHANGED: 'rampStepChanged',
        STATE_CHANGED: 'stateChanged',
        ERROR: 'error',
        VOLUME_CHANGED: 'volumeChanged',
        ACCENT_PATTERN_CHANGED: 'accentPatternChanged',
        SUBDIVISION_MODE_CHANGED: 'subdivisionModeChanged',
        FEEL_CHANGED: 'feelChanged',
    },
} as const;

/**
 * Feel mode multipliers for tempo calculation
 */
export const FEEL_MULTIPLIERS: Record<string, number> = {
    normal: 1.0,
    double: 0.5,
    half: 2.0,
} as const;

