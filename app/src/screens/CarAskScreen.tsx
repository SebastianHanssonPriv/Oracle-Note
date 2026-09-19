import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CarFrame } from '../ui/CarFrame';
import { DevAdvance } from '../ui/DevAdvance';
import { color, font, ink } from '../theme';
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
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
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
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 14, letterSpacing: 1.8, textTransform: 'uppercase', color: ink(0.55) }}>
            Saved &middot; {formatClock(elapsedSeconds)}
          </Text>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 14, letterSpacing: 1.4, textTransform: 'uppercase', color: ink(0.55) }}>
            {visit.customer}
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 36, lineHeight: 39, color: color.ink }}>
            {gapQuestions.length} quick questions{'\n'}now, or later?
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', borderTopWidth: 1, borderTopColor: color.border, paddingTop: 11 }}>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 15, letterSpacing: 1, textTransform: 'uppercase', color: color.blueprint }}>
            Say &quot;Continue&quot; or &quot;Later&quot;
          </Text>
        </View>
      </View>
    </CarFrame>
  );
}
