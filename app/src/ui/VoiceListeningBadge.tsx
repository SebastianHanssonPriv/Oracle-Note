import React from 'react';
import { Text, View } from 'react-native';
import { color } from '../theme';
import type { VoiceListenerStatus } from '../services/voiceCommands';

/** Small real-status indicator next to a car screen's DevAdvance fallback — silent unless voice recognition is actually listening. */
export function VoiceListeningBadge({ status }: { status: VoiceListenerStatus }) {
  if (status !== 'listening') return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 14 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color.status.success.icon }} />
      <Text style={{ fontSize: 11, color: color.text.muted }}>Listening for your voice</Text>
    </View>
  );
}
