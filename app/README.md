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
- `src/data/visitStore.ts` — local persistence (AsyncStorage) for that visit's debrief progress: status, elapsed recording time, and which gap question the rep is on. This is what makes "Later" and "Finish the rest later" real save-and-resume rather than a dead end.
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

- **The MSAL scaffold is untested against a real tenant.** It's built from
  `react-native-msal`'s actual type definitions and Expo config plugin
  source (not guessed from memory), and the JS/TS side type-checks and
  bundles cleanly, but the native sign-in flow itself needs a real Entra ID
  app registration, a development build, and an actual device or simulator
  to verify — none of which exist in the environment this was built in.
  Treat it as a correctly-shaped starting point, not a tested one.
- **The save-and-resume is on-device only.** State lives in local
  `AsyncStorage`, not a backend. A rep who reinstalls the app or switches
  phones loses an unsynced, deferred debrief. A real build would sync this
  state server-side as soon as "Continue" or "Later" is first chosen, not
  only at final CRM push.
- **Staged field *values* are still static.** The status-level flow
  (recorded → answering → staged → synced) is real and persisted, but
  `Staged`'s field list is still the fixed mock content from
  `mockVisit.ts`, not dynamically built from what was actually answered or
  skipped in `Asking`. Wiring per-field answers through is a separate,
  larger piece of state management than the save/resume this round covered.
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
