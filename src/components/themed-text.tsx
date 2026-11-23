import { Text, type TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Fonts, ThemeColor } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'code' | 'small';
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  return <Text style={[{ color: (theme as any)[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts?.sans,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: Fonts?.sans,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    fontFamily: Fonts?.sans,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Fonts?.sans,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
    fontFamily: Fonts?.sans,
  },
  code: {
    fontFamily: Fonts?.mono,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts?.sans,
  },
});
