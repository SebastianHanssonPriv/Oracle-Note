import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { color, controlHeight, radius, space, weight } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  withDot?: boolean;
  style?: StyleProp<ViewStyle>;
};

const fontSizeBySize: Record<Size, number> = { sm: 12, md: 14, lg: 16 };
const paddingInlineBySize: Record<Size, number> = { sm: space[3], md: space[4], lg: space[6] };

/** The Bufab `.ds-btn`: four variants, three sizes, never uppercase. */
export function Button({ label, onPress, variant = 'primary', size = 'md', disabled, loading, block, withDot, style }: Props) {
  const isDisabled = disabled || loading;

  let bg = 'transparent';
  let fg = color.text.primary;
  let borderColor = 'transparent';

  if (isDisabled) {
    bg = color.bg.muted;
    fg = color.text.disabled;
  } else if (variant === 'primary') {
    bg = color.action.primaryBg;
    fg = color.action.primaryFg;
  } else if (variant === 'secondary') {
    bg = color.bg.surface;
    fg = color.text.primary;
    borderColor = color.border.default;
  } else if (variant === 'ghost') {
    bg = 'transparent';
    fg = color.text.secondary;
  } else if (variant === 'danger') {
    bg = color.action.dangerBg;
    fg = color.action.dangerFg;
  }

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        {
          height: controlHeight[size],
          paddingHorizontal: paddingInlineBySize[size],
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor,
          backgroundColor: bg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space[2],
          width: block ? '100%' : undefined,
          opacity: pressed && !isDisabled ? 0.88 : 1,
        },
        style,
      ]}
    >
      {withDot && !isDisabled && <View style={{ width: 8, height: 8, borderRadius: radius.full, backgroundColor: fg }} />}
      {loading && <ActivityIndicator size="small" color={fg} />}
      <Text
        style={{
          fontSize: fontSizeBySize[size],
          fontWeight: weight.medium,
          lineHeight: fontSizeBySize[size],
          color: fg,
          opacity: loading ? 0.65 : 1,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
