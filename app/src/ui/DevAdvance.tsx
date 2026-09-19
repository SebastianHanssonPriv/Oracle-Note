import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { color } from '../theme';

const monoFont = Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' });

/**
 * Deliberately NOT part of the product UI: the brief is explicit that the car
 * display has zero touch targets (start/stop/skip are voice-only or done on the
 * phone before the car moves — see chats/chat1.md, turn 3). Since no real voice
 * pipeline is wired up in this build, this control stands in for the spoken
 * command so the flow can still be driven end to end. Styled to read as
 * scaffolding, not chrome, and rendered outside the car-display frame.
 */
export function DevAdvance({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={{ alignSelf: 'center', marginTop: 18 }}>
      <View style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: color.border.strong, paddingHorizontal: 10, paddingVertical: 6 }}>
        <Text style={{ fontFamily: monoFont, fontSize: 11, color: color.text.muted }}>DEV — simulate: {label}</Text>
      </View>
    </Pressable>
  );
}
