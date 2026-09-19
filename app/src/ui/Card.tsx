import React from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { color, radius, shadow } from '../theme';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Matches ds-card--raised / ds-card--flat. Default is ds-card's own shadow-xs. */
  elevation?: 'flat' | 'default' | 'raised';
  borderColor?: string;
  onPress?: () => void;
};

/** The Bufab `.ds-card`: bordered container, radius-lg, bg-surface, shadow-xs by default. */
export function Card({ children, style, elevation = 'default', borderColor = color.border.subtle, onPress }: Props) {
  const shadowStyle = elevation === 'flat' ? undefined : elevation === 'raised' ? shadow.md : shadow.xs;

  const content = (
    <View
      style={[
        { borderWidth: 1, borderColor, borderRadius: radius.lg, backgroundColor: color.bg.surface },
        shadowStyle,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
      {content}
    </Pressable>
  );
}
