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

## Design system

Visually, this runs on **Bufab** — Bufab's own internal design system (colors,
type, spacing, radius, shadow, component conventions), not the "Industry"
steel-on-paper placeholder the original design review used (that system was
never actually available to it — see `../design/chats/chat1.md`, where the
designer explicitly flags this and asks for the real one). `src/theme.ts` is
transcribed token-for-token from that system's `project/tokens.json` and
`project/components/bundle.css` (light theme only — no dark-mode
infrastructure in this app yet, though the source system defines a full dark
theme already, under each token's `.dark` value). Layout, copy and the flow
itself are unchanged; every component was rebuilt against Bufab's actual
`.ds-btn` / `.ds-card` / `.ds-badge` CSS rather than approximated.

## Structure

- `src/theme.ts` — Bufab's tokens: colors, type scale, spacing (4px grid), radius, shadow, control sizes.
- `src/ui/` — shared primitives, each modeled on its Bufab component: `Card` (`.ds-card`), `Button` (`.ds-btn`, 4 variants × 3 sizes), `Badge` (`.ds-badge`, 6 status tones), `Row`, `TextAction`, `PhoneChrome`, `Waveform`, `CarFrame`, `TranscriptSheet`.
- `src/data/mockVisit.ts` — the single demo dataset (Bergman Maskin AB) the flow is wired against.
- `src/data/visitStore.ts` — local persistence (AsyncStorage) for that visit's debrief progress: status, elapsed recording time, and which gap question the rep is on. This is what makes "Later" and "Finish the rest later" real save-and-resume rather than a dead end. Every write also fires a best-effort mirror to the backend (see "Backend" below).
- `src/services/` — client for [`../backend/`](../backend): `backendConfig.ts` (unconfigured by default, same pattern as `src/auth/`), `backendClient.ts` (extraction, sync, and state-mirror calls, all best-effort — never throws, never blocks the UI on a network problem); `audioRecording.ts` (in-memory handle to the last finished recording — see "Audio capture" below).
- `src/auth/` — Entra ID (Azure AD) SSO scaffold via MSAL. See "Sign-in / MDM" below — this ships unconfigured (placeholder IDs) and is inert until real values are set.
- `src/screens/` — one screen per flow step: `Home`, `CarReady`, `CarRecording`, `CarAsk` (continue-or-later, voice-only), `CarInactive` (the "later" branch), `Asking` (loops through the 3 gap questions, and can be left early via "Finish the rest later"), `Staged`, `Synced`.
- `App.tsx` — font loading, auth gate, and React Navigation native-stack wiring.

## "Later" / resume, on purpose

The rep is never forced through the gap questions on the app's timeline.
After the monologue, "Later" on `CarAsk` — and "Finish the rest later" at any
point inside `Asking` — persist exactly where things stand (recorded but
unanswered, or partway through the 3 questions) and return to `Home`. `Home`
reads that state on every focus and reflects it truthfully: "Recorded in the
car · 3 questions to answer", "N questions left to answer", "Answers in ·
ready to sync", or "Synced". The primary button on `Home` resumes at the
right screen — it never restarts the debrief from scratch. A "Reset demo
data" link at the bottom of `Home` clears it for repeat testing.

## Backend

[`../backend/`](../backend) is a real Azure Functions API — see its own
README for what it does and how it was verified. Same principle as `src/auth/`:
this app ships pointed at nothing (`EXPO_PUBLIC_BACKEND_BASE_URL` unset,
`src/services/backendConfig.ts`), so it behaves exactly as before unless
someone deliberately runs the backend locally and points the app at it (or,
eventually, a real pilot deployment). Three places call it, all
best-effort — never blocking, never throwing, silently falling back to
what already worked if the backend is absent or unreachable:

- `data/visitStore.ts` mirrors every local status change remotely.
- `screens/StagedScreen.tsx` asks the backend to turn the two mandatory gap
  answers into staged "you said" fields, instead of those two fields only
  ever being hardcoded in `mockVisit.ts`.
- `screens/StagedScreen.tsx`'s "Confirm & sync" also POSTs the confirmed
  record to the backend's sink, alongside the existing local status change.

## Audio capture

`CarRecordingScreen` records real microphone audio via
[`expo-audio`](https://www.npmjs.com/package/expo-audio) (the app's SDK 57
recording API; `expo-av`, its predecessor, is deprecated) — the clock now
shows the real elapsed recording time, starting from `00:00`, instead of
the fixed `01:48` the source mockup's static frame used. On mount, the
screen requests microphone permission
(`app.json`'s `expo-audio` plugin entry sets `NSMicrophoneUsageDescription`
/ `RECORD_AUDIO`) and starts recording if granted; "Oracle, stop" finalizes
it and hands the local file URI to `src/services/audioRecording.ts`.

**If the microphone is unavailable for any reason** — permission denied, no
microphone (this also covers running the web build in a browser or
automated test with no mic device), or the recording call throwing — the
screen falls back to exactly the timer-only behavior it had before real
capture existed. A rep is never blocked by a microphone problem. Verified
in this build via two separate Playwright passes against the web export:
one with no microphone available at all (the sandbox's actual condition,
confirming the fallback path), one launching Chromium with
`--use-fake-device-for-media-stream` and a granted `microphone` permission
(confirming the real recording path — `recorder.record()`,
`useAudioRecorderState`'s live `durationMillis`, and `recorder.stop()` /
`recorder.currentTime` all worked against a real, if synthetic, media
stream, not just type-checked).

**What doesn't exist yet, on purpose**: nothing consumes the recorded file.
There's no upload, no STT, and — because of that — no real
"audio deleted after transcription," despite that being the Staged screen's
existing copy (see `ARCHITECTURE.md`'s "Governance and security" section,
which flags this explicitly as a UI promise ahead of the code that would
make it true). The file sits in the recorder's local cache/document
directory until the OS reclaims it or the app is reset; uploading it to a
new `SttProvider` on the backend (not scaffolded yet — `backend/` currently
only has `ExtractionProvider` and `SinkProvider`, see `backend/README.md`)
is the next piece, once real transcription exists to send it to.

## Voice triggers

`CarReadyScreen` and `CarAskScreen` listen for their real spoken phrases —
"Oracle, start debrief", "Continue", "Later" — via
[`expo-speech-recognition`](https://www.npmjs.com/package/expo-speech-recognition)
(`src/services/voiceCommands.ts`), matching the brief's "zero touch
targets" requirement (`design/chats/chat1.md`, turn 3) for real, not just in
UI copy. `DevAdvance`'s "DEV — simulate" control stays as the manual
fallback on every car screen, on purpose: voice recognition can be denied,
unsupported, or simply wrong in a noisy car, and a rep — or someone running
a live demo — should never be stuck. A small "Listening for your voice"
indicator (`src/ui/VoiceListeningBadge.tsx`) shows only when recognition is
actually active, so it's never a claim the app isn't backing up.

**`CarRecordingScreen`'s "Oracle, stop" is deliberately DEV-only, not a gap.**
Running `expo-audio`'s recorder and `expo-speech-recognition`'s listener at
the same time would mean two consumers fighting over one microphone session,
which most platforms don't support cleanly — a real, silent-failure risk
this sandbox's headless verification wouldn't catch either way, so shipping
it without being sure would have been the wrong tradeoff. The correct fix,
not done here: replace `CarRecordingScreen`'s separate `expo-audio` recorder
with `expo-speech-recognition`'s own `recordingOptions: { persist: true }`,
which persists the monologue audio *and* streams live transcripts *and* can
catch "stop" in that same transcript — one mic session doing all three
jobs instead of two sessions contending for it.

Verified the same way as audio capture: two Playwright passes against the
web export, one with no microphone (confirms the DEV-button fallback still
works, no crashes), one with a fake media device and granted permission
(confirms `isRecognitionAvailable()`, `requestPermissionsAsync()`, and
`start()` all genuinely succeed and the app reaches `'listening'` status —
not just that the code type-checks). Actually saying a trigger phrase and
having it recognized is **not** verified here: there's no real audio input
in this sandbox, and even the browser's Web Speech API depends on a
cloud STT service this environment's egress policy blocks. Treat the
matching logic itself (`useVoiceCommands`' `result` handler) as reviewed,
not tested against real speech.

## Sign-in / MDM (Entra ID SSO)

The phones this ships to are fully Intune-enrolled: device compliance and
encryption come from MDM, and VPN is always-on and self-reasserting, so
neither needs any code in this app. SSO is different — Teams, Outlook,
Copilot and Defender get silent sign-in because they're Microsoft
first-party apps already registered with the device's sign-in broker.
Oracle Note isn't, and has to register itself the same way to get the same
experience. `src/auth/` is that registration's app-side half, via
[`react-native-msal`](https://github.com/stashenergy/react-native-msal).

**As shipped, this is a no-op.** `src/auth/msalConfig.ts` holds placeholder
IDs; `isMsalConfigured()` returns `false`; `App.tsx` skips the sign-in gate
entirely and the app behaves exactly as it did before this existed. The
Staged screen's compliance line reflects this honestly — "Demo mode ·
device verification not configured" instead of a hardcoded claim of
verification that was never actually checked.

**To make it real:**

1. In the Entra admin center: **App registrations → New registration**,
   name it, and add two redirect URIs:
   - Android (type "Mobile and desktop applications"):
     `msauth://<android.package>/<androidPackageSignatureHash>`
   - iOS/macOS: `msauth.<ios.bundleIdentifier>://auth`

   `android.package` / `ios.bundleIdentifier` are set in `app.json`
   (currently the placeholder `com.oraclenote.app` — change it to whatever
   this app is actually going to be signed and published as, on both
   platforms, consistently).
2. Get the Android signature hash for whichever keystore will sign the
   build. For a local debug build:
   ```
   keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore \
     | openssl sha1 -binary | openssl base64
   ```
   For an EAS-managed build, `eas credentials` shows the equivalent for
   whatever keystore EAS is signing with. Put that hash in both
   `app.json`'s `plugins` entry for `react-native-msal` and in
   `ANDROID_PACKAGE_SIGNATURE_HASH` in `msalConfig.ts` — they need to match.
3. Copy the registration's **Application (client) ID** and **Directory
   (tenant) ID** into `MSAL_CLIENT_ID` / `MSAL_TENANT_ID` in
   `msalConfig.ts`.
4. Under **API permissions**, add whatever scope the backend this app
   eventually syncs to actually exposes, and put it in `MSAL_SCOPES`.
   `User.Read` (Microsoft Graph) is left as a placeholder that proves
   sign-in works before that backend exists.

**This requires leaving Expo Go.** MSAL needs native iOS/Android SDKs
linked in, which Expo Go can't do. Once real values are set, run
`npx expo prebuild` (or build via EAS) and use an Expo **development
build** instead — `expo-dev-client` is already a dependency for this
reason.

Once configured: launch tries a silent, broker-backed token acquisition
first (the same thing Teams/Outlook do) and only falls back to an
interactive "Sign in with Microsoft" screen if that fails. The Staged
screen's compliance line then shows the real signed-in identity instead of
"Demo mode."

**Not done here, and worth being explicit about:** the backend/CRM side of
this (registering that API in Entra ID, exposing a scope, optionally
gating it with Conditional Access on device compliance) is separate,
out-of-band work — this scaffold only covers Oracle Note's own sign-in.

## Known limitations / assumptions

- **Badge color mapping is a judgment call, not something Bufab's docs specify.**
  Bufab defines six status tones (neutral/brand/success/warning/danger/info)
  but no product ever told it what "Extracted" vs "You said" vs "Written"
  should map to. This build uses: extracted/system-derived values →
  `neutral`, rep-provided-but-unsynced values → `brand`, and post-sync
  confirmation ("Written", "Synced") → `success`. Worth a real design
  review once this isn't the only screen using these tones.
- **Dark mode isn't wired up**, even though Bufab's tokens define a complete
  dark theme (`project/tokens.json`, each color token's `.dark` value).
  Adding it means a `useColorScheme()`-driven variant of `theme.ts`, not a
  redesign.
- **The MSAL scaffold is untested against a real tenant.** It's built from
  `react-native-msal`'s actual type definitions and Expo config plugin
  source (not guessed from memory), and the JS/TS side type-checks and
  bundles cleanly, but the native sign-in flow itself needs a real Entra ID
  app registration, a development build, and an actual device or simulator
  to verify — none of which exist in the environment this was built in.
  Treat it as a correctly-shaped starting point, not a tested one.
- **Save-and-resume is on-device first, remote-mirrored best-effort.**
  `AsyncStorage` stays the source of truth the UI reads from (see
  "Backend" above), and every status change now also fires a best-effort
  mirror to the backend's `/state` endpoint. That mirror is real — but it's
  fire-and-forget: if the backend is unreachable at the exact moment a rep
  reinstalls or switches phones, whatever hasn't successfully mirrored yet
  is still lost. A real build would want to confirm the mirror landed (or
  retry) before treating a status change as durable, not just attempt it
  once and move on.
- **Staged field values are real for the two mandatory gap answers, still
  static for everything else.** `Staged`'s "Decision maker" and "Next step"
  rows now come from a real network round-trip through the backend's
  `/extract` endpoint (see "Backend" above) instead of being hardcoded
  directly in `mockVisit.ts`. But the extraction itself is a deterministic
  pass-through, not real natural-language extraction (no Azure OpenAI
  tenant exists to call) — and the "extracted" fields (Stage, Volume, Risk
  flagged) and the optional Consumption-change row are still the fixed mock
  content, not derived from anything the rep actually said, since there's
  no real audio capture or STT feeding them yet.
- **Real audio capture exists; speech-to-text, calendar-matching, and CRM
  integration still don't.** `CarRecordingScreen` records real microphone
  audio (see "Audio capture" above) — but nothing transcribes it, the gap
  questions and staged "extracted" fields are still the same fixed mock
  content the prototype used regardless of what was actually said, and
  there's no calendar/location matching or CRM push API. Wiring an actual
  STT + extraction pipeline behind the recording that now exists, plus
  calendar/location matching and a CRM push API, remains a separate,
  unscoped effort.
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
