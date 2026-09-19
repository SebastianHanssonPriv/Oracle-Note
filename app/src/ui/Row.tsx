import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { color, font, ink } from '../theme';
import { Tag } from './Tag';

type Props = {
  label: string;
  value: string;
  badge?: { text: string; variant: 'outline' | 'filled' };
  highlighted?: boolean;
  dimmed?: boolean;
  onPress?: () => void;
  labelColor?: string;
  valueColor?: string;
};

/** The design's `.row` — a field line in the staged-record / synced-to-CRM lists. */
export function Row({ label, value, badge, highlighted, dimmed, onPress, labelColor, valueColor }: Props) {
  const body = (
    <View
      style={{
        paddingHorizontal: 18,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: color.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: highlighted ? color.paleBlueBg : 'transparent',
        opacity: dimmed ? 0.35 : 1,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: font.condensed.semiBold,
            fontSize: 10,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            color: labelColor ?? (highlighted ? color.blueprint : ink(0.55)),
          }}
        >
          {label}
        </Text>
        <Text style={{ fontFamily: font.body.medium, fontSize: 14.5, lineHeight: 19, marginTop: 2, color: valueColor ?? color.ink }}>
          {value}
        </Text>
      </View>
      {badge && <Tag label={badge.text} variant={badge.variant} />}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
      {body}
    </Pressable>
  );
}
