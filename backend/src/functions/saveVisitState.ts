import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { selectSinkProvider } from '../config';
import { withCors } from '../cors';
import { VisitRecord, VisitStatus } from '../domain/types';

// Best-effort remote mirror of the RN app's on-device visitStore state.
// Called whenever visitStore.saveVisitState() runs (see
// app/src/data/visitStore.ts) — non-blocking on the app side, and its
// failure never stops a rep's local session from working. Directly answers
// the "save-and-resume is on-device only" limitation noted in app/README.md:
// as long as the app can reach this endpoint at least once after a status
// change, that status now also exists server-side.

interface SaveStateRequestBody {
  customer?: string;
  status?: VisitStatus;
  elapsedSeconds?: number;
  askingIndex?: number;
}

export async function saveVisitStateHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const visitId = request.params.visitId;
  if (!visitId) return { status: 400, jsonBody: { error: 'visitId is required' } };

  let body: SaveStateRequestBody;
  try {
    body = (await request.json()) as SaveStateRequestBody;
  } catch {
    return { status: 400, jsonBody: { error: 'request body must be valid JSON' } };
  }
  if (!body.customer || !body.status) {
    return { status: 400, jsonBody: { error: 'customer and status are required' } };
  }

  const sink = selectSinkProvider();
  const now = new Date().toISOString();
  try {
    const existing = await sink.getVisit(visitId);
    const record: VisitRecord = {
      ...existing,
      visitId,
      customer: body.customer,
      status: body.status,
      elapsedSeconds: body.elapsedSeconds ?? existing?.elapsedSeconds,
      askingIndex: body.askingIndex ?? existing?.askingIndex,
      updatedAt: now,
    };
    await sink.upsertVisit(record);
  } catch (err) {
    context.error('saveVisitState: sink write failed', err);
    return { status: 502, jsonBody: { error: 'sink provider failed', detail: err instanceof Error ? err.message : String(err) } };
  }

  return { status: 200, jsonBody: { visitId, updatedAt: now } };
}

app.http('saveVisitState', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'visits/{visitId}/state',
  handler: withCors(saveVisitStateHandler),
});
