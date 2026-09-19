import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../ui/Screen';
import { CTAButton } from '../ui/CTAButton';
import { Tag } from '../ui/Tag';
import { color, font, ink } from '../theme';
import { homeVisits, gapQuestions } from '../data/mockVisit';
import { initialVisitState, loadVisitState, resetVisitState, VisitState } from '../data/visitStore';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function bergmanRow(state: VisitState) {
  const remaining = gapQuestions.length - state.askingIndex;
  switch (state.status) {
    case 'not_started':
      return { note: 'Existing customer visit · debrief not started', tag: { label: 'Next', variant: 'filled' as const } };
    case 'recorded':
      return { note: `Recorded in the car · ${gapQuestions.length} questions to answer`, tag: { label: 'Resume', variant: 'filled' as const } };
    case 'answering':
      return { note: `${remaining} question${remaining === 1 ? '' : 's'} left to answer`, tag: { label: 'Resume', variant: 'filled' as const } };
    case 'staged':
      return { note: 'Answers in · ready to sync', tag: { label: 'Ready', variant: 'filled' as const } };
    case 'synced':
      return { note: 'Synced · 6 fields updated', tag: { label: 'Synced', variant: 'outline' as const } };
  }
}

function bergmanCta(state: VisitState, navigation: Props['navigation']) {
  switch (state.status) {
    case 'not_started':
      return { label: 'Debrief Bergman visit', onPress: () => navigation.navigate('CarReady') };
    case 'recorded':
      return { label: `Answer ${gapQuestions.length} questions for Bergman`, onPress: () => navigation.navigate('Asking', { questionIndex: 0 }) };
    case 'answering':
      return { label: `Continue answering (${state.askingIndex + 1} of ${gapQuestions.length})`, onPress: () => navigation.navigate('Asking', { questionIndex: state.askingIndex }) };
    case 'staged':
      return { label: 'Review & sync Bergman', onPress: () => navigation.navigate('Staged', {}) };
    case 'synced':
      return null;
  }
}

export function HomeScreen({ navigation }: Props) {
  const [visitState, setVisitState] = useState<VisitState>(initialVisitState);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadVisitState().then((s) => {
        if (active) setVisitState(s);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const row = bergmanRow(visitState);
  const cta = bergmanCta(visitState, navigation);

  return (
    <Screen>
      <View style={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: color.border }}>
        <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: ink(0.55) }}>
          Oracle Note
        </Text>
        <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 32, lineHeight: 34, marginTop: 5, color: color.ink }}>Tue 15 Sep</Text>
      </View>

      <View style={{ flex: 1 }}>
        {homeVisits.map((v, i) => {
          if (v.customer === 'Bergman Maskin AB') {
            const highlighted = visitState.status !== 'synced';
            return (
              <View
                key="bergman"
                style={{
                  flexDirection: 'row',
                  gap: 14,
                  paddingHorizontal: 18,
                  paddingVertical: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: color.border,
                  backgroundColor: highlighted ? color.paleBlueBg : 'transparent',
                }}
              >
                <Text style={{ width: 40, fontFamily: font.condensed.semiBold, fontSize: 14, color: highlighted ? color.blueprint : ink(0.55) }}>
                  {v.time}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 19, lineHeight: 22, color: color.ink }}>{v.customer}</Text>
                  <Text style={{ fontFamily: font.body.medium, fontSize: 12.5, lineHeight: 17, color: highlighted ? '#2c455d' : ink(0.55) }}>
                    {row.note}
                  </Text>
                </View>
                <Tag label={row.tag.label} variant={row.tag.variant} />
              </View>
            );
          }
          return (
            <View
              key={v.time}
              style={{
                flexDirection: 'row',
                gap: 14,
                paddingHorizontal: 18,
                paddingVertical: 15,
                borderBottomWidth: 1,
                borderBottomColor: color.border,
                opacity: v.status === 'upcoming' ? 0.55 : 1,
              }}
            >
              <Text style={{ width: 40, fontFamily: font.condensed.semiBold, fontSize: 14, color: ink(0.55) }}>{v.time}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 19, lineHeight: 22, color: color.ink }}>{v.customer}</Text>
                <Text style={{ fontFamily: font.body.medium, fontSize: 12.5, lineHeight: 17, color: ink(0.55) }}>{v.note}</Text>
              </View>
              {v.status === 'synced' && <Tag label="Synced" variant="outline" />}
            </View>
          );
        })}
        <Text style={{ padding: 18, fontFamily: font.body.medium, fontSize: 12.5, lineHeight: 19, color: ink(0.55) }}>
          Each visit is matched to its customer from the calendar, the timestamp and your location. No account picking.
        </Text>
      </View>

      <View style={{ padding: 18, gap: 14 }}>
        {cta && <CTAButton label={cta.label} withDot={visitState.status === 'not_started'} onPress={cta.onPress} />}
        <Pressable
          onPress={async () => {
            await resetVisitState();
            setVisitState(initialVisitState);
          }}
          hitSlop={8}
        >
          <Text style={{ textAlign: 'center', fontFamily: font.body.medium, fontSize: 11, color: ink(0.35) }}>Reset demo data</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
