import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CarFrame } from '../ui/CarFrame';
import { DevAdvance } from '../ui/DevAdvance';
import { color, space } from '../theme';
import { visit, gapQuestions } from '../data/mockVisit';
import { saveVisitState } from '../data/visitStore';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CarAsk'>;

function formatClock(totalSeconds: number) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function CarAskScreen({ navigation, route }: Props) {
  const { elapsedSeconds } = route.params;

  return (
    <CarFrame
      below={
        <View style={{ flexDirection: 'row', gap: space[2], flexWrap: 'wrap', justifyContent: 'center' }}>
          <DevAdvance
            label='"Continue"'
            onPress={async () => {
              await saveVisitState({ status: 'answering', askingIndex: 0 });
              navigation.replace('Asking', { questionIndex: 0 });
            }}
          />
          <DevAdvance
            label='"Later"'
            onPress={async () => {
              // Status stays 'recorded': the monologue is saved, the gap
              // questions are simply deferred, not abandoned. Home reads
              // this and lets the rep resume any time.
              await saveVisitState({ status: 'recorded' });
              navigation.replace('CarInactive');
            }}
          />
        </View>
      }
    >
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.muted }}>
            Saved &middot; {formatClock(elapsedSeconds)}
          </Text>
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.muted }}>
            {visit.customer}
          </Text>
        </View>

        <View style={{ gap: space[2] }}>
          <Text style={{ fontFamily: 'Archivo_700Bold', fontSize: 32, lineHeight: 38, color: color.text.primary }}>
            {gapQuestions.length} quick questions{'\n'}now, or later?
          </Text>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: color.border.subtle, paddingTop: space[3] }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: color.text.brand }}>Say &quot;Continue&quot; or &quot;Later&quot;</Text>
        </View>
      </View>
    </CarFrame>
  );
}
