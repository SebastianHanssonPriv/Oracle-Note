import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { Blueprint } from './Blueprint';
import { color, font, ink } from '../theme';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'solid' | 'ghost' | 'disabled';
  withDot?: boolean;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

/** The design's `.cta` button: steel-blue block, condensed uppercase label. */
export function CTAButton({ label, onPress, variant = 'solid', withDot, height = 52, style }: Props) {
  const solid = variant === 'solid';
  const disabled = variant === 'disabled';

  return (
    <Blueprint
      onPress={disabled ? undefined : onPress}
      borderColor={solid ? color.blueprint : color.border}
      style={[
        {
          height,
          backgroundColor: solid ? color.steel : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 9,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {withDot && solid && (
        <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: color.white }} />
      )}
      <Text
        style={{
          fontFamily: font.condensed.semiBold,
          fontSize: 19,
          letterSpacing: 1.9,
          textTransform: 'uppercase',
          color: solid ? color.white : ink(1),
        }}
      >
        {label}
      </Text>
    </Blueprint>
  );
}
