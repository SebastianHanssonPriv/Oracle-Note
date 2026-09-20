# Oracle Note

A rep finishes a customer visit and talks through it, in the car or on the
way back to it. Oracle Note structures what they said, asks about what's
missing, and turns it into a consistent, structured debrief note.

## Project direction

**The active build target for this concept is now a Microsoft Copilot
Studio agent, not this repo's native app.** Full spec, reasoning, and open
questions: [Oracle Note — Sales Debrief Agent Spec](https://claude.ai/artifact/QhmC327S5ZtKcDuUJsGnAH).

That's a real pivot, not an addition. CRM integration turned out to be
fully out of scope, and hands-free capture while actually driving turned
out not to be a hard requirement — the two things that justified building
a native app in the first place. Without them, a low-code Copilot Studio
agent gets the actual goal, consistent structured notes, with far less
ongoing engineering burden than a native app requires to maintain.

**This repo (`app/`, `backend/`, `infra/`) is parked, not deleted, not
abandoned.** Everything in it is real, working, verified code (see
`ARCHITECTURE.md` for the honest "what's real vs mocked" account). It stops
being the active path the moment CRM integration is out of scope, because a
conversational agent's generative extraction is fundamentally less
deterministic than a purpose-built app's fixed code path, and that
difference matters far more once you're writing to a real system of record
than it does for structured notes with nowhere else to go yet. **If CRM
integration becomes real scope again, this is where that work resumes, not
a rebuild.**

## In this repo

- **[`app/`](app)** — the working implementation: React Native (Expo), iOS
  and Android, one codebase. See [`app/README.md`](app/README.md) for setup,
  structure, and the known limitations/assumptions behind this build.
- **[`backend/`](backend)** — the Azure Functions API behind it: staged-field
  extraction and the temporary pilot analysis sink. See
  [`backend/README.md`](backend/README.md).
- **[`infra/`](infra)** — the Bicep template for the target Azure footprint
  (Function App, Storage, Application Insights). See
  [`infra/README.md`](infra/README.md) for deployment and cost shape.
- **[`ARCHITECTURE.md`](ARCHITECTURE.md)** — the target system end to end,
  what's real versus mocked today, and what a live pilot actually needs from
  the organization to get there. Start here for the resourcing picture.
- **[`design/`](design)** — the original Claude Design handoff bundle this
  was built from: the design brief, the chat transcript the design decisions
  came out of (`design/chats/chat1.md`), and the source `.dc.html` mockups
  (`design/project/`).
- **[`showcase/`](showcase)** — two standalone, self-contained HTML pages for
  showing the flow to someone else without running the app:
  - `showcase/walkthrough.html` — a scrolling explainer of all nine screens,
    with the design rationale behind each one.
  - `showcase/demo.html` — an interactive, tap-through simulation of the
    phone app and the in-car display as two separate experiences, with the
    spoken gap questions read aloud via the browser's text-to-speech.

  Open either file directly in a browser; no build step or server needed.

## Status

As of the pivot above, this repo is parked, not under active development.
What it reached before that: the interaction flow, screens, and visual
system built and working against a single fixed demo visit (Bergman Maskin
AB), including real on-device save-and-resume, real hands-free voice
capture and on-device voice-trigger recognition, and a real backend API
behind staged-field extraction and sync (verified locally; never deployed).
Real speech-to-text, backend authentication, and any CRM push were never
wired up — see [`ARCHITECTURE.md`](ARCHITECTURE.md) for the unambiguous
"what's real vs mocked" reference as it stood when work paused, and
`app/README.md` / `backend/README.md` for the per-package detail.
