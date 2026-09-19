import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CarFrame } from '../ui/CarFrame';
import { DevAdvance } from '../ui/DevAdvance';
import { Waveform } from '../ui/Waveform';
import { color, space } from '../theme';
import { visit } from '../data/mockVisit';
import { saveVisitState } from '../data/visitStore';
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
      below={
        <DevAdvance
          label='"Oracle, stop"'
          onPress={async () => {
            const elapsedSeconds = secondsRef.current;
            await saveVisitState({ status: 'recorded', elapsedSeconds, askingIndex: 0 });
            navigation.replace('CarAsk', { elapsedSeconds });
          }}
        />
      }
    >
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.brand }}>
            Recording
          </Text>
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.muted }}>
            {visit.customer}
          </Text>
        </View>

        <View style={{ gap: space[3] }}>
          <Text
            style={{
              fontFamily: 'Archivo_700Bold',
              fontSize: 68,
              lineHeight: 68,
              letterSpacing: -1,
              fontVariant: ['tabular-nums'],
              color: color.text.primary,
            }}
          >
            {formatClock(seconds)}
          </Text>
          <Waveform height={30} opacity={0.75} />
        </View>

        <Text style={{ fontSize: 16, fontWeight: '600', color: color.text.muted }}>Say &quot;Oracle, stop&quot; when you're finished</Text>
      </View>
    </CarFrame>
  );
}
