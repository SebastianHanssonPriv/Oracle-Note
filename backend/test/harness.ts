// Smoke-tests the four handlers directly, invoking their exported functions
// in-process rather than through a running Functions host. This exists
// because the `func` CLI (azure-functions-core-tools) can't install in this
// sandbox — its postinstall needs pkgs.dev.azure.com, which this
// environment's outbound proxy blocks. See backend/README.md.
//
// `HttpRequest` and `InvocationContext` both have public constructors
// explicitly documented "for testing purposes only" in @azure/functions —
// this harness uses exactly that, not a hand-rolled fake.

import { existsSync } from 'node:fs';
import path from 'node:path';
import { HttpRequest, InvocationContext } from '@azure/functions';
import { getVisitHandler } from '../src/functions/getVisit';
import { extractVisitHandler } from '../src/functions/extractVisit';
import { syncVisitHandler } from '../src/functions/syncVisit';
import { saveVisitStateHandler } from '../src/functions/saveVisitState';
import { GapAnswer } from '../src/domain/types';

function req(method: string, params: Record<string, string>, body?: unknown): HttpRequest {
  return new HttpRequest({
    method,
    url: 'http://localhost/api/test',
    params,
    ...(body !== undefined ? { body: { string: JSON.stringify(body) } } : {}),
  });
}

function ctx(functionName: string): InvocationContext {
  return new InvocationContext({ functionName });
}

let failures = 0;

function check(label: string, condition: boolean, detail?: unknown): void {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures++;
    console.log(`  FAIL ${label}`, detail ?? '');
  }
}

async function run(): Promise<void> {
  const sinkLabel = process.env.AZURE_STORAGE_CONNECTION_STRING ? 'azure-table-storage (Azurite)' : 'local-file';
  console.log(`\n=== Oracle Note backend harness — sink: ${sinkLabel} ===\n`);

  const visitId = `harness-${Date.now()}`;

  // 1. GET before anything exists -> 404
  const missing = await getVisitHandler(req('GET', { visitId }), ctx('getVisit'));
  check('GET unknown visit returns 404', missing.status === 404, missing);

  // 2. extract: two gap answers -> two "you-said" staged fields
  const gapAnswers: GapAnswer[] = [
    { questionId: 'decision-maker', topicLabel: 'Decision maker', question: 'Who decides?', answer: 'Ulrika Sand decides.' },
    { questionId: 'next-step', topicLabel: 'Next step', question: 'What next?', answer: 'Kanban quote Fri 18 Sep.' },
  ];
  const extracted = await extractVisitHandler(req('POST', { visitId }, { gapAnswers }), ctx('extractVisit'));
  const extractedBody = extracted.jsonBody as { stagedFields?: unknown[]; provider?: string } | undefined;
  check('extractVisit returns 200', extracted.status === 200, extracted);
  check('extractVisit returns 2 staged fields', extractedBody?.stagedFields?.length === 2, extractedBody);
  check('extractVisit reports passthrough-local provider (no Azure OpenAI configured)', extractedBody?.provider === 'passthrough-local', extractedBody);

  // 3. sync: persist a visit record
  const synced = await syncVisitHandler(
    req('POST', { visitId }, { customer: 'Bergman Maskin AB', gapAnswers, stagedFields: extractedBody?.stagedFields }),
    ctx('syncVisit')
  );
  check('syncVisit returns 200', synced.status === 200, synced);

  // 2b. With the default LocalFileSinkProvider, also assert the file landed
  // where backend/README.md documents ("backend/data/visits/") — a
  // same-process write-then-read round trip alone doesn't catch a
  // __dirname-relative path pointing at the wrong directory, since a write
  // and its own read agree on whatever path they're both wrong about. This
  // exact bug shipped once and was only caught by a real HTTP round trip
  // from the app hitting an empty backend/data/visits/.
  if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
    const expectedPath = path.join(__dirname, '..', '..', 'data', 'visits', `${visitId}.json`);
    check(`synced record written to backend/data/visits/${visitId}.json`, existsSync(expectedPath), expectedPath);
  }

  // 4. GET after sync -> record round-trips correctly
  const fetched = await getVisitHandler(req('GET', { visitId }), ctx('getVisit'));
  const fetchedBody = fetched.jsonBody as { status?: string; customer?: string } | undefined;
  check('GET after sync returns 200', fetched.status === 200, fetched);
  check('GET after sync has status=synced', fetchedBody?.status === 'synced', fetchedBody);
  check('GET after sync has correct customer', fetchedBody?.customer === 'Bergman Maskin AB', fetchedBody);

  // 5. state mirror: simulate an earlier "recorded" status update against a
  //    fresh visitId, then confirm it round-trips before any sync happens.
  const stateVisitId = `harness-state-${Date.now()}`;
  const stateSave = await saveVisitStateHandler(
    req('POST', { visitId: stateVisitId }, { customer: 'Bergman Maskin AB', status: 'recorded', elapsedSeconds: 132, askingIndex: 0 }),
    ctx('saveVisitState')
  );
  check('saveVisitState returns 200', stateSave.status === 200, stateSave);

  const stateFetched = await getVisitHandler(req('GET', { visitId: stateVisitId }), ctx('getVisit'));
  const stateBody = stateFetched.jsonBody as { status?: string; elapsedSeconds?: number } | undefined;
  check('state mirror round-trips status=recorded', stateBody?.status === 'recorded', stateBody);
  check('state mirror round-trips elapsedSeconds=132', stateBody?.elapsedSeconds === 132, stateBody);

  console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) FAILED.`}\n`);
  if (failures > 0) process.exitCode = 1;
}

run().catch((err) => {
  console.error('Harness crashed:', err);
  process.exitCode = 1;
});
