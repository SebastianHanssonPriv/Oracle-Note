import React from 'react';
import { Text, View } from 'react-native';
import { color, font, ink } from '../theme';

type Props = { label: string; variant?: 'outline' | 'filled' };

/** The design's `.tag` (outline, "Extracted"/"Kept") and `.tagv` (filled, "You said"/"Written") badges. */
export function Tag({ label, variant = 'outline' }: Props) {
  const filled = variant === 'filled';
  return (
    <View
      style={{
        borderWidth: filled ? 0 : 1,
        borderColor: ink(0.2),
        backgroundColor: filled ? color.steel : 'transparent',
        paddingHorizontal: 4,
        paddingVertical: 3,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          fontFamily: font.condensed.semiBold,
          fontSize: 9,
          letterSpacing: 0.9,
          textTransform: 'uppercase',
          color: filled ? color.white : ink(0.5),
        }}
      >
        {label}
      </Text>
    </View>
  );
}
