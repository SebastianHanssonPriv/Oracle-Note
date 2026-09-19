// Same pattern as src/auth/msalConfig.ts: unconfigured by default, so the
// app behaves exactly as it did before the backend existed unless someone
// deliberately points it at one (local `func start`, or a real deployment
// once one exists). EXPO_PUBLIC_-prefixed env vars are inlined at build
// time by Expo — no extra config needed.

export const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL ?? '';

export function isBackendConfigured(): boolean {
  return BACKEND_BASE_URL.length > 0;
}

// The single demo visit's stable id, shared with the backend's data model.
// Matches the AsyncStorage key convention in data/visitStore.ts.
export const DEMO_VISIT_ID = 'bergman-maskin-ab-2026-09-15';
