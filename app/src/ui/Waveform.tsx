import React from 'react';
import { View } from 'react-native';

/**
 * Stand-in for the source's `repeating-linear-gradient` dashed waveform
 * texture (CSS gradients aren't available in RN) — a row of bar segments.
 */
export function Waveform({ height = 34, color = '#2667bc', opacity = 0.75, segments = 28 }: { height?: number; color?: string; opacity?: number; segments?: number }) {
  return (
    <View style={{ flexDirection: 'row', height, gap: 4, alignItems: 'flex-end', opacity }}>
      {Array.from({ length: segments }).map((_, i) => {
        const level = Math.abs(Math.sin(i * 1.3)) * 0.65 + 0.35;
        return <View key={i} style={{ width: 3, height: `${level * 100}%`, backgroundColor: color }} />;
      })}
    </View>
  );
}
