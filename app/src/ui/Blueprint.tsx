import React from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { color, ink, REG_MARK } from '../theme';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
  marks?: boolean;
  onPress?: () => void;
};

/**
 * Blueprint frame: the design's `.bp` card — a bordered rectangle with four
 * corner registration marks (`.bp>i.tl/tr/bl/br` in the source CSS).
 */
export function Blueprint({ children, style, borderColor = color.border, marks = true, onPress }: Props) {
  const content = (
    <View style={[{ borderWidth: 1, borderColor }, style]}>
      {marks && (
        <>
          <RegMark corner="tl" color={borderColor} />
          <RegMark corner="tr" color={borderColor} />
          <RegMark corner="bl" color={borderColor} />
          <RegMark corner="br" color={borderColor} />
        </>
      )}
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

function RegMark({ corner, color: markColor }: { corner: 'tl' | 'tr' | 'bl' | 'br'; color: string }) {
  const { size, offset, thickness } = REG_MARK;
  const vertical: ViewStyle = {
    position: 'absolute',
    width: thickness,
    height: size,
    backgroundColor: markColor,
    left: size / 2 - thickness / 2,
    top: 0,
  };
  const horizontal: ViewStyle = {
    position: 'absolute',
    width: size,
    height: thickness,
    backgroundColor: markColor,
    top: size / 2 - thickness / 2,
    left: 0,
  };
  const pos: ViewStyle =
    corner === 'tl'
      ? { top: offset, left: offset }
      : corner === 'tr'
        ? { top: offset, right: offset }
        : corner === 'bl'
          ? { bottom: offset, left: offset }
          : { bottom: offset, right: offset };

  return (
    <View style={[{ position: 'absolute', width: size, height: size }, pos]} pointerEvents="none">
      <View style={vertical} />
      <View style={horizontal} />
    </View>
  );
}

export const inkAlpha = ink;
