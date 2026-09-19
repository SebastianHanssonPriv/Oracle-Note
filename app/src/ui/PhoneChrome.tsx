import React from 'react';
import { Text, View } from 'react-native';
import { font, ink } from '../theme';

/** Minimal status-bar row shown at the top of the phone-shaped screens in the source (`9:41 · iOS`). */
export function PhoneChrome({ time = '9:41' }: { time?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 6 }}>
      <Text style={{ fontFamily: font.body.medium, fontSize: 11, color: ink(0.55) }}>{time}</Text>
      <Text style={{ fontFamily: font.body.medium, fontSize: 11, color: ink(0.55) }}>iOS</Text>
    </View>
  );
}
