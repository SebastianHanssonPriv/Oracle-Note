# Infrastructure

`main.bicep` provisions the target Azure footprint for the Oracle Note
pilot backend (see `../backend/README.md` for the application code this
runs, and `../ARCHITECTURE.md` for how it fits the whole system):

- A Consumption-plan (Y1) Linux Function App running the Node backend.
- The Storage account backing both the Functions runtime
  (`AzureWebJobsStorage`) and the temporary analysis sink's Table Storage
  table (`oracleNoteVisits`) — see `backend/src/providers/sinkProvider.ts`.
- Application Insights + a Log Analytics workspace for logs and metrics.

It deliberately does **not** provision Azure AI Speech or Azure OpenAI —
see "Not included" below.

## Not validated in this environment

**Neither the `bicep` CLI nor `az` could be installed in the sandbox this
was written in** — `bicep`'s installer needs a GitHub release download,
which this environment's outbound proxy blocks by policy (confirmed via
`curl -o /dev/null -w '%{http_code}' https://github.com/...` returning 403;
`az` has the same kind of external-installer dependency). This is the same
category of environment limitation as `backend/README.md`'s `func` CLI
note, not a design choice.

**Before this is used for a real deployment**, run:

```
az bicep build --file main.bicep
az deployment group validate \
  --resource-group <rg> \
  --template-file main.bicep \
  --parameters main.parameters.example.json
```

Resource types and API versions were chosen deliberately for stability —
classic Y1 Consumption over the newer Flex Consumption plan shape, and
long-stable API versions (`Microsoft.Web/sites@2022-03-01`,
`Microsoft.Storage/storageAccounts@2023-01-01`, etc.) — specifically to
minimize the risk of an unverified syntax drift, but "chosen carefully"
is not the same claim as "verified." Treat this the same way
`backend/README.md` asks you to treat the `func`-start layer: a correctly-
shaped starting point, not a tested one.

## Deploying

```
az group create --name <rg> --location <region>
az deployment group create \
  --resource-group <rg> \
  --template-file main.bicep \
  --parameters main.parameters.example.json
```

Then deploy the backend code itself (from `../backend/`):

```
npm run build
func azure functionapp publish <functionAppName>
```

(`<functionAppName>` is this deployment's `functionAppName` output.)

## What this costs

Consumption plan Function Apps bill per execution and per GB-second of
memory, with a monthly free grant (1M executions, 400,000 GB-s) that a
pilot's traffic will not come close to exceeding. Storage (Table Storage +
the Functions runtime's blob/queue usage) and Application Insights
ingestion are both usage-based and, at pilot volume, low single-digit
dollars a month. This is not a quote — get one from the Azure pricing
calculator with your actual subscription's region and rates before
presenting a number — but the shape is: near-zero idle cost, no fixed
monthly commitment, scales with actual rep usage.

## Not included — provisioned separately, once there's something to test

- **Azure AI Speech** and **Azure OpenAI**: not provisioned here. Adding
  them before there's a real extraction prompt tested against real
  transcript text, and a decision on which Azure OpenAI region/model to
  use, would be provisioning ahead of a plan rather than to one. See
  `backend/README.md`'s `AzureOpenAiExtractionProvider` section for the
  three app settings (`AZURE_OPENAI_ENDPOINT` / `_API_KEY` / `_DEPLOYMENT`)
  this template already leaves as empty placeholders on the Function App,
  ready to fill in without a redeploy once that exists.
- **Entra ID app registration** for the backend API itself: every route in
  `backend/src/functions/` is currently `authLevel: 'anonymous'` — there is
  no auth on this API at all yet, matching "no connections to be had yet."
  Before this carries anything beyond mock/demo data, it needs its own
  Entra app registration (exposing a scope the RN app's MSAL token can
  request — see `app/README.md`'s "Sign-in / MDM" section) and each
  function's `authLevel` changed to `function` or validated against that
  token, not left open. This is a real, not-yet-closed gap — see
  `../ARCHITECTURE.md`'s "Risks and Trade-offs".
- **CarPlay/Android Auto native extensions**, **real STT/wake-word
  pipeline**, and **SuperOffice/OTR integration**: all separate, unscoped
  efforts — see `app/README.md`'s "Known limitations" and
  `../ARCHITECTURE.md`.

## Production hardening not done here

- `AZURE_OPENAI_API_KEY` (once set) and the storage account key are stored
  as plain Function App settings, not Key Vault references. Fine for a
  pilot behind Entra auth and MDM-managed devices; before a wider rollout,
  move both to Key Vault and reference them with `@Microsoft.KeyVault(...)`
  app setting syntax instead.
- `corsAllowedOrigin` defaults to `*`. Fine while the only client is this
  app during a pilot; tighten to the app's actual origin(s) once those are
  fixed.
