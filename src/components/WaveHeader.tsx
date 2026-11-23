import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface WaveHeaderProps {
  height?: number;
}

export function WaveHeader({ height = 150 }: WaveHeaderProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 375 160"
        preserveAspectRatio="none"
        style={styles.svg}>
        <Defs>
          <LinearGradient id="coralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FA7D6B" stopOpacity="1" />
            <Stop offset="100%" stopColor="#F25749" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="softWave" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FC9A8B" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#FA7260" stopOpacity="0.15" />
          </LinearGradient>
        </Defs>

        {/* Secondary subtle wave behind */}
        <Path
          d="M 0,0 L 375,0 L 375,130 C 310,165 240,110 170,140 C 100,165 40,135 0,145 Z"
          fill="url(#softWave)"
        />

        {/* Primary organic wavy header from design mockup */}
        <Path
          d="M 0,0 L 375,0 L 375,105 C 320,145 270,75 190,120 C 120,150 60,110 0,125 Z"
          fill="url(#coralGrad)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  svg: {
    width: '100%',
    height: '100%',
  },
});
