import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../ui/Screen';
import { PhoneChrome } from '../ui/PhoneChrome';
import { CTAButton } from '../ui/CTAButton';
import { TextAction } from '../ui/TextAction';
import { Waveform } from '../ui/Waveform';
import { color, font, ink } from '../theme';
import { gapQuestions, visit } from '../data/mockVisit';
import { saveVisitState } from '../data/visitStore';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Asking'>;

export function AskingScreen({ navigation, route }: Props) {
  const { questionIndex } = route.params;
  const question = gapQuestions[questionIndex];
  const isLast = questionIndex === gapQuestions.length - 1;

  // Persist progress as it happens, not just at the end — closing the app
  // mid-loop (or tapping "Finish the rest later" below) shouldn't lose it.
  useEffect(() => {
    saveVisitState({ status: 'answering', askingIndex: questionIndex });
  }, [questionIndex]);

  async function advance() {
    if (isLast) {
      await saveVisitState({ status: 'staged' });
      navigation.navigate('Staged', {});
    } else {
      navigation.navigate('Asking', { questionIndex: questionIndex + 1 });
    }
  }

  async function finishLater() {
    await saveVisitState({ status: 'answering', askingIndex: questionIndex });
    navigation.popToTop();
  }

  return (
    <Screen>
      <PhoneChrome time="11:08" />
      <View
        style={{
          paddingHorizontal: 18,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: color.border,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: color.blueprint }}>
          Question {questionIndex + 1} of {gapQuestions.length}
        </Text>
        <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: ink(0.55) }}>
          {visit.customer}
        </Text>
      </View>

      <View style={{ padding: 18, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: color.border }}>
        <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: color.blueprint }}>
          Oracle asked
        </Text>
        <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 25, lineHeight: 29, marginTop: 7, color: color.ink }}>{question.oracleAsked}</Text>
        <Text style={{ fontFamily: font.body.medium, fontSize: 12, lineHeight: 17, color: ink(0.5), marginTop: 9 }}>
          Spoken aloud · tap to hear again
        </Text>
      </View>

      <View style={{ flex: 1, padding: 18, paddingTop: 20, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: color.blueprint }}>
            Listening
          </Text>
          <View style={{ flex: 1 }}>
            <Waveform height={26} opacity={0.75} />
          </View>
        </View>
        <Text style={{ fontFamily: font.body.regular, fontSize: 16, lineHeight: 26, color: color.ink }}>{question.liveTranscript}</Text>
        <Text style={{ fontFamily: font.body.medium, fontSize: 12, lineHeight: 17, color: ink(0.5) }}>
          Transcribing as you speak. Say "next" to move on.
        </Text>
      </View>

      <View style={{ padding: 18, gap: 11 }}>
        <CTAButton label="Next question" onPress={advance} />
        <TextAction label="Skip this one" onPress={advance} />
        <TextAction label="Finish the rest later" tone="blueprint" onPress={finishLater} />
      </View>
    </Screen>
  );
}
