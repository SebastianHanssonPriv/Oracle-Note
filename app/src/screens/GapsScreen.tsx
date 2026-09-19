import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../ui/Screen';
import { PhoneChrome } from '../ui/PhoneChrome';
import { CTAButton } from '../ui/CTAButton';
import { TextAction } from '../ui/TextAction';
import { color, font, ink } from '../theme';
import { gapQuestions } from '../data/mockVisit';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Gaps'>;

function formatCaptured(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

export function GapsScreen({ navigation, route }: Props) {
  const { elapsedSeconds } = route.params;

  return (
    <Screen>
      <PhoneChrome time="11:34" />
      <View style={{ paddingHorizontal: 18, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: color.border }}>
        <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: ink(0.55) }}>
          Car stopped · {formatCaptured(elapsedSeconds)} captured
        </Text>
        <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 30, lineHeight: 32, marginTop: 6, color: color.ink }}>
          Three gaps in{'\n'}the Bergman debrief
        </Text>
        <Text style={{ fontFamily: font.body.medium, fontSize: 13, lineHeight: 19, color: ink(0.58), marginTop: 8 }}>
          Checked against the existing-customer schema. Two of the three are mandatory.
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        {gapQuestions.map((q) => (
          <View
            key={q.id}
            style={{
              paddingHorizontal: 18,
              paddingVertical: 15,
              borderBottomWidth: 1,
              borderBottomColor: color.border,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'baseline',
            }}
          >
            <Text style={{ width: 14, fontFamily: font.condensed.semiBold, fontSize: 13, color: q.mandatory ? color.blueprint : ink(0.5) }}>
              {q.num}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 18, lineHeight: 21, color: color.ink }}>{q.title}</Text>
              <Text style={{ fontFamily: font.body.medium, fontSize: 12.5, lineHeight: 17, color: ink(0.55) }}>{q.meta}</Text>
            </View>
          </View>
        ))}
        <Text style={{ padding: 18, fontFamily: font.body.medium, fontSize: 12.5, lineHeight: 19, color: ink(0.55) }}>
          Oracle reads each one out and waits. Answer by voice, or tap a line to type.
        </Text>
      </View>

      <View style={{ padding: 18, gap: 11 }}>
        <CTAButton label="Answer out loud" withDot onPress={() => navigation.navigate('Asking', { questionIndex: 0 })} />
        <TextAction label="Later — keep in staging" onPress={() => navigation.navigate('Staged', {})} />
      </View>
    </Screen>
  );
}
