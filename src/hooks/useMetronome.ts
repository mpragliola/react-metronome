import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react';
import { Metronome } from '../metronome.js';
import { FeelMode, SubdivisionMode } from '../types.js';
import { CONSTANTS } from '../constants.js';

export interface UseMetronomeReturn {
    bpm: number;
    volume: number;
    accentPattern: number;
    subdivisionMode: SubdivisionMode;
    feel: FeelMode;
    isRunning: boolean;
    isRamping: boolean;
    beatActive: boolean;
    currentRampStepIndex: number | null;
    setBpm: (bpm: number) => void;
    setVolume: (volume: number) => void;
    setAccentPattern: (pattern: number) => void;
    setSubdivisionMode: (mode: SubdivisionMode) => void;
    setFeel: (feel: FeelMode) => void;
    start: () => Promise<void>;
    stop: () => void;
    handleTapTempo: () => number | null;
    startRamp: (startBpm: number, targetBpm: number, increment: number, durationSeconds: number) => boolean;
    startAlternatingRamp: (startBpm: number, targetBpm: number, positiveStep: number, negativeStep: number, multiplier: number, measuresPerStep: number) => boolean;
    cancelRamp: () => void;
}

// Helper hook to subscribe to a specific metronome property via events
function useMetronomeProperty<T>(
    metronome: Metronome | null,
    eventName: string,
    getValue: (m: Metronome) => T,
    defaultValue: T
): T {
    return useSyncExternalStore(
        (onStoreChange) => {
            if (!metronome) return () => { };
            const handler = () => onStoreChange();
            metronome.addEventListener(eventName, handler);
            return () => metronome.removeEventListener(eventName, handler);
        },
        () => metronome ? getValue(metronome) : defaultValue,
        () => defaultValue
    );
}

export function useMetronome(): UseMetronomeReturn {
    const metronomeRef = useRef<Metronome | null>(null);
    const [metronome, setMetronome] = useState<Metronome | null>(null);
    const [isRamping, setIsRamping] = useState(false);
    const [beatActive, setBeatActive] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [currentRampStepIndex, setCurrentRampStepIndex] = useState<number | null>(null);

    // Initialize metronome
    useEffect(() => {
        const metronomeInstance = new Metronome();
        metronomeRef.current = metronomeInstance;
        setMetronome(metronomeInstance);

        // Handle state changes that need special logic
        const handleStateChanged = ((e: Event) => {
            setIsRunning((e as CustomEvent<{ isRunning: boolean }>).detail.isRunning);
        }) as EventListener;
        const handleRampStart = () => setIsRamping(true);
        const handleRampEnd = () => {
            setIsRamping(false);
            setCurrentRampStepIndex(null);
        };
        const handleRampStepChanged = ((e: Event) => {
            const event = e as CustomEvent<{ stepIndex: number }>;
            setCurrentRampStepIndex(event.detail.stepIndex);
        }) as EventListener;
        const handleBeat = () => {
            setBeatActive(true);
            setTimeout(() => setBeatActive(false), CONSTANTS.UI.VISUAL_INDICATOR_ACTIVE_DURATION_MS);
        };

        metronomeInstance.addEventListener(CONSTANTS.EVENTS.STATE_CHANGED, handleStateChanged);
        metronomeInstance.addEventListener(CONSTANTS.EVENTS.RAMP_START, handleRampStart);
        metronomeInstance.addEventListener(CONSTANTS.EVENTS.RAMP_COMPLETE, handleRampEnd);
        metronomeInstance.addEventListener(CONSTANTS.EVENTS.RAMP_CANCELLED, handleRampEnd);
        metronomeInstance.addEventListener(CONSTANTS.EVENTS.RAMP_STEP_CHANGED, handleRampStepChanged);
        metronomeInstance.addEventListener(CONSTANTS.EVENTS.BEAT, handleBeat);

        // Initialize isRunning state
        setIsRunning(false);

        return () => {
            metronomeInstance.removeEventListener(CONSTANTS.EVENTS.STATE_CHANGED, handleStateChanged);
            metronomeInstance.removeEventListener(CONSTANTS.EVENTS.RAMP_START, handleRampStart);
            metronomeInstance.removeEventListener(CONSTANTS.EVENTS.RAMP_COMPLETE, handleRampEnd);
            metronomeInstance.removeEventListener(CONSTANTS.EVENTS.RAMP_CANCELLED, handleRampEnd);
            metronomeInstance.removeEventListener(CONSTANTS.EVENTS.RAMP_STEP_CHANGED, handleRampStepChanged);
            metronomeInstance.removeEventListener(CONSTANTS.EVENTS.BEAT, handleBeat);
            metronomeInstance.dispose();
            metronomeRef.current = null;
            setMetronome(null);
        };
    }, []);

    // Subscribe to metronome state using useSyncExternalStore
    const bpm = useMetronomeProperty(metronome, CONSTANTS.EVENTS.BPM_CHANGED, (m) => m.getBpm(), CONSTANTS.BPM.DEFAULT);
    const volume = useMetronomeProperty(metronome, CONSTANTS.EVENTS.VOLUME_CHANGED, (m) => m.getVolume(), CONSTANTS.VOLUME.DEFAULT);
    const accentPattern = useMetronomeProperty(metronome, CONSTANTS.EVENTS.ACCENT_PATTERN_CHANGED, (m) => m.getAccentPattern(), CONSTANTS.ACCENT.DEFAULT);
    const subdivisionMode = useMetronomeProperty(metronome, CONSTANTS.EVENTS.SUBDIVISION_MODE_CHANGED, (m) => m.getSubdivisionMode(), 'no');
    const feel = useMetronomeProperty(metronome, CONSTANTS.EVENTS.FEEL_CHANGED, (m) => m.getFeel(), 'normal');

    // Setter functions - simplified by directly calling metronome methods
    const setBpm = useCallback((newBpm: number) => {
        metronomeRef.current?.setBpm(newBpm);
    }, []);

    const setVolume = useCallback((newVolume: number) => {
        metronomeRef.current?.setVolume(newVolume);
    }, []);

    const setAccentPattern = useCallback((pattern: number) => {
        metronomeRef.current?.setAccentPattern(pattern);
    }, []);

    const setSubdivisionMode = useCallback((mode: SubdivisionMode) => {
        metronomeRef.current?.setSubdivisionMode(mode);
    }, []);

    const setFeel = useCallback((newFeel: FeelMode) => {
        metronomeRef.current?.setFeel(newFeel);
    }, []);

    const start = useCallback(async () => {
        await metronomeRef.current?.start();
    }, []);

    const stop = useCallback(() => {
        metronomeRef.current?.stop();
    }, []);

    const handleTapTempo = useCallback(() => {
        return metronomeRef.current?.handleTapTempo() ?? null;
    }, []);

    const startRamp = useCallback((startBpm: number, targetBpm: number, increment: number, durationSeconds: number) => {
        return metronomeRef.current?.startRamp(startBpm, targetBpm, increment, durationSeconds) ?? false;
    }, []);

    const startAlternatingRamp = useCallback((startBpm: number, targetBpm: number, positiveStep: number, negativeStep: number, multiplier: number, measuresPerStep: number) => {
        return metronomeRef.current?.startAlternatingRamp(startBpm, targetBpm, positiveStep, negativeStep, multiplier, measuresPerStep) ?? false;
    }, []);

    const cancelRamp = useCallback(() => {
        metronomeRef.current?.cancelRamp();
    }, []);

    return {
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
        startRamp,
        startAlternatingRamp,
        cancelRamp,
        beatActive,
        currentRampStepIndex,
    };
}

