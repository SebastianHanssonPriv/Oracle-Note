import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { CarFrame } from '../ui/CarFrame';
import { DevAdvance } from '../ui/DevAdvance';
import { Waveform } from '../ui/Waveform';
import { color, space } from '../theme';
import { visit } from '../data/mockVisit';
import { saveVisitState } from '../data/visitStore';
import { setLastRecording } from '../services/audioRecording';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CarRecording'>;

function formatClock(totalSeconds: number) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function CarRecordingScreen({ navigation }: Props) {
  // Real microphone capture, via expo-audio. `micAvailable` starts `null`
  // ("still checking") and resolves to `true`/`false` once permission is
  // requested on mount. `false` covers every reason real capture can't
  // happen here — permission denied, no microphone (this screen also runs
  // in a headless browser during automated verification), or the
  // permission/record call throwing — and falls back to exactly the
  // timer-only behavior this screen had before real capture existed. A rep
  // is never blocked by a microphone problem; the debrief flow continues
  // either way.
  const [micAvailable, setMicAvailable] = useState<boolean | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);

  const [fallbackSeconds, setFallbackSeconds] = useState(0);
  const fallbackSecondsRef = useRef(fallbackSeconds);
  fallbackSecondsRef.current = fallbackSeconds;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        const { granted } = await requestRecordingPermissionsAsync();
        if (!active) return;
        if (granted) {
          setMicAvailable(true);
          recorder.record();
        } else {
          setMicAvailable(false);
        }
      } catch (err) {
        console.warn('Oracle Note: real audio capture unavailable, falling back to the timer-only view', err);
        if (active) setMicAvailable(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only runs the fallback interval when real capture isn't available —
  // avoids a second, redundant clock source fighting the recorder's own.
  useEffect(() => {
    if (micAvailable !== false) return;
    const id = setInterval(() => setFallbackSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [micAvailable]);

  const displaySeconds = micAvailable ? Math.floor(recorderState.durationMillis / 1000) : fallbackSeconds;

  return (
    <CarFrame
      below={
        <DevAdvance
          label='"Oracle, stop"'
          onPress={async () => {
            let elapsedSeconds = fallbackSecondsRef.current;
            if (micAvailable) {
              try {
                await recorder.stop();
                elapsedSeconds = Math.round(recorder.currentTime);
                setLastRecording(recorder.uri, elapsedSeconds);
              } catch (err) {
                console.warn('Oracle Note: failed to finalize the recording', err);
                elapsedSeconds = Math.floor(recorderState.durationMillis / 1000);
              }
            }
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
            {formatClock(displaySeconds)}
          </Text>
          <Waveform height={30} opacity={0.75} />
        </View>

        <Text style={{ fontSize: 16, fontWeight: '600', color: color.text.muted }}>Say &quot;Oracle, stop&quot; when you're finished</Text>
      </View>
    </CarFrame>
  );
}
