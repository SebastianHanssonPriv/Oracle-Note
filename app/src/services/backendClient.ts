// Thin client for backend/ (see backend/README.md). Every call here is
// best-effort: if the backend isn't configured (the default — see
// backendConfig.ts) or isn't reachable, these resolve to null/void instead
// of throwing, so no screen ever hangs or crashes on a network problem.
// This mirrors backend/src/domain/types.ts by hand rather than importing
// it — app and backend are separate deployables that agree on a JSON
// contract, not a shared TypeScript project.

import { BACKEND_BASE_URL, isBackendConfigured } from './backendConfig';

export type StagedFieldOrigin = 'extracted' | 'you-said';

export interface RemoteStagedField {
  id: string;
  label: string;
  value: string;
  origin: StagedFieldOrigin;
}

export interface GapAnswerPayload {
  questionId: string;
  topicLabel: string;
  question: string;
  answer: string;
}

export type RemoteVisitStatus = 'not_started' | 'recorded' | 'answering' | 'staged' | 'synced';

const REQUEST_TIMEOUT_MS = 4000;

async function postJson(path: string, body: unknown): Promise<unknown | null> {
  if (!isBackendConfigured()) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${BACKEND_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`Oracle Note backend: ${path} returned ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    // Best-effort — no backend deployed yet is the expected default state,
    // not an error worth surfacing to the rep mid-debrief.
    console.warn(`Oracle Note backend: ${path} failed`, err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function extractStagedFields(visitId: string, gapAnswers: GapAnswerPayload[]): Promise<RemoteStagedField[] | null> {
  const result = (await postJson(`/visits/${visitId}/extract`, { gapAnswers })) as { stagedFields?: RemoteStagedField[] } | null;
  return result?.stagedFields ?? null;
}

export async function syncVisit(
  visitId: string,
  payload: { customer: string; gapAnswers?: GapAnswerPayload[]; stagedFields?: RemoteStagedField[] }
): Promise<{ syncedAt: string } | null> {
  const result = (await postJson(`/visits/${visitId}/sync`, payload)) as { syncedAt?: string } | null;
  return result?.syncedAt ? { syncedAt: result.syncedAt } : null;
}

/**
 * Best-effort remote mirror of the on-device visit status. Call without
 * awaiting from the UI thread — it must never add latency or a failure
 * mode to a local save. See backend/src/functions/saveVisitState.ts.
 */
export async function saveVisitStateRemote(
  visitId: string,
  payload: { customer: string; status: RemoteVisitStatus; elapsedSeconds?: number; askingIndex?: number }
): Promise<void> {
  await postJson(`/visits/${visitId}/state`, payload);
}
