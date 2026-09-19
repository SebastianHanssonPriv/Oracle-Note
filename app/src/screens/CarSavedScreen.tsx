import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CarFrame } from '../ui/CarFrame';
import { DevAdvance } from '../ui/DevAdvance';
import { color, font, ink } from '../theme';
import { visit } from '../data/mockVisit';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CarSaved'>;

function formatClock(totalSeconds: number) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function CarSavedScreen({ navigation, route }: Props) {
  const { elapsedSeconds } = route.params;

  return (
    <CarFrame below={<DevAdvance label="car parked" onPress={() => navigation.replace('Gaps', { elapsedSeconds })} />}>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 14, letterSpacing: 1.8, textTransform: 'uppercase', color: ink(0.55) }}>
            Saved to phone
          </Text>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 14, letterSpacing: 1.4, textTransform: 'uppercase', color: ink(0.55) }}>
            {visit.customer}
          </Text>
        </View>

        <View style={{ gap: 18 }}>
          <Text
            style={{
              fontFamily: font.condensed.semiBold,
              fontSize: 88,
              lineHeight: 88,
              letterSpacing: -1,
              fontVariant: ['tabular-nums'],
              color: ink(0.55),
            }}
          >
            {formatClock(elapsedSeconds)}
          </Text>
          <View style={{ height: 1, backgroundColor: color.border }} />
        </View>

        <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 15, letterSpacing: 1.4, textTransform: 'uppercase', color: ink(0.55) }}>
          Follow-up questions wait until you've parked
        </Text>
      </View>
    </CarFrame>
  );
}
