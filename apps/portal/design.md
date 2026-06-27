# Design Principles — Simplify, Don't Crowd

> Distilled from the simplification pass in **[PR #4](https://github.com/burhankhatri/AIFoundationsSummerSchool/pull/4)** (commit range `aa172af..d619566`).
> That PR reworked 21 files (+656 / −712) with one through-line: **show the person the one thing
> that matters right now, and tuck everything else away.** This document turns those edits into rules
> we keep applying.

The whole change set is a *subtraction*. Almost nothing new was added to the screen — a sidebar, a
stats card, a footer sitemap, duplicate Q&A, an inline feedback list, a "What others shipped" grid,
and a pile of emoji and headings were all **removed**, and the few things that survived got lighter
and quieter. Read every principle below as "we did *less*, on purpose."

---

## The North Star

**Never make the user parse more than they need to act.** A page should have one obvious focus and
one obvious next step. Everything secondary is either (a) deleted because it lives somewhere else, or
(b) hidden behind a trigger until asked for. Weight, color, whitespace, and copy all dial *down* so the
content — not the chrome — carries the page.

---

## 1. One focus, one next step per screen

Each screen should answer "what am I doing here, and what do I do next?" without competing calls to action.

- **Submit → congrats, full stop.** Once the Week 1 GitHub-profile assignment is in, the entire work
  flow is replaced by a single confirmation with one primary action (*See the showcase →*) and one
  quiet secondary (*Edit submission*). No lingering form, status badge, or read-view.
  → `src/components/SubmittedCongrats.tsx` (new); guarded in `AssignmentWorkSection.tsx` via `if (isGitHubProfileWeek && existing && !edit)`.
- **Split a long brief into steps instead of one tall wall.** Week 1 became a two-page wizard:
  page 1 = profile basics, page 2 = personal README + the submit form, with `← Back` / `Next →`.
  → `src/components/GitHubProfileSteps.tsx` (new), replacing the old all-at-once checklist.
- **Editing is a mode you enter deliberately, not a panel that's always armed.** The old
  `SubmissionPanel` juggled a read-view, an edit toggle, a cancel link, and a status badge inline.
  Now it's just an optional heading + the form; "Edit submission" re-opens the whole page (`?edit=1`).
  → `src/components/SubmissionPanel.tsx` went from a 57-line client component to a 17-line server one.

**Rule:** if a screen is trying to be a form *and* a receipt *and* a browser of other people's work at
the same time, split those into distinct states or distinct screens.

---

## 2. Say it once — no duplicate surfaces (DRY for UI)

If information already has a home, don't re-render it somewhere else "for convenience." Duplication is
clutter that also drifts out of sync.

- **"What others shipped" was deleted from the assignment** — the showcase already shows it.
  → removed the collapsible `SubmissionCard` grid + its `listSubmissionsForAssignment` query from `AssignmentWorkSection.tsx`.
- **Q&A is rendered once.** When an assignment is on the page, its header hosts the Q&A; the
  duplicate collapsible Q&A card in the week body is suppressed.
  → `WeekBody` gained `includeQa` (default true); home passes `includeQa={!primaryAssignment}`.
- **Feedback has a single home — "My Work."** It was pulled off the assignment page and consolidated
  on `/submissions`, where feedback across *all* your submissions lists together, newest first.
  → feedback section deleted from `AssignmentWorkSection.tsx`, rebuilt in `src/app/(app)/submissions/page.tsx`.
- **The footer stopped duplicating the nav.** The "You" column (Home / My submissions / Your reviews /
  Sign out) and the "The cohort" sitemap were removed — those links already live in the top bar.
  → `Footer.tsx` collapsed from 100 lines to 15.
- **One redundant primary button removed.** The standalone *Home* button next to the avatar went away;
  Home is already a nav link. → `NavBar.tsx`.

**Rule:** before adding a panel, ask "does this content already appear somewhere?" If yes, link to it
or move it — don't mirror it.

---

## 3. Secondary content hides behind a trigger (progressive disclosure)

Supporting tools are available, not omnipresent. They sit behind an icon and open on demand.

- **Comments and Q&A became header popovers** — small icon buttons (`MessageSquare`, `HelpCircle`)
  that open a click-outside / Escape-to-close panel, instead of always-expanded sections eating
  vertical space. → `src/components/Popover.tsx` (new), used in `AssignmentWorkSection.tsx`.
- **Compact threads drop their wrapper.** Inside the popover, `CommentThread` renders inline with no
  collapsible card-in-card nesting. → `compact` branch simplified in `CommentThread.tsx`.

**Rule:** default to collapsed/hidden for anything that isn't the page's primary job. The presence of
a feature shouldn't cost the user attention until they reach for it.

---

## 4. One navigation, in one place

Navigation was scattered across a left sidebar, a top bar, and a footer sitemap. It now lives in the
top bar — and only there.

- **The persistent left `Sidebar` was deleted**; signed-in pages render full-width.
  → `src/components/Sidebar.tsx` removed; `src/app/(app)/layout.tsx` dropped from 26 lines to 9.
- **Primary nav moved into the top bar** as text-only links with a subtle active state (weight +
  color, no pill background, no icons). → `src/components/TopNav.tsx` (new).
- **The footer is one row** now: copyright + a single *Discover* link.
- **A thin divider** separates the nav cluster from the account zone — rhythm without a box.
  → `NavBar.tsx` (`h-5 w-px bg-sea-fog`).
- **One source of truth for links.** Desktop nav, mobile menu, and footer all derive from the same
  `links` array in `NavBar.tsx`.

**Rule:** a person should never have to wonder *which* navigation to use. There is one.

---

## 5. Flatten the visual hierarchy — text over cards, lighter weight

Boxes, borders, shadows, and heavy type were dialed back so content reads as content.

- **Announcements: cards → a flat divided list** (`divide-y divide-border`), so they read as text, not
  a stack of containers. Pinned items use a small `Pin` icon instead of a `📌` badge.
  → `home/page.tsx`.
- **The home hero shrank and calmed down:** a 40–48px `extrabold` heading inside a tinted
  `bg-primary-soft` card became a 30–34px `semibold` heading on a plain section. Week 1 skips the
  theme/description entirely and opens straight into the brief. → `home/page.tsx`.
- **The brand got lighter:** "AI Foundations" (xl, bold) → "Summer School" (lg, **medium**) with a
  small palm-tree mark. → `NavBar.tsx`.
- **Icon noise removed:** the count "bubble" badges on header icons are gone; popover counts live in
  the `aria-label` instead.

**Rule:** reach for a card only when grouping genuinely helps. A list of text usually beats a stack of
boxes. Prefer the lighter font weight.

> **Caveat learned the hard way:** the PR first tried a radical "flat-page / remove all borders &
> shadows" mode (`ae30943`, `5db63b5`) and **reverted both** (`2711b15`, `e9c7a5a`) when it stripped
> too much affordance. The flattening that *stuck* was surgical — announcements, headings, brand —
> not a global gut. **Simplify by subtraction, but back out any cut that removes a needed cue.**

---

## 6. Quiet the tone — drop decorative emoji and hype copy

The interface stopped performing enthusiasm at the user.

- **Emoji removed from headings/badges/labels:** `📣` Announcements, `📌`, `🔒` Week locks, `✨`,
  the `👋` greeting, and the congrats emoji all went.
- **No motivational filler.** "Build what you care about — the growth follows. ✨" and "Your home base —
  everything for right now, in one place." were deleted.
- **No leaderboard pressure.** The "snapshot" stats card (*N projects shipped*, *N peers waiting on
  your feedback*) was removed wholesale. → `home/page.tsx`.
- **Redundant headings dropped:** "Step 2: Submit your GitHub README link," the duplicate "Your work" /
  submit headings on Week 1, and the redundant week badge over the theme.

**Rule:** copy should inform, not cheerlead. If a heading restates what's obviously below it, cut it.

---

## 7. A narrower measure for readability

- **Content column tightened: `--page-max` 1200px → 960px.** Shorter line lengths read better; prose
  keeps its `max-w-[70ch]`. → `src/app/globals.css`.

**Rule:** wide isn't generous — it's harder to read. Constrain the measure.

---

## 8. Less on screen ⇒ less to fetch (a free side effect)

Removing surfaces removed their queries. Worth noting because it confirms the cut was real, not cosmetic:

- **Home** dropped `listWeeks`, `listSubmissionsByUser`, `listPendingReviews`.
- **WeekBody** only runs the three Q&A queries when `includeQa` is true.
- **AssignmentWorkSection** dropped `listSubmissionsForAssignment` and the inline feedback query.

**Rule:** if pulling something off the screen also lets you drop a query, that's a signal you removed
real weight, not just hid it.

---

## What was removed — inventory

| Removed / collapsed | Where it went |
| --- | --- |
| Left `Sidebar` (icon rail) | Top bar (`TopNav`) |
| Home greeting + tagline | — (deleted) |
| Home stats "snapshot" card | — (deleted; not a leaderboard) |
| Week-switcher pill row | — (deleted) |
| Footer 4-column sitemap | One row: © + Discover |
| Demo Day link | — (deleted) |
| `AssignmentChecklist` card | Folded into the two-page brief (`GitHubProfileSteps`) |
| Inline feedback section | "My Work" (`/submissions`) |
| "What others shipped" grid | Showcase (`/discover?tab=showcase`) |
| Duplicate Q&A card | Assignment-header Q&A popover |
| Read-view / edit-toggle panel | Congrats screen + `?edit=1` reopens the page |
| Decorative emoji (📣 📌 🔒 ✨ 👋) | — (deleted) |
| Count badge bubbles on icons | `aria-label` counts |

---

## Checklist — applying this to new work

Before shipping a screen, run it past these:

- [ ] **One focus.** Can a newcomer name the page's job and its next step in one glance?
- [ ] **No duplicate surface.** Does anything here already appear elsewhere? Link or move it.
- [ ] **Secondary = hidden.** Is supporting content (comments, Q&A, help) behind a trigger, not always-on?
- [ ] **One nav.** Are you adding a second place to navigate? Don't — use the top bar.
- [ ] **Text over boxes.** Could this card be a plain list? Is the font weight as light as it can be?
- [ ] **Quiet copy.** Any emoji, hype, or headings that restate the obvious? Cut them.
- [ ] **Measure.** Is long-form content held to a readable width?
- [ ] **Did a query disappear?** If removing a surface let you drop a fetch, you cut real weight. Good.
- [ ] **Surgical, not scorched.** If a simplification removes a needed affordance (a border that
      signals grouping, an edit cue), back it out — like the reverted flat-page experiment.
