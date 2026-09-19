import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../ui/Screen';
import { Button } from '../ui/Button';
import { Badge, BadgeVariant } from '../ui/Badge';
import { color, space } from '../theme';
import { homeVisits, gapQuestions } from '../data/mockVisit';
import { initialVisitState, loadVisitState, resetVisitState, VisitState } from '../data/visitStore';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function bergmanRow(state: VisitState): { note: string; tag: { label: string; variant: BadgeVariant } } {
  const remaining = gapQuestions.length - state.askingIndex;
  switch (state.status) {
    case 'not_started':
      return { note: 'Existing customer visit · debrief not started', tag: { label: 'Next', variant: 'brand' } };
    case 'recorded':
      return { note: `Recorded in the car · ${gapQuestions.length} questions to answer`, tag: { label: 'Resume', variant: 'brand' } };
    case 'answering':
      return { note: `${remaining} question${remaining === 1 ? '' : 's'} left to answer`, tag: { label: 'Resume', variant: 'brand' } };
    case 'staged':
      return { note: 'Answers in · ready to sync', tag: { label: 'Ready', variant: 'brand' } };
    case 'synced':
      return { note: 'Synced · 6 fields updated', tag: { label: 'Synced', variant: 'success' } };
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
      <View style={{ paddingHorizontal: space[4], paddingTop: space[3], paddingBottom: space[4], borderBottomWidth: 1, borderBottomColor: color.border.subtle }}>
        <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.muted }}>Oracle Note</Text>
        <Text style={{ fontFamily: 'Archivo_700Bold', fontSize: 30, lineHeight: 38, marginTop: space['05'], color: color.text.primary }}>Tue 15 Sep</Text>
      </View>

      <View style={{ flex: 1 }}>
        {homeVisits.map((v) => {
          if (v.customer === 'Bergman Maskin AB') {
            const highlighted = visitState.status !== 'synced';
            return (
              <View
                key="bergman"
                style={{
                  flexDirection: 'row',
                  gap: space[3],
                  paddingHorizontal: space[4],
                  paddingVertical: space[4],
                  borderBottomWidth: 1,
                  borderBottomColor: color.border.subtle,
                  backgroundColor: highlighted ? color.bg.selected : 'transparent',
                }}
              >
                <Text style={{ width: 44, fontSize: 14, fontWeight: '600', color: highlighted ? color.text.brand : color.text.muted }}>{v.time}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Archivo_600SemiBold', fontSize: 16, lineHeight: 22, color: color.text.primary }}>{v.customer}</Text>
                  <Text style={{ fontSize: 13, lineHeight: 18, color: highlighted ? color.text.brand : color.text.muted }}>{row.note}</Text>
                </View>
                <Badge label={row.tag.label} variant={row.tag.variant} />
              </View>
            );
          }
          return (
            <View
              key={v.time}
              style={{
                flexDirection: 'row',
                gap: space[3],
                paddingHorizontal: space[4],
                paddingVertical: space[4],
                borderBottomWidth: 1,
                borderBottomColor: color.border.subtle,
                opacity: v.status === 'upcoming' ? 0.55 : 1,
              }}
            >
              <Text style={{ width: 44, fontSize: 14, fontWeight: '600', color: color.text.muted }}>{v.time}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Archivo_600SemiBold', fontSize: 16, lineHeight: 22, color: color.text.primary }}>{v.customer}</Text>
                <Text style={{ fontSize: 13, lineHeight: 18, color: color.text.muted }}>{v.note}</Text>
              </View>
              {v.status === 'synced' && <Badge label="Synced" variant="success" />}
            </View>
          );
        })}
        <Text style={{ padding: space[4], fontSize: 13, lineHeight: 20, color: color.text.muted }}>
          Each visit is matched to its customer from the calendar, the timestamp and your location. No account picking.
        </Text>
      </View>

      <View style={{ padding: space[4], gap: space[4] }}>
        {cta && <Button label={cta.label} size="lg" block withDot={visitState.status === 'not_started'} onPress={cta.onPress} />}
        <Pressable
          onPress={async () => {
            await resetVisitState();
            setVisitState(initialVisitState);
          }}
          hitSlop={8}
        >
          <Text style={{ textAlign: 'center', fontSize: 12, color: color.text.disabled }}>Reset demo data</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
