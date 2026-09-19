import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { color, space } from '../theme';
import { Badge, BadgeVariant } from './Badge';

type Props = {
  label: string;
  value: string;
  badge?: { text: string; variant: BadgeVariant };
  highlighted?: boolean;
  dimmed?: boolean;
  onPress?: () => void;
  valueColor?: string;
};

/** A field line in the staged-record / synced-to-CRM lists — styled after `.ds-table td`. */
export function Row({ label, value, badge, highlighted, dimmed, onPress, valueColor }: Props) {
  const body = (
    <View
      style={{
        paddingHorizontal: space[4],
        paddingVertical: space[3],
        borderBottomWidth: 1,
        borderBottomColor: color.border.subtle,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: space[2],
        backgroundColor: highlighted ? color.bg.selected : 'transparent',
        opacity: dimmed ? 0.5 : 1,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 11,
            lineHeight: 15,
            fontWeight: '600',
            letterSpacing: 0.44,
            textTransform: 'uppercase',
            color: highlighted ? color.text.brand : color.text.muted,
          }}
        >
          {label}
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 20, marginTop: 2, color: valueColor ?? color.text.primary }}>{value}</Text>
      </View>
      {badge && <Badge label={badge.text} variant={badge.variant} />}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
      {body}
    </Pressable>
  );
}
