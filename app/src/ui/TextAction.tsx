import React from 'react';
import { Pressable, Text } from 'react-native';
import { color, font, ink } from '../theme';

type Props = {
  label: string;
  onPress?: () => void;
  tone?: 'muted' | 'blueprint';
  center?: boolean;
};

/** Small condensed uppercase text link, e.g. "Later — keep in staging", "Skip this one". */
export function TextAction({ label, onPress, tone = 'muted', center = true }: Props) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text
        style={{
          textAlign: center ? 'center' : 'left',
          fontFamily: font.condensed.semiBold,
          fontSize: 12,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: tone === 'blueprint' ? color.blueprint : ink(0.55),
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
