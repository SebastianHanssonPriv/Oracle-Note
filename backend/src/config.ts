import { AzureOpenAiExtractionProvider, ExtractionProvider, PassthroughExtractionProvider } from './providers/extractionProvider';
import { AzureTableSinkProvider, LocalFileSinkProvider, SinkProvider } from './providers/sinkProvider';

// Same pattern as the RN app's src/auth/msalConfig.ts: real implementations
// exist as real code, gated on env vars, and the app degrades to a local/
// mock default rather than failing when they're absent — never a silent
// dependency on credentials that don't exist yet.

export function isAzureOpenAiConfigured(): boolean {
  return Boolean(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_DEPLOYMENT);
}

export function selectExtractionProvider(): ExtractionProvider {
  if (isAzureOpenAiConfigured()) {
    return new AzureOpenAiExtractionProvider(
      process.env.AZURE_OPENAI_ENDPOINT!,
      process.env.AZURE_OPENAI_API_KEY!,
      process.env.AZURE_OPENAI_DEPLOYMENT!
    );
  }
  return new PassthroughExtractionProvider();
}

export function isAzureTableStorageConfigured(): boolean {
  return Boolean(process.env.AZURE_STORAGE_CONNECTION_STRING);
}

export function selectSinkProvider(): SinkProvider {
  if (isAzureTableStorageConfigured()) {
    return new AzureTableSinkProvider(process.env.AZURE_STORAGE_CONNECTION_STRING!, process.env.AZURE_STORAGE_TABLE_NAME ?? 'oracleNoteVisits');
  }
  return new LocalFileSinkProvider();
}
