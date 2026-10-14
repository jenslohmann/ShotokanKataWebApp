# AGENTS.md — Shōtōkan Kata Web App (PWA)

This file contains the standing rules for any coding agent (Claude Code CLI, local LLM, Copilot, …)
working on the web project. Read it fully before doing anything. The step-by-step work order is in
`PLAN.md` (same folder). Progress is tracked in `PROGRESS.md` (same folder, created in Phase 0).

The **web project root** is the folder that contains this `AGENTS.md`. It can live anywhere on any
machine; never assume an absolute path. All paths below are relative to the web project root.

---

## 1. What we are building

A single-page web app (SPA) that is a functional copy of the iOS SwiftUI app in the GitHub
repository **https://github.com/jenslohmann/ShotokanKata** (branch `main`). It must:

- run in any modern browser (desktop + mobile Safari/Chrome/Firefox/Edge),
- be installable as a Progressive Web App (PWA) on iPhone, iPad and Android ("Add to Home Screen"),
- work fully offline after the first visit (all data is bundled, no backend, no network calls),
- have the same four sections as the iOS app: **Kata**, **Quiz**, **Vocabulary**, **About**,
- use a bottom tab bar on narrow screens (phones) and a left sidebar on wide screens (iPad/desktop),
- support light and dark mode (follows the OS setting),
- support several languages (currently English and Danish) for UI text and content; kata content is
  translated one kata at a time (see section 9).

The iOS app is the **reference implementation**. When the plan is unclear, open the matching
Swift file and replicate its behaviour. Never modify anything outside the web project root.
The iOS repository is **read-only** reference material: never commit to it, never push to it.

## 2. Where the iOS reference lives

- GitHub (browse online): https://github.com/jenslohmann/ShotokanKata
  - iOS source: https://github.com/jenslohmann/ShotokanKata/tree/main/Shotokan%20Kata/Shotokan%20Kata
  - Data: https://github.com/jenslohmann/ShotokanKata/tree/main/Shotokan%20Kata/Shotokan%20Kata/Resources
- Local read-only clone used by the agent and by `npm run sync-data`:
  `.ios-reference/` inside the web project root (shallow clone, **git-ignored**, never committed).
  Create or update it with:
  ```sh
  git clone --depth 1 https://github.com/jenslohmann/ShotokanKata.git .ios-reference   # first time
  git -C .ios-reference pull --ff-only                                                   # later updates
  ```
- In `PLAN.md`, **`IOS`** means `.ios-reference/Shotokan Kata/Shotokan Kata` (note the spaces in the
  folder names — always quote these paths in shell commands).
- iOS data (source of truth for content): `IOS/Resources/`
  - `kata.json` – list of kata files and whether they are enabled
  - `kata/NN_name.json` – one file per kata. **Ignore every `extracted_*.json` file.**
  - `vocabulary.json` – vocabulary terms
  - `en.lproj/Localizable.strings`, `da.lproj/Localizable.strings` – UI strings
- App icon source: `IOS/Assets.xcassets/AppIcon.appiconset/AppIcon Shotokan.jpg`
- The repository also contains the Japanese transliteration rule in `Shotokan Kata/AGENTS.md`
  (already copied into section 7 below) and older iOS notes in `.github/copilot-instructions.md`
  (background only — where they conflict with the Swift code or `PLAN.md`, the Swift code and `PLAN.md` win).

## 3. Tech stack (fixed — do not substitute)

| Concern        | Choice                                                                 |
|----------------|------------------------------------------------------------------------|
| Language       | TypeScript (strict mode)                                               |
| UI library     | React (function components + hooks only, no class components)        |
| Build tool     | Vite                                                                   |
| PWA            | `vite-plugin-pwa` (Workbox, `registerType: 'autoUpdate'`)              |
| Routing        | **Own tiny hash router** in `src/router/` (no react-router)           |
| State          | React context + `useReducer`; `localStorage` for persisted settings  |
| Styling        | Plain CSS with CSS custom properties (no Tailwind, no CSS-in-JS)       |
| Icons          | `lucide-react`, imported ONLY in `src/components/Icon.tsx`             |
| Tests          | Vitest + @testing-library/react + jsdom                                |
| Icon generation| `sharp` (devDependency, used only by `scripts/make-icons.mjs`)         |
| Package mgr    | npm                                                                    |
| Node           | ≥ 20                                                                   |

