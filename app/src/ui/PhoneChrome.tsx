import React from 'react';
import { Text, View } from 'react-native';
import { color, space } from '../theme';

/** Minimal status-bar row shown at the top of the phone-shaped screens (`9:41 · iOS`). */
export function PhoneChrome({ time = '9:41' }: { time?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space[4], paddingTop: space[3], paddingBottom: space[1] }}>
      <Text style={{ fontSize: 11, color: color.text.muted }}>{time}</Text>
      <Text style={{ fontSize: 11, color: color.text.muted }}>iOS</Text>
    </View>
  );
}
