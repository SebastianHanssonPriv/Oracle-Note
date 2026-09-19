// Mock content for the single wired-through demo visit, transcribed verbatim
// from project/Oracle Note - Flow.dc.html where the source provides it.
//
// ASSUMPTION: the source's "Oracle asks out loud" screen (step 06 / isAsking)
// only shows copy for question 1 of 3 (decision maker) — it does not author
// wording for questions 2 and 3. The lines below marked "authored" are new
// copy I wrote to keep the 3-question loop coherent; they were not in the
// design bundle and should be reviewed/replaced with real product copy.

export const visit = {
  customer: 'Bergman Maskin AB',
  visitMeta: '11:05 visit · matched from calendar, time and location',
  visitKind: 'Existing customer visit',
  visitDate: '15 Sep 11:05 · Borås',
};

export type GapQuestion = {
  id: string;
  num: number;
  title: string;
  meta: string;
  mandatory: boolean;
  oracleAsked: string;
  liveTranscript: string; // authored
};

export const gapQuestions: GapQuestion[] = [
  {
    id: 'decision-maker',
    num: 1,
    title: 'Decision maker',
    meta: 'Mandatory · nobody named in the debrief',
    mandatory: true,
    oracleAsked: '"Who decides on the frame agreement, and who signs it?"',
    liveTranscript: '"Ulrika Sand in purchasing decides, but the plant manager signs anything over two hundred thousand…"',
  },
  {
    id: 'next-step',
    num: 2,
    title: 'Next step and date',
    meta: 'Mandatory · you said "after their audit"',
    mandatory: true,
    // authored — source only gives the topic, not the spoken question or reply
    oracleAsked: '"You said the next step is after their audit — what\'s the date, and what happens?"',
    liveTranscript: '"Their audit wraps up the eighteenth, so let\'s target Friday the eighteenth for the kanban quote…"',
  },
  {
    id: 'consumption-change',
    num: 3,
    title: 'Consumption change',
    meta: 'Optional',
    mandatory: false,
    // authored — source only gives the topic, not the spoken question or reply
    oracleAsked: '"Anything changed in what they\'re ordering — more, less, or different parts?"',
    liveTranscript: '"Nothing yet, but they hinted at a second production line next year…"',
  },
];

export const stagedFields = [
  { label: 'Stage', value: 'Proposal', badge: { text: 'Extracted', variant: 'neutral' as const } },
  { label: 'Volume / value', value: 'SEK 180–220k per year', badge: { text: 'Extracted', variant: 'neutral' as const } },
  {
    label: 'Decision maker',
    value: 'Ulrika Sand decides · plant mgr signs over 200k',
    badge: { text: 'You said', variant: 'brand' as const },
    highlighted: true,
  },
  {
    label: 'Next step',
    value: 'Kanban quote · Fri 18 Sep',
    badge: { text: 'You said', variant: 'brand' as const },
    highlighted: true,
  },
  {
    label: 'Risk flagged',
    value: 'Competitor quote 8% under ours',
    badge: { text: 'Extracted', variant: 'neutral' as const },
    linksToTranscript: true,
  },
  { label: 'Consumption change', value: 'Left blank · optional', muted: true },
];

export const riskTranscript = {
  window: 'Transcript · 01:12–01:31',
  before: "…they're happy with delivery reliability, that came up twice. ",
  highlighted: 'Purchasing has a quote from someone else, about eight percent under us on fasteners',
  after: ", so price is going to come back at us. I said we'd show the kanban savings instead of moving on unit price…",
  origin: 'Origin: extracted from your debrief · not edited',
};

export const syncedRows = [
  { label: 'Account record', value: 'Stage, volume, decision maker updated', badge: { text: 'Written', variant: 'success' as const } },
  { label: 'Task created', value: 'Send kanban quote · due Fri 18 Sep', badge: { text: 'Written', variant: 'success' as const } },
  { label: 'Deal health', value: 'At risk → Improving', badge: { text: 'Written', variant: 'success' as const } },
  { label: 'Audit trail', value: 'Transcript and field origins retained 90 days', badge: { text: 'Kept', variant: 'neutral' as const } },
];

export const homeVisits = [
  { time: '09:20', customer: 'Setterwall Mekaniska', note: 'Synced · 5 fields updated', status: 'synced' as const },
  // Bergman's note/status here are placeholders only — HomeScreen renders its
  // row from the persisted visitStore state, not from this static entry.
  { time: '11:05', customer: 'Bergman Maskin AB', note: 'Existing customer visit · debrief not started', status: 'next' as const },
  { time: '13:30', customer: 'Nordflex Verkstad AB', note: 'Upcoming · 22 km, leave 13:00', status: 'upcoming' as const },
  { time: '15:45', customer: 'Lindqvist Hydraulik', note: 'Upcoming · prospect, first visit', status: 'upcoming' as const },
];
