import { GapAnswer, StagedField } from '../domain/types';

export interface ExtractionProvider {
  readonly name: string;
  extractFromGapAnswers(gapAnswers: GapAnswer[]): Promise<StagedField[]>;
}

/**
 * Zero-config default. This is NOT natural-language extraction — it turns
 * each already-structured gap answer directly into a "you said" staged
 * field. It exists so the /extract endpoint's contract, and the app's real
 * network call to it, are true today, ahead of there being any actual LLM
 * step behind it. Swap it out via `selectExtractionProvider()` in
 * `../config.ts` once AzureOpenAiExtractionProvider is configured.
 */
export class PassthroughExtractionProvider implements ExtractionProvider {
  readonly name = 'passthrough-local';

  async extractFromGapAnswers(gapAnswers: GapAnswer[]): Promise<StagedField[]> {
    return gapAnswers.map((a) => ({
      id: a.questionId,
      label: a.topicLabel,
      value: a.answer,
      origin: 'you-said' as const,
    }));
  }
}

/**
 * Real implementation — inert until AZURE_OPENAI_ENDPOINT / _API_KEY /
 * _DEPLOYMENT are set (see ../config.ts). This proves the configuration
 * path exists; it does not yet make a call. Wiring an actual chat-completion
 * request (with a defined extraction prompt, tested against real transcript
 * text) is separate, out-of-scope work until there is a tenant and
 * deployment to test it against — see backend/README.md.
 */
export class AzureOpenAiExtractionProvider implements ExtractionProvider {
  readonly name = 'azure-openai';

  constructor(
    private readonly endpoint: string,
    private readonly apiKey: string,
    private readonly deployment: string
  ) {}

  async extractFromGapAnswers(_gapAnswers: GapAnswer[]): Promise<StagedField[]> {
    throw new Error(
      `AzureOpenAiExtractionProvider (endpoint=${this.endpoint}, deployment=${this.deployment}) is configured but not implemented yet. ` +
        'It is a placeholder that proves the config path works, not a working extraction call — see backend/README.md.'
    );
  }
}
