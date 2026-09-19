# Oracle Note

A rep finishes a customer visit, gets in the car, and talks for one to two
minutes. Oracle Note transcribes it, matches the customer from the calendar,
extracts what it can, and asks about the rest once the car has stopped.
Nothing reaches the CRM until the rep confirms it on the phone.

## In this repo

- **[`app/`](app)** — the working implementation: React Native (Expo), iOS
  and Android, one codebase. See [`app/README.md`](app/README.md) for setup,
  structure, and the known limitations/assumptions behind this build.
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

The interaction flow, screens, and visual system are built and working
against a single fixed demo visit (Bergman Maskin AB). Voice capture,
real speech-to-text, calendar/location matching, and the actual CRM push are
not wired up yet — see `app/README.md` for the full list of what's real
versus simulated.
