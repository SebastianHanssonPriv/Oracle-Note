# Oracle Note backend

Azure Functions (Node.js/TypeScript, v4 programming model) API behind the RN
app: staged-field extraction and the temporary pilot analysis sink referenced
in the app's `README.md` ("Known limitations / assumptions"). Built to the
same principle as `app/src/auth/`: real code, gated on configuration, that
degrades to a local/mock default rather than requiring credentials that
don't exist yet.

## Endpoints

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/visits/{visitId}` | Fetch the current stored state for a visit. |
| `POST` | `/api/visits/{visitId}/extract` | Turn gap-question answers into staged fields. |
| `POST` | `/api/visits/{visitId}/sync` | Persist the confirmed visit to the sink, status → `synced`. |
| `POST` | `/api/visits/{visitId}/state` | Best-effort mirror of the app's on-device status (recorded/answering/staged), called on every local status change. |

## Providers

Two provider interfaces, each with a local/mock default and a real
Azure-backed implementation gated on env vars (`src/config.ts` picks
between them — nothing else in the codebase needs to know which is active):

- **`ExtractionProvider`** (`src/providers/extractionProvider.ts`)
  - `PassthroughExtractionProvider` (default): turns each gap answer
    directly into a "you said" staged field. This is **not** natural-language
    extraction — it's a deterministic pass-through that exists so the
    `/extract` endpoint's contract, and the app's real network call to it,
    are true today, ahead of any actual LLM step existing. It replaces what
    used to be two fields hardcoded directly into the app's `mockVisit.ts`
    staged-field list with the same data now flowing through a real service
    call — the honest amount of "real" this pass could deliver without an
    Azure OpenAI tenant.
  - `AzureOpenAiExtractionProvider`: inert placeholder, gated on
    `AZURE_OPENAI_ENDPOINT` / `AZURE_OPENAI_API_KEY` / `AZURE_OPENAI_DEPLOYMENT`.
    Configuring it makes `extractFromGapAnswers` throw a clear "not
    implemented yet" error rather than silently doing nothing — it proves
    the config path, not a working call. Wiring an actual chat-completion
    request needs a real tenant, deployment, and a tested extraction prompt,
    none of which exist in this environment.

- **`SinkProvider`** (`src/providers/sinkProvider.ts`)
  - `LocalFileSinkProvider` (default): the "temporary analysis sink" for the
    pilot, as plain JSON files under `data/visits/`. Zero-config, works with
    nothing installed.
  - `AzureTableSinkProvider`: a real Azure Table Storage client
    (`@azure/data-tables`), gated on `AZURE_STORAGE_CONNECTION_STRING`. This
    is not a stub — it was run and verified against the
    [Azurite](https://github.com/Azure/Azurite) local emulator in this build
    (see "Verification" below). Pointing `AZURE_STORAGE_CONNECTION_STRING`
    at a real Storage account, once one is provisioned for the pilot, is the
    only change needed to go from "tested locally" to production.

## Local development

```
cd backend
npm install
cp local.settings.json.example local.settings.json
npm run build
npm run start   # runs `func start`
```

If `func` isn't installed or can't be (see "Verification" below for why that
happened in this build's own environment), `npm run dev-shim` runs
`backend-shim.js` instead — a small plain Node HTTP server that routes real
requests into the same compiled handlers via `@azure/functions`' own
test-mode `HttpRequest`/`InvocationContext` constructors, on the same
`/api/...` routes and port (7071) `func start` would use. It reads
`local.settings.json`-style env vars from the process environment (export
them, or prefix the command), not from the file itself. It's a stand-in for
local development only — not a substitute for actually verifying against
`func` before this ships.

To point the sink at Azurite instead of local JSON files, install and run it
separately (`npm install azurite` anywhere, then
`npx azurite-table --tableHost 127.0.0.1 --tablePort 10002 --location <dir>`),
and set in `local.settings.json`:

```
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;
```

(This is Azurite's publicly documented, well-known development account key —
not a secret. Never reuse it against anything but a local emulator.)

## Verification

**The `func` CLI (`azure-functions-core-tools`) could not be installed or run
in the sandbox this was built in** — its installer needs
`pkgs.dev.azure.com`, which this environment's outbound proxy blocks by
policy (confirmed via `curl $HTTPS_PROXY/__agentproxy/status`, not assumed).
This is an environment limitation, not a design choice — before this backend
is used for real, run `npm run start` (`func start`) locally to confirm the
HTTP trigger bindings themselves come up correctly. That layer is
boilerplate (`app.http(...)` registration, matching the framework's own
documented shape) but genuinely unverified here.

What **was** verified, without `func`, using `@azure/functions`' own
`HttpRequest`/`InvocationContext` classes (both have public constructors the
package documents as "for testing purposes only" — this harness uses
exactly that, not a hand-rolled fake):

```
npm run harness
```

invokes all four handlers in-process and checks: unknown visit → 404,
extraction produces the expected staged fields via
`PassthroughExtractionProvider`, sync persists a record at the correct
on-disk path, a follow-up `GET` round-trips it correctly, and the
state-mirror endpoint round-trips a partial status update. This was run and
passed twice in this build — once against `LocalFileSinkProvider` (default,
no setup) and once against `AzureTableSinkProvider` with Azurite actually
running (`AZURE_STORAGE_CONNECTION_STRING` set to the string above) — so the
"swap-in" story for the real sink is demonstrated, not just asserted.

**A same-process harness has a real blind spot**, and it's worth naming: a
write and its own read within one process agree on whatever path or
assumption they're both wrong about. Two real bugs in this build were only
caught by going further — actually exporting the RN app to web
(`npx expo export --platform web`) and driving it through a real browser
(Playwright) against `npm run dev-shim` over genuine HTTP:

1. **CORS.** The harness never touches a browser, so it couldn't see that
   the app's web target got its cross-origin `fetch()` calls silently
   blocked. Fixed in `src/cors.ts`, applied to every route.
2. **`LocalFileSinkProvider`'s default path.** `__dirname`-relative from the
   *compiled* `dist/src/providers/` is one directory level short of the
   `backend/` root `tsconfig.json`'s `rootDir` implies — `data/visits/`
   files were landing in `dist/data/visits/` instead. The harness's own
   round trip passed throughout, because it was reading back the same wrong
   path it had just written to. Caught only once a synced record was
   expected to actually be sitting in `backend/data/visits/` and wasn't.
   Fixed, and `test/harness.ts` now separately asserts the on-disk location
   for exactly this reason.

Neither bug would have shipped unnoticed to a real pilot — `func start`
against a real `func` host would have surfaced the CORS gap the first time
a browser hit it, and the path bug the first time someone looked at
`data/visits/` and found it empty. But both were real, and catching them
here (via the RN app's actual web build, not just this backend in
isolation) is a stronger claim than "the harness passed."

## Deploying for real

Not done in this pass — see `../infra/` for the Bicep template that
provisions the target Function App + Storage account, and
`../ARCHITECTURE.md` for how this fits the full system and what's still
mocked. Once real Azure OpenAI credentials exist, set the three
`AZURE_OPENAI_*` values and `AzureOpenAiExtractionProvider` becomes the
active extraction path with no other code change — same for
`AZURE_STORAGE_CONNECTION_STRING` and the sink.
