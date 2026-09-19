import React from 'react';
import { Pressable, Text } from 'react-native';
import { color } from '../theme';

type Props = {
  label: string;
  onPress?: () => void;
  tone?: 'muted' | 'brand';
  center?: boolean;
};

/** A low-emphasis text action, styled after `.ds-btn--ghost`'s label treatment. */
export function TextAction({ label, onPress, tone = 'muted', center = true }: Props) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text
        style={{
          textAlign: center ? 'center' : 'left',
          fontSize: 14,
          fontWeight: '500',
          lineHeight: 20,
          color: tone === 'brand' ? color.text.link : color.text.secondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
