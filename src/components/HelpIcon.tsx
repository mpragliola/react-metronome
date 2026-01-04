import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { styles } from '../styles.js';

// Global style for help modal content normalization - only add once
let helpModalStyleAdded = false;

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
                    opacity: 0.6,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.color = styles.colors.primary;
                    e.currentTarget.style.transform = 'scale(1.15)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.6';
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
    // Add global style once
    useEffect(() => {
        if (!helpModalStyleAdded) {
            const style = document.createElement('style');
            style.textContent = `
                .help-modal-content-normalized,
                .help-modal-content-normalized *,
                .help-modal-content-normalized p,
                .help-modal-content-normalized ul,
                .help-modal-content-normalized li,
                .help-modal-content-normalized div,
                .help-modal-content-normalized strong,
                .help-modal-content-normalized span,
                .help-modal-content-normalized h2 {
                    font-size: 14px !important;
                    font-family: ${styles.fonts.family} !important;
                    line-height: 1.6 !important;
                }
                .help-modal-content-normalized h2 {
                    font-size: 18px !important;
                    font-weight: 600 !important;
                    margin-top: 0 !important;
                    margin-bottom: 16px !important;
                    color: ${styles.colors.primary} !important;
                }
                .help-modal-content-normalized p {
                    margin-bottom: 12px !important;
                }
                .help-modal-content-normalized ul {
                    padding-left: 20px !important;
                    margin-bottom: 12px !important;
                }
            `;
            document.head.appendChild(style);
            helpModalStyleAdded = true;
        }
    }, []);

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
        paddingLeft: '40px',
        zIndex: 9999,
    };

    const modalStyle: React.CSSProperties = {
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '450px',
        maxWidth: '90vw',
        maxHeight: '85vh',
        overflow: 'auto',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        position: 'relative',
    };

    const closeButtonStyle: React.CSSProperties = {
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#666',
        padding: '0',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        transition: 'all 0.2s',
        fontFamily: styles.fonts.family,
    };

    return (
        <div
            style={{
                ...overlayStyle,
                justifyContent: 'flex-start',
                paddingLeft: '40px',
                zIndex: 9999,
            }}
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
                <div className="help-modal-content-normalized">
                    {title && (
                        <h2 style={{
                            marginTop: 0,
                            marginBottom: '16px',
                            color: styles.colors.primary,
                            fontSize: '18px',
                            fontWeight: 600,
                            textAlign: 'left',
                            fontFamily: styles.fonts.family,
                        }}>
                            {title}
                        </h2>
                    )}
                    <div
                        style={{
                            color: '#333',
                            textAlign: 'left',
                        }}
                    >
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
}

