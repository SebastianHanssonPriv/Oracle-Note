import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { selectExtractionProvider } from '../config';
import { withCors } from '../cors';
import { GapAnswer } from '../domain/types';

interface ExtractRequestBody {
  gapAnswers?: GapAnswer[];
}

export async function extractVisitHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const visitId = request.params.visitId;
  if (!visitId) return { status: 400, jsonBody: { error: 'visitId is required' } };

  let body: ExtractRequestBody;
  try {
    body = (await request.json()) as ExtractRequestBody;
  } catch {
    return { status: 400, jsonBody: { error: 'request body must be valid JSON' } };
  }
  if (!Array.isArray(body.gapAnswers)) {
    return { status: 400, jsonBody: { error: 'gapAnswers must be an array' } };
  }

  const extraction = selectExtractionProvider();
  try {
    const stagedFields = await extraction.extractFromGapAnswers(body.gapAnswers);
    return { status: 200, jsonBody: { visitId, provider: extraction.name, stagedFields } };
  } catch (err) {
    context.error('extractVisit: extraction provider failed', err);
    return { status: 502, jsonBody: { error: 'extraction provider failed', detail: err instanceof Error ? err.message : String(err) } };
  }
}

app.http('extractVisit', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'visits/{visitId}/extract',
  handler: withCors(extractVisitHandler),
});
