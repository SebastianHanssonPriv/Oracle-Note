import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { selectSinkProvider } from '../config';
import { withCors } from '../cors';

export async function getVisitHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const visitId = request.params.visitId;
  if (!visitId) return { status: 400, jsonBody: { error: 'visitId is required' } };

  const sink = selectSinkProvider();
  try {
    const record = await sink.getVisit(visitId);
    if (!record) return { status: 404, jsonBody: { error: 'visit not found' } };
    return { status: 200, jsonBody: record };
  } catch (err) {
    context.error('getVisit: sink read failed', err);
    return { status: 502, jsonBody: { error: 'sink provider failed', detail: err instanceof Error ? err.message : String(err) } };
  }
}

app.http('getVisit', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'visits/{visitId}',
  handler: withCors(getVisitHandler),
});