Do not add other runtime dependencies without writing the reason in `PROGRESS.md`.

## 4. Commands

Run all commands from the web project root.

```sh
npm install            # install dependencies
npm run sync-data      # clone .ios-reference from GitHub if missing, copy JSON data into src/data + icon source
npm run sync-data:update # same, but first pulls the latest iOS repo
npm run icons          # generate PWA icons into public/ (Phase 12)
npm run dev            # dev server (http://localhost:5173)
npm run test           # run unit tests once (vitest run)
npm run test:e2e       # browser tests in e2e/ (Playwright + installed Google Chrome; builds and serves dist/ itself)
npm run typecheck      # tsc --noEmit
npm run build          # typecheck + production build into dist/
npm run preview        # serve dist/ (test PWA + offline here, http://localhost:4173)
```

**Definition of "green":** `npm run typecheck && npm run test && npm run build` all exit with code 0.
You must be green at the end of every phase before committing.
`npm run test:e2e` is not part of "green" (it needs Google Chrome and a free local port 4173), but run it
when you change UI, layout, CSS or the PWA setup and your environment allows it.

## 5. Working rules for the agent

1. Work **one phase at a time** from `PLAN.md`, in order. Do not skip ahead.
2. Before starting a phase, re-read that phase's section in `PLAN.md` and the Swift files it lists.
3. After each task, tick its checkbox in `PROGRESS.md` and write one line about what you did.
4. After each phase: get green (section 4), then commit:
   `git add -A && git commit -m "web: phase N – <short title>"` (run in the web project root;
   `.ios-reference/` is git-ignored so it is never committed). If the web project root is not yet a
   git repository, run `git init -b main` once in Phase 1.
5. If something fails three times in a row, stop, write the problem in `PROGRESS.md` under
   "Blocked", and ask the user. Do not delete tests to make them pass.
6. Keep files small (aim < 250 lines). One React component per file (tiny private helpers are OK).
7. Never invent kata content, Japanese terms, quiz facts or translations of Japanese terms.
   Content comes from the JSON data or is copied verbatim from the Swift source / `PLAN.md`.
   Faithful translations of that English content into another UI language are allowed (section 9).
8. Never hard-code user-facing UI text in components — use `t('key')` from `src/i18n/`.
   Exception: content from the data files (kata names, descriptions, vocabulary, quiz questions)
   is shown in the UI language when a translation exists in `src/data/i18n/<lang>/`, otherwise in English
   (marked with `lang="en"`). See section 9.
9. Prefer editing files with your file-edit tools over shell `sed`/`echo` tricks.
10. Do not run long-lived processes (like `npm run dev`) in the foreground; use them only if your
    tooling supports background processes, otherwise rely on tests and `npm run build`.

## 6. Code conventions

- Folder layout (create exactly this):
  ```
  <web project root>/
    index.html
    package.json, tsconfig*.json, vite.config.ts
    .ios-reference/         # read-only shallow clone of github.com/jenslohmann/ShotokanKata (git-ignored)
    icon-source/app-icon.jpg# copied from the iOS repo by sync-data (committed)
    public/                 # icons, favicon (generated in the PWA phase)
    scripts/sync-data.mjs   # clones/updates .ios-reference and copies data from it
    scripts/make-icons.mjs  # generates PWA icons with sharp
    src/
      main.tsx, App.tsx
      data/                 # synced JSON (generated by sync-data, committed)
      data/i18n/<lang>/     # content translations (hand-maintained, never touched by sync-data)
      domain/               # pure TypeScript: types, ranks, kata, vocabulary, quiz logic (NO React)
      state/                # React contexts + reducers (settings, quiz)
      router/               # tiny hash router
      i18n/                 # languages.ts (registry), en.ts, da.ts, index.ts
      components/           # reusable UI pieces (Icon, Badge, Chip, Sheet, NavBar, …)
      screens/              # one folder per section: kata/, quiz/, vocabulary/, about/
      styles/               # theme.css (variables), base.css, plus per-component CSS files
      test/                 # vitest setup
  ```
