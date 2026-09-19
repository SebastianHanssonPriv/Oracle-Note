import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../ui/Screen';
import { PhoneChrome } from '../ui/PhoneChrome';
import { Button } from '../ui/Button';
import { TextAction } from '../ui/TextAction';
import { Waveform } from '../ui/Waveform';
import { color, space } from '../theme';
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
          paddingHorizontal: space[4],
          paddingBottom: space[3],
          borderBottomWidth: 1,
          borderBottomColor: color.border.subtle,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '600', color: color.text.brand }}>
          Question {questionIndex + 1} of {gapQuestions.length}
        </Text>
        <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.muted }}>
          {visit.customer}
        </Text>
      </View>

      <View style={{ padding: space[4], paddingTop: space[5], borderBottomWidth: 1, borderBottomColor: color.border.subtle }}>
        <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.brand }}>
          Oracle asked
        </Text>
        <Text style={{ fontFamily: 'Archivo_600SemiBold', fontSize: 22, lineHeight: 28, marginTop: space[1], color: color.text.primary }}>
          {question.oracleAsked}
        </Text>
        <Text style={{ fontSize: 12, lineHeight: 17, color: color.text.muted, marginTop: space[2] }}>Spoken aloud · tap to hear again</Text>
      </View>

      <View style={{ flex: 1, padding: space[4], paddingTop: space[5], gap: space[4] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.brand }}>Listening</Text>
          <View style={{ flex: 1 }}>
            <Waveform height={26} opacity={0.75} />
          </View>
        </View>
        <Text style={{ fontSize: 16, lineHeight: 25, color: color.text.primary }}>{question.liveTranscript}</Text>
        <Text style={{ fontSize: 12, lineHeight: 17, color: color.text.muted }}>Transcribing as you speak. Say &quot;next&quot; to move on.</Text>
      </View>

      <View style={{ padding: space[4], gap: space[3] }}>
        <Button label="Next question" size="lg" block onPress={advance} />
        <TextAction label="Skip this one" onPress={advance} />
        <TextAction label="Finish the rest later" tone="brand" onPress={finishLater} />
      </View>
    </Screen>
  );
}
