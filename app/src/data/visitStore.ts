import AsyncStorage from '@react-native-async-storage/async-storage';

// Local persistence for the single demo visit's debrief progress, so a rep
// can monologue in the car, choose "Later", and pick the gap questions back
// up whenever — this session, tonight, or later that week — from Home.
// There's one real backend-shaped concept missing here: this is on-device
// only. A rep switching phones, or reinstalling, loses progress. A real
// build would sync this state server-side once "Continue" is first chosen.

const STORAGE_KEY = 'oracle-note/bergman-visit-state';

export type VisitStatus = 'not_started' | 'recorded' | 'answering' | 'staged' | 'synced';

export type VisitState = {
  status: VisitStatus;
  elapsedSeconds: number;
  askingIndex: number;
};

export const initialVisitState: VisitState = {
  status: 'not_started',
  elapsedSeconds: 0,
  askingIndex: 0,
};

export async function loadVisitState(): Promise<VisitState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return initialVisitState;
    return { ...initialVisitState, ...JSON.parse(raw) };
  } catch {
    return initialVisitState;
  }
}

export async function saveVisitState(patch: Partial<VisitState>): Promise<VisitState> {
  const current = await loadVisitState();
  const next = { ...current, ...patch };
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Best-effort: if storage isn't available, the session still works,
    // it just won't survive an app restart.
  }
  return next;
}

export async function resetVisitState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
