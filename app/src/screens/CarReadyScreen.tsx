import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CarFrame } from '../ui/CarFrame';
import { DevAdvance } from '../ui/DevAdvance';
import { VoiceListeningBadge } from '../ui/VoiceListeningBadge';
import { color, space } from '../theme';
import { visit } from '../data/mockVisit';
import { useVoiceCommands } from '../services/voiceCommands';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CarReady'>;

export function CarReadyScreen({ navigation }: Props) {
  const start = () => navigation.replace('CarRecording');
  const voiceStatus = useVoiceCommands([
    { match: (t) => t.includes('start') && t.includes('debrief'), onMatch: start },
  ]);

  return (
    <CarFrame
      below={
        <>
          <DevAdvance label='"Oracle, start debrief"' onPress={start} />
          <VoiceListeningBadge status={voiceStatus} />
        </>
      }
    >
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.brand }}>
            Ready to debrief
          </Text>
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.muted }}>
            Oracle Note
          </Text>
        </View>

        <View style={{ gap: space[1] }}>
          <Text style={{ fontFamily: 'Archivo_700Bold', fontSize: 24, lineHeight: 29, color: color.text.primary }} numberOfLines={1} adjustsFontSizeToFit>
            {visit.customer}
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 19, color: color.text.secondary }}>{visit.visitMeta}</Text>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: color.border.subtle, paddingTop: space[2], gap: 2 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: color.text.brand }}>Say &quot;Oracle, start debrief&quot;</Text>
          <Text style={{ fontSize: 12, color: color.text.muted }}>Existing customer visit</Text>
        </View>
      </View>
    </CarFrame>
  );
}
