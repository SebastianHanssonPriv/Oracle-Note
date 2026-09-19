import React from 'react';
import { Text, View } from 'react-native';
import { color, radius, space } from '../theme';

export type BadgeVariant = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

type Props = { label: string; variant?: BadgeVariant; dot?: boolean };

/** The Bufab `.ds-badge`: pill, 1px border, one of six status tones. Static, never interactive. */
export function Badge({ label, variant = 'neutral', dot }: Props) {
  const tone = color.status[variant];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space['05'],
        paddingVertical: space['025'],
        paddingHorizontal: space[2],
        borderWidth: 1,
        borderColor: tone.border,
        borderRadius: radius.full,
        backgroundColor: tone.bg,
        alignSelf: 'flex-start',
      }}
    >
      {dot && <View style={{ width: 6, height: 6, borderRadius: radius.full, backgroundColor: tone.fg }} />}
      <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: '500', lineHeight: 17, color: tone.fg }}>
        {label}
      </Text>
    </View>
  );
}
