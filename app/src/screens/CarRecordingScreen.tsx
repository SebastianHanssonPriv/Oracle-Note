import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CarFrame } from '../ui/CarFrame';
import { DevAdvance } from '../ui/DevAdvance';
import { Waveform } from '../ui/Waveform';
import { color, font, ink } from '../theme';
import { visit } from '../data/mockVisit';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CarRecording'>;

function formatClock(totalSeconds: number) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// Matches the source prototype's starting value (01:48).
const START_SECONDS = 108;

export function CarRecordingScreen({ navigation }: Props) {
  const [seconds, setSeconds] = useState(START_SECONDS);
  const secondsRef = useRef(seconds);
  secondsRef.current = seconds;

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <CarFrame
      below={<DevAdvance label='"Oracle, stop"' onPress={() => navigation.replace('CarSaved', { elapsedSeconds: secondsRef.current })} />}
    >
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 14, letterSpacing: 1.8, textTransform: 'uppercase', color: color.blueprint }}>
            Recording
          </Text>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 14, letterSpacing: 1.4, textTransform: 'uppercase', color: ink(0.55) }}>
            {visit.customer}
          </Text>
        </View>

        <View style={{ gap: 20 }}>
          <Text
            style={{
              fontFamily: font.condensed.semiBold,
              fontSize: 88,
              lineHeight: 88,
              letterSpacing: -1,
              fontVariant: ['tabular-nums'],
              color: color.ink,
            }}
          >
            {formatClock(seconds)}
          </Text>
          <Waveform height={40} opacity={0.75} />
        </View>

        <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 15, letterSpacing: 1.4, textTransform: 'uppercase', color: ink(0.55) }}>
          Say "Oracle, stop" when you're finished
        </Text>
      </View>
    </CarFrame>
  );
}
