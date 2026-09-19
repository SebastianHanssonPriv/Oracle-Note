import { promises as fs } from 'node:fs';
import path from 'node:path';
import { TableClient } from '@azure/data-tables';
import { VisitRecord } from '../domain/types';

export interface SinkProvider {
  readonly name: string;
  upsertVisit(record: VisitRecord): Promise<void>;
  getVisit(visitId: string): Promise<VisitRecord | null>;
}

/**
 * Zero-config default: the "temporary analysis sink" for the pilot, as
 * plain JSON files on disk. This is deliberately unglamorous — it exists so
 * /sync and /state have somewhere real to write during local dev and early
 * testing, before any Azure resource is provisioned. Swap to
 * AzureTableSinkProvider by setting AZURE_STORAGE_CONNECTION_STRING (see
 * ../config.ts and backend/README.md) once a storage account — or even just
 * Azurite, for closer-to-production local testing — is available.
 */
export class LocalFileSinkProvider implements SinkProvider {
  readonly name = 'local-file';

  // __dirname here is dist/src/providers once compiled (tsconfig's rootDir
  // "." preserves the src/ nesting under dist/) — three levels up reaches
  // the backend package root, not two. Caught by running this against a
  // real HTTP round-trip from the app; the in-process test harness alone
  // couldn't catch it, since a write and its own read agree on the same
  // (wrong) path within one process.
  constructor(private readonly dataDir: string = path.join(__dirname, '..', '..', '..', 'data', 'visits')) {}

  private fileFor(visitId: string): string {
    // visitId is a slug this system generates itself, not arbitrary input
    // from outside — still stripped defensively so a malformed id can't
    // escape dataDir.
    const safeId = visitId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.dataDir, `${safeId}.json`);
  }

  async upsertVisit(record: VisitRecord): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.writeFile(this.fileFor(record.visitId), JSON.stringify(record, null, 2), 'utf-8');
  }

  async getVisit(visitId: string): Promise<VisitRecord | null> {
    try {
      const raw = await fs.readFile(this.fileFor(visitId), 'utf-8');
      return JSON.parse(raw) as VisitRecord;
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') return null;
      throw err;
    }
  }
}

/**
 * Real Azure-native sink: Azure Table Storage via @azure/data-tables.
 * Verified in this build against the Azurite local emulator (see
 * backend/README.md for how) — pointing AZURE_STORAGE_CONNECTION_STRING at
 * a real Storage account connection string, once one is provisioned for the
 * pilot, is the only change needed to go from "tested locally" to
 * production. No code here is a stub.
 */
export class AzureTableSinkProvider implements SinkProvider {
  readonly name = 'azure-table-storage';
  private readonly client: TableClient;
  private tableEnsured = false;

  constructor(connectionString: string, tableName: string) {
    // Local/dev connection strings (Azurite, or an explicit http:// endpoint)
    // need allowInsecureConnection set explicitly — the SDK only infers it
    // automatically for the literal "UseDevelopmentStorage=true" shorthand,
    // not for a fully-spelled-out http:// endpoint. A real https:// endpoint
    // never sets this, so production is unaffected.
    const isPlainHttp =
      connectionString.includes('UseDevelopmentStorage=true') ||
      connectionString.includes('DefaultEndpointsProtocol=http;') ||
      /(^|;)TableEndpoint=http:\/\//i.test(connectionString);
    this.client = TableClient.fromConnectionString(connectionString, tableName, { allowInsecureConnection: isPlainHttp });
  }

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    try {
      await this.client.createTable();
    } catch (err) {
      // 409 TableAlreadyExists is expected and fine — createTable is meant
      // to be called idempotently, per the SDK's own documented usage.
      if ((err as { statusCode?: number })?.statusCode !== 409) throw err;
    }
    this.tableEnsured = true;
  }

  async upsertVisit(record: VisitRecord): Promise<void> {
    await this.ensureTable();
    await this.client.upsertEntity(
      {
        partitionKey: 'visit',
        rowKey: record.visitId,
        data: JSON.stringify(record),
        updatedAt: record.updatedAt,
      },
      'Replace'
    );
  }

  async getVisit(visitId: string): Promise<VisitRecord | null> {
    await this.ensureTable();
    try {
      const entity = await this.client.getEntity<{ data: string }>('visit', visitId);
      return JSON.parse(entity.data) as VisitRecord;
    } catch (err) {
      if ((err as { statusCode?: number })?.statusCode === 404) return null;
      throw err;
    }
  }
}
