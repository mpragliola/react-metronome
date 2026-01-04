import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { styles } from '../styles.js';

interface HelpIconProps {
    content: React.ReactNode;
    title?: string;
}

export function HelpIcon({ content, title }: HelpIconProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={handleClick}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    margin: '0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '14px',
                    height: '14px',
                    marginLeft: styles.spacing.margin.xs,
                    transition: 'all 0.2s',
                    color: styles.colors.textLight,
                    opacity: 0.3,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.color = styles.colors.primary;
                    e.currentTarget.style.transform = 'scale(1.15)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.3';
                    e.currentTarget.style.color = styles.colors.textLight;
                    e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Show help"
            >
                <i className="far fa-circle-question" style={{ fontSize: '12px' }}></i>
            </button>
            {isOpen && createPortal(
                <HelpModal
                    title={title}
                    content={content}
                    onClose={handleClose}
                />,
                document.body
            )}
        </>
    );
}

interface HelpModalProps {
    title?: string;
    content: React.ReactNode;
    onClose: () => void;
}

function HelpModal({ title, content, onClose }: HelpModalProps) {
    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: '20px',
        zIndex: 1000,
    };

    const modalStyle: React.CSSProperties = {
        background: 'white',
        borderRadius: '8px',
        padding: styles.spacing.xl,
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        margin: styles.spacing.xl,
        fontFamily: styles.fonts.family,
    };

    const closeButtonStyle: React.CSSProperties = {
        position: 'absolute',
        top: styles.spacing.md,
        right: styles.spacing.md,
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: styles.colors.textLight,
        padding: '0',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        transition: 'all 0.2s',
    };

    return (
        <div
            style={overlayStyle}
            onClick={onClose}
        >
            <div
                style={modalStyle}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={closeButtonStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                        e.currentTarget.style.color = styles.colors.text;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = styles.colors.textLight;
                    }}
                    title="Close"
                >
                    ×
                </button>
                {title && (
                    <h2 style={{
                        ...styles.components.heading,
                        marginTop: 0,
                        marginBottom: styles.spacing.margin.lg,
                        fontSize: '1.2em',
                        textAlign: 'left',
                        fontWeight: 600,
                        fontFamily: styles.fonts.family,
                    }}>
                        {title}
                    </h2>
                )}
                <div style={{
                    color: styles.colors.text,
                    lineHeight: '1.6',
                    fontSize: '0.9em',
                    textAlign: 'left',
                    fontFamily: styles.fonts.family,
                }}>
                    {content}
                </div>
            </div>
        </div>
    );
}

