import { Platform } from 'react-native';

export const Theme = {
  colors: {
    // Exact colors from design mockup
    background: '#FAF4EE',
    backgroundLight: '#FFFFFF',
    backgroundCard: '#FFFFFF',
    cardBorder: '#EFE7E0',
    primary: '#F77062',
    primaryPressed: '#E55C4D',
    primaryLight: '#FFE9E5',
    secondary: '#3B82F6',
    text: '#2A2523',
    textSecondary: '#7C736C',
    textMuted: '#A89F97',
    border: '#E8DED6',
    inputBorder: '#C9BEB4',
    inputBg: '#FFFFFF',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#0EA5E9',

    // Health tags
    normal: '#10B981',
    hypotension: '#3B82F6',
    hypertension: '#EF4444',
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 9999,
  },
  shadows: {
    soft: {
      shadowColor: '#7C4D38',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 2,
    },
    button: {
      shadowColor: '#F77062',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 3,
    },
  },
};

export const Colors = {
  light: {
    text: Theme.colors.text,
    background: Theme.colors.background,
    backgroundElement: '#F2E8E0',
    backgroundSelected: Theme.colors.primaryLight,
    textSecondary: Theme.colors.textSecondary,
  },
  dark: {
    text: '#FFFFFF',
    background: '#1A1817',
    backgroundElement: '#2A2624',
    backgroundSelected: '#3D2F2C',
    textSecondary: '#A89F97',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 4,
  one: 8,
  two: 12,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
} as const;

export const BottomTabInset = Platform.select({ ios: 60, android: 70 }) ?? 60;
export const MaxContentWidth = 800;
