// Tracks the most recently finished debrief recording's local file URI and
// duration. In-memory only, deliberately — not AsyncStorage. There is no
// real STT/upload pipeline yet to hand this off to (see
// app/README.md "Known limitations"), so persisting it across app restarts
// would just be a file path nobody reads. This exists as the one obvious
// place that pipeline will read from once it exists, and so a recording can
// be confirmed to have actually happened during development.

let lastRecordingUri: string | null = null;
let lastRecordingDurationSeconds = 0;

export function setLastRecording(uri: string | null, durationSeconds: number): void {
  lastRecordingUri = uri;
  lastRecordingDurationSeconds = durationSeconds;
}

export function getLastRecording(): { uri: string | null; durationSeconds: number } {
  return { uri: lastRecordingUri, durationSeconds: lastRecordingDurationSeconds };
}
