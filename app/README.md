# Oracle Note

React Native (Expo) implementation of the decided Oracle Note flow from the
design handoff bundle in [`../design/`](../design) (`../design/README.md`,
`../design/chats/chat1.md`, `../design/project/Oracle Note - Flow.dc.html`).

## Scope

Per the scoping discussion at the start of this build: this implements the
**single decided, concept-aligned flow** from
`../design/project/Oracle Note - Flow.dc.html` (home → in-car ready →
recording → continue-or-later → asking → staged → synced, with an inactive
branch off "later") — not the full `Oracle Note - Option Board.dc.html`,
which is a design-decision record containing ~15 competing/superseded
mockups, not a build spec.

The continue-or-later step, and dropping the "wait until parked" gate in
favor of asking right after the monologue, were later revisions on top of
that source file, made directly against this build.

Target codebase: this repo, under `app/`. Platform: React Native via Expo
(iOS + Android), one codebase.

## Running it

```
cd app
npm install
npm run ios      # or: npm run android
```

## Structure

- `src/theme.ts` — colors, typography, corner registration-mark constants, lifted from the source `.dc.html`'s CSS.
- `src/ui/` — shared primitives: `Blueprint` (the bordered "steel on paper" frame with corner marks), `CTAButton`, `Tag`, `Row`, `TextAction`, `PhoneChrome`, `Waveform`, `CarFrame`, `TranscriptSheet`.
- `src/data/mockVisit.ts` — the single demo dataset (Bergman Maskin AB) the flow is wired against.
- `src/screens/` — one screen per flow step: `Home`, `CarReady`, `CarRecording`, `CarAsk` (continue-or-later, voice-only), `CarInactive` (the "later" branch), `Asking` (loops through the 3 gap questions), `Staged`, `Synced`.
- `App.tsx` — font loading + React Navigation native-stack wiring.

## Known limitations / assumptions

- **"Later" ends the session rather than partially staging it.** Choosing
  "Later" on the continue-or-later screen goes straight to `CarInactive` —
  nothing is staged or synced yet. There's no persistence layer, so in this
  build that visit doesn't actually resume from `Home` later; it's a dead
  end included to show the state, not a working save-and-resume.
- **No real voice, speech-to-text, calendar-matching, or CRM integration.**
  This is a UI/interaction build of the design, using the same fixed mock
  dataset the prototype used. Wiring an actual STT engine, calendar/location
  matching, and a CRM push API is a separate, unscoped effort.
- **Car display is not real CarPlay/Android Auto.** The brief and chat
  transcript are explicit that the car screen should have zero touch
  targets — start/stop/skip are voice-only, or done on the phone before the
  car moves. A real implementation of that surface needs a native CarPlay
  extension (Apple-gated entitlement) and an Android Auto template app,
  which are separate native projects, not something a plain Expo/RN app can
  host. This build instead renders those three screens as a non-interactive,
  landscape-framed card inside the phone app, and adds a clearly-labeled
  "DEV — simulate…" control *outside* that frame so the flow is still
  testable end to end without a voice pipeline. That control is scaffolding,
  not product UI — it should be removed once real voice triggers exist.
- **Two of the three "Oracle asks out loud" questions have authored copy.**
  The source design only writes out the spoken question and live-transcript
  text for question 1 of 3 (decision maker). Questions 2 (next step and
  date) and 3 (consumption change) only have topic labels in the source, so
  I wrote plausible spoken-question and reply copy for those
  (`src/data/mockVisit.ts`, flagged inline) to keep the 3-question loop
  functional. That copy should be reviewed and likely replaced.
- **"Edit text" on the transcript sheet does not open an editor.** The
  source prototype only wires it back to the staged-record view (same as
  "Keep field"); no editable-text-field state was specified, so this build
  keeps that behavior rather than inventing a text-edit flow.
- Visual sizing was adapted from the source's fixed-pixel mockup artboards
  (560×320 car card, 340×700 phone card) to responsive layouts that fill the
  actual device width, since this ships as a real app rather than a framed
  design-review canvas.
