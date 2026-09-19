import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEMO_VISIT_ID } from '../services/backendConfig';
import { saveVisitStateRemote } from '../services/backendClient';
import { visit } from './mockVisit';

// Local persistence for the single demo visit's debrief progress, so a rep
// can monologue in the car, choose "Later", and pick the gap questions back
// up whenever — this session, tonight, or later that week — from Home.
//
// AsyncStorage stays the source of truth the UI reads from — it's
// synchronous-feeling, always available, and never blocks on a network
// call. Every write also fires a best-effort mirror to the backend's
// /state endpoint (services/backendClient.ts): unconfigured or unreachable,
// it silently no-ops, so this behaves exactly as before unless a backend is
// actually deployed. That mirror is what makes "a rep switching phones, or
// reinstalling, loses progress" no longer true once a real backend exists —
// see backend/README.md.

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
  // Fire-and-forget: never let the remote mirror add latency or a failure
  // mode to a local save. saveVisitStateRemote() already no-ops silently
  // when the backend isn't configured or unreachable.
  void saveVisitStateRemote(DEMO_VISIT_ID, {
    customer: visit.customer,
    status: next.status,
    elapsedSeconds: next.elapsedSeconds,
    askingIndex: next.askingIndex,
  });
  return next;
}

export async function resetVisitState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
