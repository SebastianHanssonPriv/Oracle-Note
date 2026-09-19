// Shared shapes for the Oracle Note backend. Deliberately mirrors, rather
// than imports, the RN app's own types (`app/src/data/mockVisit.ts`,
// `app/src/data/visitStore.ts`) — the two are separate deployables that
// happen to agree on a JSON contract, not a shared TypeScript project.

export type StagedFieldOrigin = 'extracted' | 'you-said';

export interface StagedField {
  id: string;
  label: string;
  value: string;
  origin: StagedFieldOrigin;
}

export interface GapAnswer {
  questionId: string;
  /** Short field label this answer should stage as, e.g. "Decision maker". */
  topicLabel: string;
  /** The spoken question, kept for audit/context — not used for extraction logic itself. */
  question: string;
  answer: string;
}

export type VisitStatus = 'not_started' | 'recorded' | 'answering' | 'staged' | 'synced';

export interface VisitRecord {
  visitId: string;
  customer: string;
  status: VisitStatus;
  elapsedSeconds?: number;
  askingIndex?: number;
  gapAnswers?: GapAnswer[];
  stagedFields?: StagedField[];
  updatedAt: string;
  syncedAt?: string;
}
