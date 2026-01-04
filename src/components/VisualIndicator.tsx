import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { CONSTANTS } from '../constants.js';
import { styles } from '../styles.js';

interface VisualIndicatorProps {
    active: boolean;
    onTap: () => void;
}

export interface VisualIndicatorRef {
    triggerTap: () => void;
}

export const VisualIndicator = forwardRef<VisualIndicatorRef, VisualIndicatorProps>(
    ({ active, onTap }, ref) => {
        const [isActive, setIsActive] = useState(false);
        const [isTapped, setIsTapped] = useState(false);

        useEffect(() => {
            if (active) {
                setIsActive(true);
                const timeoutId = setTimeout(() => {
                    setIsActive(false);
                }, CONSTANTS.UI.VISUAL_INDICATOR_ACTIVE_DURATION_MS);
                return () => clearTimeout(timeoutId);
            } else {
                setIsActive(false);
            }
        }, [active]);

        const triggerTapAnimation = () => {
            setIsTapped(true);
            setTimeout(() => {
                setIsTapped(false);
            }, 150);
        };

        useImperativeHandle(ref, () => ({
            triggerTap: triggerTapAnimation,
        }));

        const handleTap = () => {
            triggerTapAnimation();
            onTap();
        };

        const getBackgroundColor = () => {
            if (isTapped) return styles.colors.accent;
            if (isActive) return styles.colors.accent;
            return styles.colors.primary;
        };

        const getTransform = () => {
            if (isTapped) return 'scale(1.3)';
            if (isActive) return 'scale(1.2)';
            return 'scale(1)';
        };

        const getTransition = () => {
            if (isTapped) {
                // Fast ease-in when tapping
                return 'transform 50ms cubic-bezier(0.4, 0, 1, 1), background-color 50ms cubic-bezier(0.4, 0, 1, 1)';
            } else {
                // Slower ease-out when returning
                return 'transform 150ms cubic-bezier(0, 0, 0.2, 1), background-color 150ms cubic-bezier(0, 0, 0.2, 1)';
            }
        };

        return (
            <div
                onClick={handleTap}
                style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: getBackgroundColor(),
                    margin: `${styles.spacing.margin.section} auto`,
                    transition: getTransition(),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: styles.colors.white,
                    fontSize: '1em',
                    fontWeight: 'bold',
                    transform: getTransform(),
                    cursor: 'pointer',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                }}
            >
                ●
            </div>
        );
    });

