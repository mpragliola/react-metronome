import type { CSSProperties } from 'react';

const mainFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif";

/**
 * Spacing theme - reusable spacing values
 */
const spacing = {
  // Base spacing values
  xs: '1px',
  sm: '2px',
  md: '4px',
  lg: '6px',
  xl: '8px',
  xxl: '12px',
  // Common combinations
  gap: {
    xs: '1px',
    sm: '2px',
    md: '3px',
    lg: '4px',
    xl: '6px',
    xxl: '8px',
  },
  padding: {
    xs: '2px 3px',
    sm: '3px 4px',
    md: '3px 5px',
    lg: '4px 6px',
    xl: '4px 8px',
    xxl: '6px 12px',
  },
  margin: {
    xs: '1px',
    sm: '2px',
    md: '3px',
    lg: '4px',
    xl: '6px',
    xxl: '8px',
    section: '6px',
    sectionLarge: '8px',
  },
  // Legacy support
  borderRadius: '8px',
  borderRadiusSmall: '4px',
  panelWidth: '380px',
} as const;

/**
 * Shared style constants for React components
 */
export const styles = {
  colors: {
    primary: '#5a8a7a',
    primaryHover: '#4a7a6a',
    accent: '#d4a574',
    backgroundDark: '#2d2d2d',
    text: '#333',
    textLight: '#555',
    panelBgStart: '#f5f1e8',
    panelBgEnd: '#faf8f3',
    sliderBg: '#e0e0e0',
    buttonBgLight: '#f0f0f0',
    buttonBgLightHover: '#e0e0e0',
    white: 'white',
  },
  spacing,
  fonts: {
    family: mainFont,
  },
  // Shared component styles
  components: {
    // Base styles that inherit
    base: {
      fontFamily: mainFont,
      color: '#333',
    },
    // Button styles
    button: {
      padding: spacing.padding.xl,
      fontSize: '0.75em',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontWeight: 600,
      fontFamily: mainFont,
    } as CSSProperties,
    buttonPrimary: {
      background: '#5a8a7a',
      color: 'white',
      minWidth: '80px',
    } as CSSProperties,
    buttonLight: {
      background: '#f0f0f0',
      color: '#333',
    } as CSSProperties,
    // Slider styles
    slider: {
      width: '100%',
      height: '5px',
      borderRadius: '5px',
      background: '#e0e0e0',
      outline: 'none',
      WebkitAppearance: 'none' as const,
      appearance: 'none' as const,
      fontFamily: mainFont,
    } as CSSProperties,
    sliderThumb: {
      WebkitAppearance: 'none',
      appearance: 'none',
      borderRadius: '50%',
      background: '#5a8a7a',
      cursor: 'pointer',
      border: 'none',
    },
    // Label styles
    label: {
      fontSize: '0.8em',
      color: '#555',
      fontFamily: mainFont,
    } as CSSProperties,
    labelSmall: {
      fontSize: '0.7em',
      color: '#555',
      fontFamily: mainFont,
    } as CSSProperties,
    // Input/Select styles
    input: {
      padding: spacing.padding.sm,
      fontSize: '0.8em',
      border: '2px solid #e0e0e0',
      borderRadius: '4px',
      background: 'white',
      color: '#333',
      outline: 'none',
      transition: 'border-color 0.3s',
      fontFamily: mainFont,
      textAlign: 'center' as const,
    } as CSSProperties,
    select: {
      padding: spacing.padding.xl,
      fontSize: '0.8em',
      border: '2px solid #e0e0e0',
      borderRadius: '4px',
      background: 'white',
      color: '#333',
      cursor: 'pointer',
      outline: 'none',
      transition: 'border-color 0.3s',
      fontFamily: mainFont,
    } as CSSProperties,
    // Value display
    valueDisplay: {
      fontSize: '0.9em',
      fontWeight: 'bold',
      color: '#5a8a7a',
      fontFamily: mainFont,
    } as CSSProperties,
    valueDisplayLarge: {
      fontSize: '1.5em',
      fontWeight: 'bold',
      color: '#5a8a7a',
      fontFamily: mainFont,
    } as CSSProperties,
    // Panel container
    panelContainer: {
      background: `
        repeating-linear-gradient(0deg,
          rgba(255, 255, 255, 0.03) 0px,
          transparent 1px,
          transparent 2px,
          rgba(255, 255, 255, 0.03) 3px),
        repeating-linear-gradient(90deg,
          rgba(255, 255, 255, 0.02) 0px,
          transparent 1px,
          transparent 2px,
          rgba(255, 255, 255, 0.02) 3px),
        linear-gradient(135deg, #f5f1e8 0%, #faf8f3 100%)
      `,
      borderRadius: '8px',
      padding: spacing.xl,
      boxShadow: `
        0 20px 60px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.6),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1)
      `,
      textAlign: 'center' as const,
      width: '380px',
      minWidth: '380px',
      maxWidth: '380px',
      position: 'relative' as const,
      flex: '0 0 380px',
      display: 'flex',
      flexDirection: 'column' as const,
    } as CSSProperties,
    // Heading
    heading: {
      color: '#5a8a7a',
      fontFamily: mainFont,
    } as CSSProperties,
    // Help modal content
    helpModalContent: {
      color: '#333',
      lineHeight: '1.6',
      fontSize: '1em', // Base size - all children will inherit consistently
      textAlign: 'left' as const,
      fontFamily: mainFont,
    } as CSSProperties,
    helpModalParagraph: {
      margin: '0.5em 0',
      fontSize: '0.9em',
    } as CSSProperties,
    helpModalList: {
      margin: '0.5em 0',
      paddingLeft: '1.5em',
      fontSize: '0.9em',
    } as CSSProperties,
    helpModalListItem: {
      margin: '0.25em 0',
      fontSize: '0.9em',
    } as CSSProperties,
  },
} as const;

