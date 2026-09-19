// Target Azure footprint for the Oracle Note pilot backend — see
// ../ARCHITECTURE.md for how this fits the whole system and what's still
// mocked without it. Provisions a Consumption-plan Function App (near-zero
// idle cost, scales to the pilot's actual traffic), the Storage account
// backing both the Functions runtime and the temporary analysis sink table,
// and Application Insights for logs/metrics. Deliberately does NOT
// provision Azure AI Speech or Azure OpenAI — those are separate resources
// to add once there's a defined extraction prompt and STT integration to
// test, not before (see backend/README.md's "Deploying for real").
//
// NOT VALIDATED against a real subscription or the `bicep`/`az` CLI in the
// environment this was written in — neither could be installed (same
// outbound-proxy restriction documented in backend/README.md; `bicep`'s
// installer needs a github.com release download, which this environment's
// proxy also blocks by policy). Run `az bicep build --file main.bicep` or
// `az deployment group validate` before the first real deployment. Resource
// types and API versions here are long-stable ones, chosen deliberately
// over newer alternatives (e.g. classic Y1 Consumption over Flex
// Consumption) to minimize the risk of an unverified syntax drift.

@description('Short, unique name segment for this deployment, e.g. "oraclenote-pilot". Used as a prefix for every resource name.')
@minLength(3)
@maxLength(16)
param baseName string

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Deployment environment tag.')
@allowed(['pilot', 'test', 'prod'])
param environmentTag string = 'pilot'

@description('Allowed CORS origin for the Function App (the app\'s web build origin, if used). "*" is fine for a pilot; tighten before wider rollout.')
param corsAllowedOrigin string = '*'

var storageAccountName = toLower(replace('${baseName}sto', '-', ''))
var functionAppName = '${baseName}-func'
var appServicePlanName = '${baseName}-plan'
var appInsightsName = '${baseName}-insights'
var logAnalyticsName = '${baseName}-logs'
var sinkTableName = 'oracleNoteVisits'

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
  tags: {
    environment: environmentTag
  }
}

resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource sinkTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-01-01' = {
  parent: tableService
  name: sinkTableName
}

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
  tags: {
    environment: environmentTag
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
  tags: {
    environment: environmentTag
  }
}

resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  kind: 'functionapp'
  properties: {
    reserved: true // Linux
  }
  tags: {
    environment: environmentTag
  }
}

resource functionApp 'Microsoft.Web/sites@2022-03-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'Node|20'
      cors: {
        allowedOrigins: [
          corsAllowedOrigin
        ]
      }
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~20'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'CORS_ALLOWED_ORIGIN'
          value: corsAllowedOrigin
        }
        {
          name: 'AZURE_STORAGE_CONNECTION_STRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
        }
        {
          name: 'AZURE_STORAGE_TABLE_NAME'
          value: sinkTableName
        }
        // Left empty on purpose — see backend/README.md. Filling these in
        // (via `az functionapp config appsettings set`, not by editing this
        // template with a real key) is what activates
        // AzureOpenAiExtractionProvider; no code or redeploy needed.
        {
          name: 'AZURE_OPENAI_ENDPOINT'
          value: ''
        }
        {
          name: 'AZURE_OPENAI_API_KEY'
          value: ''
        }
        {
          name: 'AZURE_OPENAI_DEPLOYMENT'
          value: ''
        }
      ]
    }
  }
  tags: {
    environment: environmentTag
  }
}

output functionAppName string = functionApp.name
output functionAppHostName string = functionApp.properties.defaultHostName
output storageAccountName string = storageAccount.name
output appInsightsConnectionString string = appInsights.properties.ConnectionString
