import { HttpHandler, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

// CORS is a browser-only concern — the RN app's iOS/Android builds never
// hit this. It matters for the app's web target (`expo start --web`) and
// was caught by exactly that: verifying this backend against a real
// browser build of the app surfaced a CORS-blocked fetch that a
// handler-only test harness (see test/harness.ts) could never have caught.
//
// CORS_ALLOWED_ORIGIN defaults to '*' for local/dev convenience. A real
// deployment should set it to the app's actual origin(s) — see
// backend/README.md — rather than leaving it wide open.
const ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN ?? '*';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function withCors(handler: HttpHandler): HttpHandler {
  return async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    if (request.method === 'OPTIONS') {
      return { status: 204, headers: CORS_HEADERS };
    }
    const result = await handler(request, context);
    return { ...result, headers: CORS_HEADERS };
  };
}
