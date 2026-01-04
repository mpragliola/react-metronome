import React from 'react';
import { useMetronome } from './hooks/useMetronome.js';
import { MetronomePanel } from './components/MetronomePanel.js';
import { RampPanel } from './components/RampPanel.js';
import { styles } from './styles.js';

function App() {
    const metronome = useMetronome();

    const bodyStyle: React.CSSProperties = {
        ...styles.components.base,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: styles.colors.backgroundDark,
        padding: '20px',
        margin: 0,
        boxSizing: 'border-box',
    };

    const panelsWrapperStyle: React.CSSProperties = {
        display: 'flex',
        gap: styles.spacing.gap,
        alignItems: 'stretch',
    };

    return (
        <>
            <style>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    margin: 0;
                    padding: 0;
                }
            `}</style>
            <div style={bodyStyle}>
                <div style={panelsWrapperStyle}>
                    <MetronomePanel metronome={metronome} />
                    <RampPanel metronome={metronome} />
                </div>
            </div>
        </>
    );
}

export default App;

