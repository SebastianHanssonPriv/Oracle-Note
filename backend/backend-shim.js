// Temporary, verification-only local HTTP server. Not part of the shipped
// backend. Routes real HTTP requests into the actual compiled Azure
// Functions handlers (dist/src/functions/*.js) using @azure/functions' own
// test-mode HttpRequest/InvocationContext constructors, so the RN app's
// real fetch() calls can be exercised end-to-end without the `func` CLI
// (which can't install in this sandbox — see backend/README.md).
const http = require('http');
const { HttpRequest, InvocationContext } = require('@azure/functions');
const { withCors } = require('/home/claude/oracle-note/backend/dist/src/cors');
const { getVisitHandler } = require('/home/claude/oracle-note/backend/dist/src/functions/getVisit');
const { extractVisitHandler } = require('/home/claude/oracle-note/backend/dist/src/functions/extractVisit');
const { syncVisitHandler } = require('/home/claude/oracle-note/backend/dist/src/functions/syncVisit');
const { saveVisitStateHandler } = require('/home/claude/oracle-note/backend/dist/src/functions/saveVisitState');

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => resolve(data));
  });
}

// Wrapped with the same withCors() the real app.http(...) registrations use
// (see src/functions/*.ts) — this shim bypasses the Functions host, but not
// the app's own CORS layer, so what it serves matches what `func start`
// would actually return.
const routes = [
  { method: 'GET', pattern: /^\/api\/visits\/([^/]+)$/, handler: withCors(getVisitHandler) },
  { method: 'POST', pattern: /^\/api\/visits\/([^/]+)\/extract$/, handler: withCors(extractVisitHandler) },
  { method: 'POST', pattern: /^\/api\/visits\/([^/]+)\/sync$/, handler: withCors(syncVisitHandler) },
  { method: 'POST', pattern: /^\/api\/visits\/([^/]+)\/state$/, handler: withCors(saveVisitStateHandler) },
];

const PORT = 7071;

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const route = routes.find((r) => r.pattern.test(url.pathname) && (req.method === 'OPTIONS' || r.method === req.method));
    if (!route) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'no such route' }));
      return;
    }
    const [, visitId] = url.pathname.match(route.pattern);
    const bodyStr = await readBody(req);
    const httpReq = new HttpRequest({
      method: req.method,
      url: `http://localhost:${PORT}${req.url}`,
      params: { visitId },
      ...(bodyStr ? { body: { string: bodyStr } } : {}),
    });
    const ctx = new InvocationContext({ functionName: route.handler.name });
    const result = await route.handler(httpReq, ctx);
    res.writeHead(result.status || 200, { 'Content-Type': 'application/json', ...(result.headers || {}) });
    res.end(JSON.stringify(result.jsonBody ?? {}));
  } catch (err) {
    console.error('backend-shim request failed', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'shim crashed', detail: String(err) }));
  }
});

server.listen(PORT, () => console.log(`backend-shim listening on http://localhost:${PORT}/api`));
