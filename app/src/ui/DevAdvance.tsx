import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { color } from '../theme';

const monoFont = Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' });

/**
 * Deliberately NOT part of the product UI: the brief is explicit that the car
 * display has zero touch targets (start/stop/skip are voice-only or done on the
 * phone before the car moves — see chats/chat1.md, turn 3). CarReadyScreen and
 * CarAskScreen now also listen for the real spoken phrases (see
 * src/services/voiceCommands.ts) — this control stays as the manual fallback for
 * when voice isn't available (denied permission, unsupported platform, a noisy
 * environment) or during a live demo, on purpose, not as the only path. On
 * CarRecordingScreen it still is the only path — see that screen and
 * app/README.md's "Voice triggers" section for why. Styled to read as
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
