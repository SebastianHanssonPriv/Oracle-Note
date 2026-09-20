import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

export type VoiceCommand = {
  /** Tested against the lowercased transcript. Match, don't parse — these are short trigger phrases, not dictation. */
  match: (transcript: string) => boolean;
  onMatch: () => void;
};

export type VoiceListenerStatus = 'checking' | 'listening' | 'unavailable';

/**
 * Hands-free voice trigger for the car screens (see chats/chat1.md, turn 3:
 * the car display is meant to have zero touch targets). Listens
 * continuously and checks every recognized transcript against `commands`;
 * on a match, stops listening and calls that command's `onMatch()` once.
 *
 * Neither platform's speech recognizer reliably stays open indefinitely
 * even with `continuous: true` (see expo-speech-recognition's own docs —
 * iOS 17 and below stops after ~3s of silence regardless), so this
 * restarts listening on every `end` event until a command matches or the
 * screen unmounts, to approximate always-listening.
 *
 * Never blocks the screen: if permission is denied, the platform doesn't
 * support recognition, or anything else goes wrong, this settles on
 * `'unavailable'` and does nothing further — the screen's existing
 * `DevAdvance` "DEV — simulate" control is the only way to advance from
 * there, exactly as it was before voice triggers existed.
 */
export function useVoiceCommands(commands: VoiceCommand[]): VoiceListenerStatus {
  const [status, setStatus] = useState<VoiceListenerStatus>('checking');
  const matchedRef = useRef(false);
  const unavailableRef = useRef(false);
  const commandsRef = useRef(commands);
  commandsRef.current = commands;

  function startListening() {
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: true,
      // iOS's on-device recognizer is reliable for short trigger phrases;
      // Android's is inconsistent per-device (expo-speech-recognition's own
      // troubleshooting notes), so Android falls back to network-based
      // recognition, and to Android's hands-free voice-search intent, which
      // is built for exactly this "no visual attention, no touch" case.
      requiresOnDeviceRecognition: Platform.OS === 'ios',
      androidIntent: Platform.OS === 'android' ? 'android.speech.action.VOICE_SEARCH_HANDS_FREE' : undefined,
    });
  }

  useSpeechRecognitionEvent('result', (event) => {
    if (matchedRef.current || unavailableRef.current) return;
    for (const result of event.results) {
      const transcript = result.transcript.toLowerCase();
      const hit = commandsRef.current.find((c) => c.match(transcript));
      if (hit) {
        matchedRef.current = true;
        ExpoSpeechRecognitionModule.stop();
        hit.onMatch();
        return;
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'language-not-supported') {
      unavailableRef.current = true;
      setStatus('unavailable');
    }
    // 'no-speech' / 'speech-timeout' / 'network' are expected during normal
    // silence or a flaky connection — the 'end' handler below restarts
    // listening rather than treating these as unavailable.
  });

  useSpeechRecognitionEvent('end', () => {
    if (matchedRef.current || unavailableRef.current) return;
    startListening();
  });

  useEffect(() => {
    matchedRef.current = false;
    unavailableRef.current = false;
    let active = true;

    (async () => {
      try {
        if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
          if (active) {
            unavailableRef.current = true;
            setStatus('unavailable');
          }
          return;
        }
        const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!active) return;
        if (!granted) {
          unavailableRef.current = true;
          setStatus('unavailable');
          return;
        }
        setStatus('listening');
        startListening();
      } catch (err) {
        console.warn('Oracle Note: voice trigger unavailable, DEV fallback stays the only path', err);
        if (active) {
          unavailableRef.current = true;
          setStatus('unavailable');
        }
      }
    })();

    return () => {
      active = false;
      ExpoSpeechRecognitionModule.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return status;
}
