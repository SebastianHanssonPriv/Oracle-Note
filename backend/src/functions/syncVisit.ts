import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { selectSinkProvider } from '../config';
import { withCors } from '../cors';
import { GapAnswer, StagedField, VisitRecord } from '../domain/types';

interface SyncRequestBody {
  customer?: string;
  gapAnswers?: GapAnswer[];
  stagedFields?: StagedField[];
}

export async function syncVisitHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const visitId = request.params.visitId;
  if (!visitId) return { status: 400, jsonBody: { error: 'visitId is required' } };

  let body: SyncRequestBody;
  try {
    body = (await request.json()) as SyncRequestBody;
  } catch {
    return { status: 400, jsonBody: { error: 'request body must be valid JSON' } };
  }
  if (!body.customer) return { status: 400, jsonBody: { error: 'customer is required' } };

  const sink = selectSinkProvider();
  const now = new Date().toISOString();
  const record: VisitRecord = {
    visitId,
    customer: body.customer,
    status: 'synced',
    gapAnswers: body.gapAnswers,
    stagedFields: body.stagedFields,
    updatedAt: now,
    syncedAt: now,
  };

  try {
    await sink.upsertVisit(record);
  } catch (err) {
    context.error('syncVisit: sink write failed', err);
    return { status: 502, jsonBody: { error: 'sink provider failed', detail: err instanceof Error ? err.message : String(err) } };
  }

  return { status: 200, jsonBody: { visitId, syncedAt: now, sink: sink.name } };
}

app.http('syncVisit', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'visits/{visitId}/sync',
  handler: withCors(syncVisitHandler),
});