- `src/domain/**` must be pure functions with no React imports, so it is easy to unit-test.
- Named exports only (no default exports), except where a tool requires it (`vite.config.ts`).
- Component files: `PascalCase.tsx`; CSS next to them: `PascalCase.css`, imported by the component.
- CSS class names: `kebab-case`, prefixed by component, e.g. `.kata-row`, `.kata-row__badge`.
- Use semantic HTML: `<button>` for actions, `<a href="#/…">` for navigation, `<ul>/<li>` for lists,
  `<h1>/<h2>` for titles. Every icon-only button needs `aria-label`.
- Minimum touch target: 44×44 CSS px.
- Colours: only via CSS variables from `src/styles/theme.css`. Never hard-code `#000`/`#fff` for text.

## 7. Japanese Transliteration Standard (copied from the iOS repository — mandatory)

When transliterating Japanese terms, concepts, or names into the Latin alphabet, you must strictly
use **Hepburn romanization with macrons** to represent long vowels (ā, ē, ī, ō, ū).

- Always include macrons for long vowels (e.g., *kōsa-dachi*, *Shōtōkan*, *dōjō*, *karate-dō*).
- Do not drop the macron unless explicitly requested by the user, or for highly standardised,
  un-macronised English loanwords (like "Tokyo" or "Kyoto" in general non-technical context).
- Do not use alternative long-vowel spellings such as *kousa-dachi*, *koosa-dachi* or *kosa-dachi*.
- The app title is written **Shōtōkan Kata**.

## 8. Things that are easy to get wrong (read twice)

- `extracted_*.json` files in the iOS `kata/` folder are raw source material. Never load them.
- Kata are always displayed sorted by `kataNumber` ascending.
- Move `sequence` can be `-1` (Rei) and `0` (Yōi); these have a `sequenceName`. Show the
  `sequenceName` instead of the number when it exists.
- Quiz questions must never be about moves whose `sequenceName === "Rei"`.
- The quiz is **rank-based** (10th Kyū … 10th Dan), not belt-colour-based.
- Search must be case-insensitive **and** diacritic-insensitive ("kanku" finds "Kankū").
- Use a hash router (`#/kata/1`) so the app works on any static host and inside an installed PWA.
- iOS Safari: respect `env(safe-area-inset-*)` for the top bar and the bottom tab bar.

## 9. Languages and translations

- **UI strings**: `src/i18n/en.ts` is the source; every other language file must have every key with the
  same `{placeholders}` (checked by `src/i18n/i18n.test.ts`). Text built in code (e.g. generated quiz
  questions, compass letters) also goes through `t()` / `translate()` — never concatenate English words.
- **Content translations**: `src/data/i18n/<lang>/vocabulary.json` (keyed by term id: `shortDescription`,
  `definition`, `componentBreakdown`) and `src/data/i18n/<lang>/quiz.json` (static questions keyed by id:
  `question`, `options` in the same order as English, `explanation`). English stays in the synced data.
- Translations translate the English text faithfully: no added, removed or corrected facts. Japanese terms,
  kanji, kana, kata names and macrons are never translated or changed (checked by
  `src/domain/translations.test.ts`). Write new or changed translations for human review in `PROGRESS.md`.
- After `npm run sync-data:update`, check `git diff src/data/vocabulary.json`: changed English text needs
  its translations updated; new terms make the translation test fail until they are translated.
- **Kata** content: `src/data/i18n/<lang>/kata/<same file name as src/data/kata>.json` with `description` and
  `moves["<sequence>"]["<sub-move order>"]` (sub-move descriptions). Only this English prose is translated;
  names, techniques, stances and Japanese fields are not. A kata is shown translated only when its file is
  complete (`src/domain/kataTranslations.ts`); otherwise it is shown in English, marked `lang="en"`.
  Keep "KIAI" markers. Translate further kata only when the user asks. Translated so far (da): 1–5 (Heian Shodan–Godan).
- **Adding a language**: add it to `LANGUAGES` in `src/i18n/languages.ts`, add `src/i18n/<code>.ts` with all
  keys and register it in `STRINGS` in `src/i18n/index.ts`, then add `src/data/i18n/<code>/vocabulary.json` and
  `quiz.json`. The language picker, browser-language detection and tests pick it up automatically.
