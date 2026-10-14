# PLAN.md — Build the Shōtōkan Kata web app (PWA)

Execute this plan phase by phase. Rules for how to work are in `AGENTS.md` — read that first.
All paths in this document are relative to the **web project root** (the folder containing this
`PLAN.md`), unless they are URLs or start with `/tmp`.

The iOS reference app is the GitHub repository **https://github.com/jenslohmann/ShotokanKata** (branch `main`).
It is cloned read-only into `.ios-reference/` (see `AGENTS.md` §2 and task 0.3).

`IOS` below means `.ios-reference/Shotokan Kata/Shotokan Kata`
(online: https://github.com/jenslohmann/ShotokanKata/tree/main/Shotokan%20Kata/Shotokan%20Kata).
Quote these paths in shell commands because the folder names contain spaces.

Phase overview:

| #  | Phase                                         | Result                                        |
|----|-----------------------------------------------|-----------------------------------------------|
| 0  | Orientation                                   | PROGRESS.md exists, you understand the app    |
| 1  | Scaffold                                      | Vite + React + TS project builds and tests    |
| 2  | Data sync + domain model                      | Typed data, ranks, kata, vocabulary + tests   |
| 3  | Theme, i18n, settings, router, app shell      | Tabs/sidebar navigation between 4 placeholders|
| 4  | Kata list                                     | Search, chips, filter sheet, rows             |
| 5  | Shared text components                        | Vocabulary links, expandable text, speech     |
| 6  | Kata detail                                   | Header, segmented control, 3 tabs             |
| 7  | Vocabulary                                    | List, filter, detail page                     |
| 8  | Quiz domain logic                             | Question generator + reducer + tests          |
| 9  | Quiz menu screen                              | Configure and start a quiz                    |
| 10 | Quiz play + results                           | Full quiz flow incl. kiai selection           |
| 11 | About screen                                  | Text + install instructions + language        |
| 12 | PWA                                           | Manifest, icons, service worker, offline      |
| 13 | Polish: accessibility, responsive, dark mode  | Checklist passes                              |

---

## Phase 0 — Orientation

Tasks:

- [ ] 0.1 Read `AGENTS.md` completely.
- [ ] 0.2 Create `PROGRESS.md` with this content, then keep it updated after every task:
  ```markdown
  # PROGRESS
  ## Current phase
  0
  ## Done
  - (one line per finished task, e.g. "1.3 installed vite-plugin-pwa")
  ## Blocked
  - (empty)
  ## Notes / decisions
  - (empty)
  ```
- [ ] 0.3 Get the iOS reference code (read-only shallow clone inside the web project root):
  ```sh
  git clone --depth 1 https://github.com/jenslohmann/ShotokanKata.git .ios-reference
  ```
  If `.ios-reference/` already exists, run `git -C .ios-reference pull --ff-only` instead.
  Create `.gitignore` (if missing) and make sure it contains the line `.ios-reference/`.
  If the machine has no network access to GitHub, stop and ask the user (write it under "Blocked").
- [ ] 0.4 Skim these iOS files to understand the app (do not copy Swift code, only behaviour):
  - `IOS/ContentView.swift` (tab bar on iPhone, sidebar on iPad)
  - `IOS/Views/KataListView.swift`
  - `IOS/Views/KataDetail/*.swift`
  - `IOS/Views/QuizMenuView.swift`, `IOS/Views/QuizView.swift`, `IOS/Views/KataKiaiSelectionView.swift`
  - `IOS/Services/QuizDataService.swift`, `IOS/ViewModels/QuizViewModel.swift`
  - `IOS/Views/VocabularyView.swift`, `IOS/Views/VocabularyDetail/*.swift`
  - `IOS/Views/Common/*.swift`, `IOS/Views/AboutView.swift`
  - `IOS/Models/*.swift`
- [ ] 0.5 Open `IOS/Resources/kata/01_heian_shodan.json` and `IOS/Resources/vocabulary.json` to see the data shape.

Acceptance: `PROGRESS.md` exists. No commit needed yet.

---

## Phase 1 — Scaffold the project

Tasks:

- [ ] 1.1 Generate the Vite template in a temporary folder (avoids interactive "folder not empty" prompts),
  then copy it into the web project root:
  ```sh
  WEB_ROOT="$(pwd)"            # run this from the web project root (the folder with PLAN.md)
  rm -rf /tmp/sk-web
  (cd /tmp && npm create vite@latest sk-web -- --template react-ts)
  cp -R /tmp/sk-web/. "$WEB_ROOT"/
  cd "$WEB_ROOT"
  ```
  If the generator still asks questions, answer "No" to anything like "Install with npm and start now?".
  Make sure `AGENTS.md`, `PLAN.md`, `CLAUDE.md` and `PROGRESS.md` were not overwritten (the template has none of them,
  but check), and that `.gitignore` still contains `.ios-reference/` (the template's `.gitignore` may have replaced
  yours — re-add the line). If the template created a `README.md`, delete it.
  If the web project root is not a git repository yet (`git rev-parse --git-dir` fails), run `git init -b main`.
- [ ] 1.2 Install dependencies:
  ```sh
  npm install
  npm install lucide-react
  npm install -D vite-plugin-pwa vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom sharp
  ```
  If npm reports a peer-dependency conflict between `vite-plugin-pwa` and `vite`, install the
  newest `vite` major that `vite-plugin-pwa` supports (`npm view vite-plugin-pwa peerDependencies`).
  Never use `--force`. `--legacy-peer-deps` is allowed only as a last resort; note it in PROGRESS.md.
- [ ] 1.3 Delete the Vite demo content: `src/App.css`, `src/assets/`, `public/vite.svg`, and the demo
  code in `src/App.tsx` / `src/index.css`. Replace `src/App.tsx` with a component that renders
  `<h1>Shōtōkan Kata</h1>`. Delete `src/index.css` and its import in `main.tsx`.
- [ ] 1.4 `package.json` scripts must be exactly (keep any others Vite added only if they are `lint`):
  ```json
  {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "sync-data": "node scripts/sync-data.mjs",
    "sync-data:update": "node scripts/sync-data.mjs --update",
    "icons": "node scripts/make-icons.mjs"
  }
  ```
  (If `tsc -b --noEmit` errors on your TypeScript version, use `tsc --noEmit -p tsconfig.app.json`.)
- [ ] 1.5 In the app tsconfig (`tsconfig.app.json` or `tsconfig.json`, whichever has `"include": ["src"]`)
  make sure these compiler options are set: `"strict": true`, `"resolveJsonModule": true`,
  `"types": ["vitest/globals", "@testing-library/jest-dom"]`.
- [ ] 1.6 Replace `vite.config.ts` with:
  ```ts
  /// <reference types="vitest/config" />
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';

  export default defineConfig({
    base: './',
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  });
  ```
  (If `/// <reference types="vitest/config" />` gives a type error, use `/// <reference types="vitest" />`.)
  The PWA plugin is added in Phase 12, not now.
- [ ] 1.7 Create `src/test/setup.ts` containing `import '@testing-library/jest-dom';`
- [ ] 1.8 Create `src/App.test.tsx`:
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { App } from './App';
  it('renders the title', () => {
    render(<App />);
    expect(screen.getByText('Shōtōkan Kata')).toBeInTheDocument();
  });
  ```
  and make `App` a **named** export (`export function App()`), updating `main.tsx` accordingly.
- [ ] 1.9 In `index.html` set `<html lang="en">`, `<title>Shōtōkan Kata</title>`.
- [ ] 1.10 Make sure `.gitignore` contains `node_modules`, `dist`, `dev-dist`, `coverage`, `.ios-reference/`.

Acceptance: green (`npm run typecheck && npm run test && npm run build`). Commit.

---

## Phase 2 — Data sync and domain model

### 2.1 Data sync script

- [ ] 2.1.1 Create `scripts/sync-data.mjs` (Node ESM, only Node built-ins: `fs`, `path`, `url`, `child_process`) that:
  1. Resolves `ROOT = path.resolve(__dirname, '..')` (use `fileURLToPath(import.meta.url)` to get `__dirname`)
     and `REF = path.join(ROOT, '.ios-reference')`. Allow overriding `REF` with env var `IOS_REF_DIR`
     (absolute, or relative to ROOT) — useful if the iOS repo is already cloned elsewhere; in that case never clone/pull, just read.
  2. Gets the iOS repository (skip when `IOS_REF_DIR` is set):
     - if `REF` does not exist: run `git clone --depth 1 https://github.com/jenslohmann/ShotokanKata.git .ios-reference` (cwd `ROOT`);
     - else, only if the script was started with `--update`: run `git -C .ios-reference pull --ff-only`.
     Use `execFileSync('git', [...], { stdio: 'inherit', cwd: ROOT })`. If git fails, exit with code 1 and print
     "Could not get https://github.com/jenslohmann/ShotokanKata – check network access".
  3. `SRC = path.join(REF, 'Shotokan Kata', 'Shotokan Kata', 'Resources')`;
     `DEST = path.join(ROOT, 'src', 'data')`; delete `DEST/kata` if it exists and recreate `DEST` and `DEST/kata`.
  4. Copies `SRC/kata.json` → `DEST/kata.json` and `SRC/vocabulary.json` → `DEST/vocabulary.json`.
  5. Copies every file in `SRC/kata/` whose name matches `/^\d{2}_[a-z0-9_]+\.json$/` to `DEST/kata/`.
     (This regex excludes all `extracted_*.json` files.)
  6. Parses every copied file with `JSON.parse` and exits with code 1 and a clear message if any
     file is invalid JSON.
  7. For every entry in `kata.json` with `enabled: true`, checks that `DEST/kata/<fileName>.json`
     exists; if not, prints a warning (do not fail).
  8. Copies `path.join(REF, 'Shotokan Kata', 'Shotokan Kata', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon Shotokan.jpg')`
     to `ROOT/icon-source/app-icon.jpg` (used in Phase 12).
  9. Writes `DEST/source.json` = `{ "repo": "https://github.com/jenslohmann/ShotokanKata", "commit": "<git -C REF rev-parse HEAD>", "syncedAt": "<ISO date>" }`
     so it is always clear which iOS version the data came from.
  10. Prints a summary: commit hash, number of kata files copied, number of vocabulary terms.
- [ ] 2.1.2 Run `npm run sync-data`. At the time of writing, expect 10 kata files (01–06, 09, 10, 11, 15) and
  112 vocabulary terms. (If the iOS repo has grown since, more is fine — update the expected numbers in the
  Phase 2 tests and note it in PROGRESS.md.)
- [ ] 2.1.3 Do **not** add `predev`/`prebuild` hooks: building must work without network and without `.ios-reference/`.
  The synced files in `src/data/` and `icon-source/app-icon.jpg` ARE committed to git, so the web project is
  self-contained. Re-sync manually with `npm run sync-data:update` when the iOS data changes.

### 2.2 Types — `src/domain/types.ts`

- [ ] 2.2.1 Create exactly these types (they mirror `IOS/Models/*.swift`):
  ```ts
  export interface KataSubMove {
    order: number;
    technique: string;
    hiragana?: string;
    stance: string;
    stanceHiragana?: string;
    description: string;
    icon: string;          // SF Symbol name from the iOS app, mapped to a web icon in Icon.tsx
    kiai?: boolean;
  }
  export interface KataMove {
    sequence: number;      // -1 = Rei, 0 = Yōi, 1..n = real moves
    sequenceName?: string; // e.g. "Rei", "Yōi"
    japaneseName: string;
    direction: string;     // N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, WNW, NW, NNW
    kiai?: boolean;
    subMoves: KataSubMove[];
  }
  export interface Kata {
    name: string;
    japaneseName: string;
    hiraganaName?: string;
    numberOfMoves: number;
    kataNumber: number;
    beltRank: string;      // e.g. "8_kyu", "1_dan"
    description: string;
    keyTechniques: string[];
    referenceURL?: string;
    videoURLs?: string[];
    moves: KataMove[];
  }
  export interface KataFileInfo { fileName: string; kataNumber: number; name: string; enabled: boolean; }
  export interface KataConfiguration { availableKata: KataFileInfo[]; }
  export interface VocabularyTerm {
    id: number;
    term: string;
    japaneseName: string;
    hiraganaName: string;
    shortDescription: string;
    definition: string;
    category: string;
    componentBreakdown?: string;
  }
  ```

### 2.3 Ranks and belts — `src/domain/ranks.ts`

- [ ] 2.3.1 Implement (values copied from `IOS/Models/DifficultyLevel.swift`):
  ```ts
  export type BeltColor = 'white' | 'yellow' | 'orange' | 'green' | 'purple' | 'brown' | 'black';
  export type RankId =
    | '10_kyu' | '9_kyu' | '8_kyu' | '7_kyu' | '6_kyu' | '5_kyu' | '4_kyu' | '3_kyu' | '2_kyu' | '1_kyu'
    | '1_dan' | '2_dan' | '3_dan' | '4_dan' | '5_dan' | '6_dan' | '7_dan' | '8_dan' | '9_dan' | '10_dan';
  export interface Rank { id: RankId; sortOrder: number; belt: BeltColor; }
  export const RANKS: Rank[]; // in this order, sortOrder 1..20:
  // 10_kyu white, 9_kyu yellow, 8_kyu orange, 7_kyu green, 6_kyu green,
  // 5_kyu purple, 4_kyu purple, 3_kyu brown, 2_kyu brown, 1_kyu brown,
  // 1_dan..10_dan black
  export function getRank(id: string): Rank | undefined;
  export function rankSortOrder(id: string): number; // unknown id → Number.MAX_SAFE_INTEGER
  export function beltOf(id: string): BeltColor;     // unknown id → 'white'

  export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
  export const DIFFICULTY_LEVELS: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
  export const DIFFICULTY_RANKS: Record<DifficultyLevel, RankId[]> = {
    beginner: ['10_kyu', '9_kyu', '8_kyu'],
    intermediate: ['7_kyu', '6_kyu', '5_kyu', '4_kyu'],
    advanced: ['3_kyu', '2_kyu', '1_kyu', '1_dan', '2_dan'],
    expert: ['3_dan', '4_dan', '5_dan', '6_dan', '7_dan', '8_dan', '9_dan', '10_dan'],
  };
  export function highestRankOf(level: DifficultyLevel): RankId; // highest sortOrder in the list
  ```
  Rank **display names** are NOT here; they come from i18n keys `rank.<id>` (Phase 3).
  Belt display names come from `belt.<color>`.

### 2.4 Kata data — `src/domain/kata.ts`

- [ ] 2.4.1 Load data with Vite's static imports so everything is bundled (works offline):
  ```ts
  import config from '../data/kata.json';
  const files = import.meta.glob('../data/kata/*.json', { eager: true, import: 'default' }) as Record<string, Kata>;
  ```
- [ ] 2.4.2 `export function loadAllKata(cfg: KataConfiguration = config, fileMap = files): Kata[]`
  — for each `enabled` entry, look up `../data/kata/${fileName}.json` in `fileMap`; skip with
  `console.warn` if missing; return sorted by `kataNumber` ascending. Export a module-level
  constant `ALL_KATA = loadAllKata()`.
- [ ] 2.4.3 `export function normalizeForSearch(s: string): string` — `s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()`.
- [ ] 2.4.4 `export function filterKata(list: Kata[], opts: { search: string; rank?: string | null; belt?: BeltColor | null }): Kata[]`
  — search matches if `normalizeForSearch(search)` is contained in normalized `name`, `japaneseName`,
  `hiraganaName` or any `keyTechniques` entry. Then filter by exact rank, then by belt. Sort by `kataNumber`.
- [ ] 2.4.5 `export function sortedMoves(kata: Kata): KataMove[]` — sorted by `sequence` ascending.
- [ ] 2.4.6 `export function moveHasKiai(move: KataMove): boolean` — `move.kiai === true || move.subMoves.some(s => s.kiai === true)`.
  **Use this one function everywhere kiai is checked** (header text, move badge, quiz).
  (Note: the iOS quiz only checks `move.kiai`, which misses Heian Yondan whose kiai is on sub-moves.
  The web app intentionally uses the more complete rule.)
- [ ] 2.4.7 `export function kiaiMoveNumbers(kata: Kata): number[]` — unique, sorted sequence numbers of moves where `moveHasKiai`.
- [ ] 2.4.8 `export function moveBadgeShowsKiai(move: KataMove): boolean` — true if `move.kiai === true`
  OR (`move.subMoves.length === 1` AND `move.subMoves[0].kiai === true`). (Copied from `MoveMetadata.hasKiai` in `KataMoveRowView.swift`; with several sub-moves the kiai badge is shown on the sub-move instead.)
- [ ] 2.4.9 `export function directionArrow(direction: string): string` — from `DirectionMapper` in `KataMoveRowView.swift`:
  N→"↑"; NNE/NE/ENE→"↗"; E→"→"; ESE/SE/SSE→"↘"; S→"↓"; SSW/SW/WSW→"↙"; W→"←"; WNW/NW/NNW→"↖"; anything else→"•". Case-insensitive.
- [ ] 2.4.10 `export function moveLabel(move: KataMove): string` — `move.sequenceName ?? String(move.sequence)`.
- [ ] 2.4.11 `export function availableRanks(list: Kata[]): string[]` (unique ranks sorted by sortOrder) and
  `availableBelts(list: Kata[]): BeltColor[]` (unique belts sorted by the lowest rank sortOrder in that belt).

### 2.5 Vocabulary data — `src/domain/vocabulary.ts`

- [ ] 2.5.1 Types and constants:
  ```ts
  export type VocabularyCategory = 'general' | 'etiquette' | 'titles' | 'techniques' | 'stances' | 'blocks' | 'punches' | 'kicks' | 'training' | 'ranks' | 'equipment';
  export const VOCABULARY_CATEGORIES: VocabularyCategory[]; // in the order above
  export function categoryOf(term: VocabularyTerm): VocabularyCategory; // unknown category string (e.g. "strikes") → 'general'
  ```
- [ ] 2.5.2 `export const ALL_TERMS: VocabularyTerm[]` — imported from `../data/vocabulary.json`
  (`vocabularyTerms` array), sorted by `term` with `a.term.localeCompare(b.term)`.
- [ ] 2.5.3 `export function filterTerms(terms, search: string, category: VocabularyCategory | null)` —
  category filter first (using `categoryOf`), then search (normalized, see 2.4.3) in `term`,
  `japaneseName`, `hiraganaName`, `definition`. Keep sort by term.
- [ ] 2.5.4 `export function categoriesWithTerms(terms): VocabularyCategory[]` — categories that have ≥1 term, in `VOCABULARY_CATEGORIES` order.
- [ ] 2.5.5 `export function findTerm(id: number): VocabularyTerm | undefined`.

### 2.6 Vocabulary text linking — `src/domain/vocabularyLinks.ts`

This replaces `ClickableVocabularyText.swift`. It splits a text into plain and linked segments.

- [ ] 2.6.1 Implement:
  ```ts
  export type Segment = { text: string; termId?: number };
  export function linkVocabulary(text: string, terms: VocabularyTerm[]): Segment[];
  ```
  Algorithm (must follow exactly):
  1. Build a *folded* copy of `text` plus an index map: iterate the original string by code point
     (`for (const ch of text)`), keep the original index `i` (increase by `ch.length`). For each
     char compute `f = ch.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()`. Append `f` to
     `folded` and push `i` into `map` once for every UTF-16 unit of `f`. Finally push `text.length`
     into `map` (so `map[folded.length] === text.length`).
  2. `claimed` = boolean array of `text.length`, all false.
  3. Sort terms by `term.length` descending (longest first).
  4. For each term, variations = unique non-empty of: `term.term`, `term.japaneseName` (if different
     from term), `term.hiraganaName`. Fold each variation the same way as step 1 (no map needed).
  5. For each folded variation `v`: search `folded.indexOf(v, from)` repeatedly starting at 0. For a
     hit at `k`: original range is `start = map[k]`, `end = map[k + v.length]`. Accept the hit only if
     (a) whole word: the original character before `start` (if any) and the character at `end`
     (if any) are NOT word characters, where word char = `/[\p{L}\p{N}-]/u`; and
     (b) none of `claimed[start..end-1]` is true.
     On the first accepted hit: mark `claimed[start..end-1] = true`, record `{start, end, termId}`, and
     stop searching this variation (only the first occurrence per variation is linked — same as iOS).
     Otherwise continue searching from `k + 1`.
  6. Sort the recorded ranges by `start` and produce segments: plain text between ranges as
     `{text}`, ranges as `{text: original slice, termId}`. Concatenating all `segment.text` must equal
     the input text.
- [ ] 2.6.2 Memoize per `(text)` with a `Map<string, Segment[]>` cache inside the module (terms are static).

### 2.7 Tests (Vitest) — put them next to the files as `*.test.ts`

- [ ] 2.7.1 `ranks.test.ts`: 20 ranks; `beltOf('6_kyu') === 'green'`; `beltOf('5_kyu') === 'purple'`;
  `highestRankOf('beginner') === '8_kyu'`; `highestRankOf('advanced') === '2_dan'`.
- [ ] 2.7.2 `kata.test.ts`:
  - `ALL_KATA.length === 10`, numbers are `[1,2,3,4,5,6,9,10,11,15]` in that order.
  - `filterKata(ALL_KATA, {search: 'kanku'})` returns Kankū Dai (diacritic-insensitive).
  - `filterKata(ALL_KATA, {search: '', belt: 'black'})` returns only 1_dan kata.
  - `directionArrow('ne') === '↗'`, `directionArrow('x') === '•'`.
  - `kiaiMoveNumbers` for Heian Yondan (kataNumber 4) is non-empty (sub-move kiai).
  - every kata's first sorted move has sequence ≤ 1.
- [ ] 2.7.3 `vocabulary.test.ts`: `ALL_TERMS.length === 112`; a term with category `"strikes"` maps to `'general'`;
  `filterTerms(ALL_TERMS, 'dojo', null)` finds "Dōjō".
- [ ] 2.7.4 `vocabularyLinks.test.ts` with two fake terms
  (`{id:1, term:'Kata', japaneseName:'型', hiraganaName:'かた', …}` and `{id:7, term:'Zenkutsu-dachi', japaneseName:'前屈立', hiraganaName:'ぜんくつだち', …}`):
  - text `"This kata uses the zenkutsu-dachi stance and demonstrates basic kata principles."`
    → exactly two linked segments: `"kata"` (id 1, first occurrence only) and `"zenkutsu-dachi"` (id 7).
  - `"katana"` → no link (whole-word rule).
  - joined segment texts equal the input.
  - with a term `Kōkutsu-dachi`, the text `"Kokutsu-dachi"` gets linked (diacritic-insensitive).

Acceptance: green. Commit "web: phase 2 – data + domain".

---

## Phase 3 — Theme, i18n, settings, router, app shell

### 3.1 Theme — `src/styles/theme.css`, `src/styles/base.css`

- [ ] 3.1.1 `theme.css` defines CSS variables on `:root` (light) and inside
  `@media (prefers-color-scheme: dark) { :root { … } }` (dark). Use these values (iOS system colours):

  | Variable              | Light                   | Dark                     |
  |-----------------------|-------------------------|--------------------------|
  | `--accent`            | `#BC2835`               | `#DB3941`                |
  | `--accent-soft`       | `rgba(188,40,53,0.10)`  | `rgba(219,57,65,0.18)`   |
  | `--bg`                | `#FFFFFF`               | `#000000`                |
  | `--bg-grouped`        | `#F2F2F7`               | `#000000`                |
  | `--card`              | `#FFFFFF`               | `#1C1C1E`                |
  | `--card-2`            | `#F2F2F7`               | `#2C2C2E`                |
  | `--fill`              | `#F2F2F7`               | `#1C1C1E`                |
  | `--separator`         | `#D1D1D6`               | `#3A3A3C`                |
  | `--text`              | `#000000`               | `#FFFFFF`                |
  | `--text-2`            | `rgba(60,60,67,0.60)`   | `rgba(235,235,245,0.60)` |
  | `--green`             | `#34C759`               | `#30D158`                |
  | `--green-text`        | `#007F00`               | `#30D158`                |
  | `--green-soft`        | `rgba(52,199,89,0.25)`  | `rgba(48,209,88,0.30)`   |
  | `--red`               | `#FF3B30`               | `#FF453A`                |
  | `--red-soft`          | `rgba(255,59,48,0.10)`  | `rgba(255,69,58,0.20)`   |
  | `--orange`            | `#FF9500`               | `#FF9F0A`                |
  | `--orange-soft`       | `rgba(255,149,0,0.10)`  | `rgba(255,159,10,0.18)`  |
  | `--purple`            | `#AF52DE`               | `#BF5AF2`                |
  | `--indigo`            | `#5856D6`               | `#5E5CE6`                |
  | `--shadow`            | `0 1px 2px rgba(0,0,0,0.06)` | `none`              |
  | `--belt-white`        | `#8E8E93`               | `#AEAEB2`                |
  | `--belt-yellow`       | `#FFCC00`               | `#FFD60A`                |
  | `--belt-orange`       | `#FF9500`               | `#FF9F0A`                |
  | `--belt-green`        | `#34C759`               | `#30D158`                |
  | `--belt-purple`       | `#AF52DE`               | `#BF5AF2`                |
  | `--belt-brown`        | `#A2845E`               | `#AC8E68`                |
  | `--belt-black`        | `#000000`               | `#000000`                |

  Also: `--radius-s: 8px; --radius-m: 12px; --radius-l: 16px; --tabbar-h: 56px; --navbar-h: 52px; --sidebar-w: 260px;`
  and `color-scheme: light dark;`.
- [ ] 3.1.2 `base.css`: box-sizing border-box; `body { margin:0; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans JP", sans-serif; background: var(--bg-grouped); color: var(--text); -webkit-tap-highlight-color: transparent; }`;
  buttons inherit font; `a { color: var(--accent); }`; `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`;
  helper `.visually-hidden`; `@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }`.
  Import both CSS files in `main.tsx`.
- [ ] 3.1.3 Belt dot: a small circle `background: var(--belt-<color>)` with `box-shadow: 0 0 0 1px var(--separator)` so black/white dots are visible in both modes.

### 3.2 i18n — `src/i18n/`

- [ ] 3.2.1 `src/i18n/en.ts`: `export const en = { … } as const;` with ALL keys listed in **Appendix A**.
- [ ] 3.2.2 `src/i18n/da.ts`: `export const da: Record<keyof typeof en, string> = { … };` with the Danish values from **Appendix A**.
  TypeScript must fail if a key is missing.
- [ ] 3.2.3 `src/i18n/index.ts`:
  ```ts
  export type Lang = 'en' | 'da';
  export type TKey = keyof typeof en;
  export function detectLang(): Lang; // navigator.language starts with 'da' → 'da', else 'en'
  export function translate(lang: Lang, key: TKey, vars?: Record<string, string | number>): string;
  // replaces {name} placeholders with vars[name]
  ```
- [ ] 3.2.4 Test `i18n.test.ts`: `translate('en','quiz.questionProgress',{current:1,total:10}) === 'Question 1 of 10'`;
  every `da` value is a non-empty string.

### 3.3 Settings — `src/state/SettingsContext.tsx`

- [ ] 3.3.1 Context value: `{ showJapanese: boolean; setShowJapanese(v): void; langSetting: 'auto'|'en'|'da'; setLangSetting(v): void; lang: Lang; t: (key: TKey, vars?) => string }`.
- [ ] 3.3.2 Persist in `localStorage` keys `sk.showJapanese` (default `true`) and `sk.lang` (default `'auto'`).
  Wrap `localStorage` access in try/catch (private mode can throw).
- [ ] 3.3.3 Effect: set `document.documentElement.lang = lang`.
- [ ] 3.3.4 Export hooks `useSettings()` and `useT()` (returns `t`).

### 3.4 Router — `src/router/`

- [ ] 3.4.1 `router.ts`:
  ```ts
  export type Route =
    | { name: 'kataList' }
    | { name: 'kataDetail'; kataNumber: number; tab: 'overview' | 'moves' | 'history' }
    | { name: 'quizMenu' }
    | { name: 'quizPlay' }
    | { name: 'vocabList' }
    | { name: 'vocabDetail'; id: number }
    | { name: 'about' };
  export function parseHash(hash: string): Route;
  export function routeToHash(route: Route): string;
  ```
  Hash formats: `#/kata`, `#/kata/<n>?tab=moves`, `#/quiz`, `#/quiz/play`, `#/vocabulary`,
  `#/vocabulary/<id>`, `#/about`. Empty/unknown hash → `{ name: 'kataList' }`. Missing/invalid
  `tab` → `'moves'` (the iOS default tab is Moves).
- [ ] 3.4.2 `useRoute.ts`: hook that returns the current `Route`, re-rendering on `hashchange`.
  `navigate(route, { replace?: boolean })` sets `location.hash` (or `history.replaceState` + manual dispatch of `hashchange` when `replace`).
  `goBack(fallback: Route)`: if `history.length > 1` and the previous entry is ours use `history.back()`; simplest
  reliable approach: keep an in-memory stack of visited hashes in the module; if the stack has a previous
  entry, `history.back()`, else `navigate(fallback, { replace: true })`.
- [ ] 3.4.3 `sectionOf(route)`: `'kata' | 'quiz' | 'vocabulary' | 'about'` (used to highlight the active tab).
- [ ] 3.4.4 Remember the last route per section in memory, so tapping the active tab again returns to the
  section root and tapping another tab restores where you were in that section (like iOS NavigationStacks).
- [ ] 3.4.5 Scroll: when the route changes, scroll the main content to top, except when going back
  (restore saved scrollTop per hash if available — optional, nice to have).
- [ ] 3.4.6 Tests `router.test.ts` for parseHash/routeToHash round-trips of every route.

### 3.5 Shared components (first batch) — `src/components/`

- [ ] 3.5.1 `Icon.tsx`: `export function Icon({ name, size = 20, className, label }: { name: IconName; … })`.
  This is the ONLY file importing `lucide-react`. `IconName` is a string union of the keys below.
  Mapping (app UI icons):

  | IconName        | lucide component            |
  |-----------------|-----------------------------|
  | `kata`          | `PersonStanding`            |
  | `quiz`          | `CircleHelp`                |
  | `vocabulary`    | `BookOpen`                  |
  | `about`         | `Info`                      |
  | `search`        | `Search`                    |
  | `clear`         | `CircleX`                   |
  | `chevronRight`  | `ChevronRight`              |
  | `chevronLeft`   | `ChevronLeft`               |
  | `chevronDown`   | `ChevronDown`               |
  | `chevronUp`     | `ChevronUp`                 |
  | `sliders`       | `SlidersHorizontal`         |
  | `filter`        | `ListFilter`                |
  | `speaker`       | `Volume2`                   |
  | `speakerOn`     | `AudioLines`                |
  | `link`          | `Link`                      |
  | `external`      | `ArrowUpRight`              |
  | `play`          | `CirclePlay`                |
  | `video`         | `Youtube`                   |
  | `check`         | `Check`                     |
  | `checkCircle`   | `CircleCheck`               |
  | `xCircle`       | `CircleX`                   |
  | `circle`        | `Circle`                    |
  | `clock`         | `Clock`                     |
  | `flag`          | `Flag`                      |
  | `home`          | `House`                     |
  | `pause`         | `Pause`                     |
  | `lightbulb`     | `Lightbulb`                 |
  | `brain`         | `Brain`                     |
  | `star`          | `Star`                      |
  | `starHalf`      | `StarHalf`                  |
  | `award`         | `Award`                     |
  | `crown`         | `Crown`                     |
  | `history`       | `BookOpen`                  |
  | `techniques`    | `Hand`                      |
  | `sequences`     | `CircleArrowRight`          |
  | `applications`  | `Target`                    |
  | `ranks`         | `Medal`                     |
  | `kataOrder`     | `ListOrdered`               |
  | `terminology`   | `BookA`                     |
  | `philosophy`    | `Brain`                     |
  | `info`          | `Info`                      |
  | `list`          | `List`                      |
  | `book`          | `Book`                      |
  | `language`      | `Languages`                 |
  | `github`        | `Github`                    |
  | `share`         | `Share`                     |
  | `download`      | `Download`                  |
  | `vocab.general` | `BookOpen`                  |
  | `vocab.etiquette` | `Sparkles`                |
  | `vocab.titles`  | `UserPlus`                  |
  | `vocab.techniques` | `Swords`                 |
  | `vocab.stances` | `PersonStanding`            |
  | `vocab.blocks`  | `Shield`                    |
  | `vocab.punches` | `Hand`                      |
  | `vocab.kicks`   | `Footprints`                |
  | `vocab.training`| `Dumbbell`                  |
  | `vocab.ranks`   | `Medal`                     |
  | `vocab.equipment` | `Settings`                |

  Plus `export function MoveIcon({ sfSymbol }: { sfSymbol: string })` that maps the `icon` field
  from kata JSON (iOS SF Symbol names) to lucide:

  | SF Symbol in JSON                    | lucide                    | extra CSS                 |
  |--------------------------------------|---------------------------|---------------------------|
  | `hand.raised.fill`                   | `Hand`                    |                           |
  | `hand.raised.fingers.spread.fill`    | `Grab`                    |                           |
  | `hand.raised.slash.fill`             | `Ban`                     |                           |
  | `hand.wave.fill`                     | `Wind`                    |                           |
  | `hand.point.left.fill`               | `ArrowLeft`               |                           |
  | `hand.point.right.fill`              | `ArrowRight`              |                           |
  | `hand.point.up.fill`                 | `ArrowUp`                 |                           |
  | `shield.fill`                        | `Shield`                  |                           |
  | `shield.lefthalf.filled`             | `ShieldHalf`              |                           |
  | `shield.righthalf.filled`            | `ShieldHalf`              | `transform: scaleX(-1)`   |
  | `shield.slash.fill`                  | `ShieldOff`               |                           |
  | `arrow.forward.circle.fill`          | `CircleArrowRight`        |                           |
  | `arrow.up.circle.fill`               | `CircleArrowUp`           |                           |
  | `arrow.clockwise.circle.fill`        | `RotateCw`                |                           |
  | `hammer.fill`                        | `Hammer`                  |                           |
  | `burst.fill`                         | `Zap`                     |                           |
  | `eye.fill`                           | `Eye`                     |                           |
  | `figure.jump`                        | `ChevronsUp`              |                           |
  | `figure.kick`                        | `Footprints`              |                           |
  | `figure.martial.arts`                | `PersonStanding`          |                           |
  | `figure.stand`                       | `PersonStanding`          |                           |
  | `stop.fill`                          | `Square`                  |                           |
  | `xmark`                              | `X`                       |                           |
  | anything else                        | `Circle`                  |                           |

  **Icon names change between lucide versions.** If `npm run typecheck` reports a missing export,
  open `node_modules/lucide-react/dist/lucide-react.d.ts`, search for a similar name
  (e.g. `ArrowRightCircle` instead of `CircleArrowRight`, `HelpCircle` instead of `CircleHelp`,
  `Home` instead of `House`, `XCircle` instead of `CircleX`, `CheckCircle` instead of `CircleCheck`,
  `PlayCircle` instead of `CirclePlay`), and use that. If nothing similar exists, use `Circle`.
  Icons are decorative by default (`aria-hidden="true"`), unless `label` is given.
- [ ] 3.5.2 `NavBar.tsx`: sticky top bar. Props: `title: string; large?: boolean; back?: { label: string; onClick(): void }; right?: ReactNode`.
  - Height `var(--navbar-h)` plus `padding-top: env(safe-area-inset-top)`; background `var(--bg)` with
    95% opacity + `backdrop-filter: blur(20px)`; bottom hairline `var(--separator)`.
  - With `back`: left button showing `chevronLeft` + label, colour `var(--accent)`; title centred, 17px semibold.
  - With `large` (root screens): title rendered as a large 34px bold heading below the bar row (like iOS large titles).
- [ ] 3.5.3 `TabBar.tsx` (phones): fixed bottom; 4 buttons (Kata, Quiz, Vocabulary, About) with icon above
  10–11px label; active = `var(--accent)`, inactive = `var(--text-2)`; height `var(--tabbar-h)` +
  `padding-bottom: env(safe-area-inset-bottom)`; `role="tablist"` is NOT needed — use `<nav aria-label>` with links.
- [ ] 3.5.4 `Sidebar.tsx` (wide screens): fixed left column width `var(--sidebar-w)`, header "Shōtōkan Kata"
  (bold 22px), then the 4 items as rows with icon + label; active row background `var(--accent)` with white text.
- [ ] 3.5.5 `Sheet.tsx`: modal bottom sheet (on wide screens: centred dialog, max-width 560px). Props:
  `open, title, onClose, leftAction?: {label, onClick}, rightAction?: {label, onClick}, children`.
  Use `<dialog>` element with `showModal()`, close on Escape and on backdrop click; trap focus via
  the native dialog. Max height 90vh, scrollable body, rounded top corners 16px, slide-up animation 200ms.
- [ ] 3.5.6 `ConfirmDialog.tsx`: small centred dialog with title, message, a cancel button and a
  destructive button (red text). Built on `<dialog>`.

### 3.6 App shell — `src/App.tsx`

- [ ] 3.6.1 Wrap everything in `SettingsProvider` and (from Phase 9) `QuizProvider`.
- [ ] 3.6.2 Layout:
  - `@media (min-width: 768px)`: Sidebar left + content right (content has `margin-left: var(--sidebar-w)`); no tab bar.
  - below 768px: content full width with `padding-bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom))` and TabBar.
  - Route `quizPlay` is **full screen**: hide both TabBar and Sidebar (iOS uses a full-screen cover).
- [ ] 3.6.3 Content area renders the screen for the current route. For now create placeholder screens
  `screens/kata/KataListScreen.tsx`, `screens/quiz/QuizMenuScreen.tsx`, `screens/vocabulary/VocabularyListScreen.tsx`,
  `screens/about/AboutScreen.tsx`, each with a `NavBar large title={t('nav.…')}`.
  Content max-width: none on phones; on wide screens the content column uses max-width 900px, centred.
- [ ] 3.6.4 Update `App.test.tsx`: renders "Kata" title by default; clicking the "Quiz" tab link changes the title to "Quiz".

Acceptance: green; `npm run dev` shows the four sections and navigation works on narrow and wide windows. Commit.

---

## Phase 4 — Kata list screen

Reference: `IOS/Views/KataListView.swift`, `IOS/ViewModels/KataListViewModel.swift`.

Files: `screens/kata/KataListScreen.tsx`, `KataRow.tsx`, `KataFilterSheet.tsx`, `components/RankBadge.tsx`, `components/Chip.tsx`, `components/SearchField.tsx`, `components/Toggle.tsx`, plus CSS files.

- [ ] 4.1 `RankBadge.tsx`: capsule with belt dot (6px for `size="small"`, 8px default) and rank name
  (`t('rank.<id>')`, unknown → `t('common.unknown')`). Background = belt colour at 20% opacity in light
  mode and 30% in dark mode (use `color-mix(in srgb, var(--belt-x) 20%, transparent)`; dark: 30%).
  Text colour: `var(--text)` in light mode; in dark mode the belt colour, except brown/black → `#FFFFFF`.
- [ ] 4.2 `SearchField.tsx`: rounded (10px) field on `var(--card)` with search icon, `<input type="search">`,
  placeholder prop, and a clear button (`clear` icon, `aria-label={t('common.clear')}`) visible when not empty.
- [ ] 4.3 `Toggle.tsx`: accessible switch (`<button role="switch" aria-checked>`), 51×31px, on = `var(--accent)`.
- [ ] 4.4 `Chip.tsx`: capsule button, 12px padding x / 6px y, 12–13px medium text; selected → `var(--accent)` bg + white text;
  unselected → `var(--card)` bg + `var(--text)`. Optional leading belt dot and trailing `(count)` in `var(--text-2)` (only if count > 0).
- [ ] 4.5 Screen layout, top to bottom (all inside the scroll area under the NavBar `large` title "Kata"):
  1. **Japanese toggle row**: label "Japanese / Hiragana" with `language` icon on the left, `Toggle` on the right;
     bound to `showJapanese` setting; background `var(--card)`.
  2. **Search field** placeholder `t('kata.searchPlaceholder')`. Debounce 300 ms before filtering.
  3. **Horizontal chip row** (scrolls horizontally, no scrollbar):
     - "All Kata" chip — selected when no search, no rank and no belt filter; tap → clear all filters (incl. search).
     - One chip per available belt colour (`availableBelts(ALL_KATA)`), label `t('belt.<color>')`, belt dot, count =
       number of kata in that belt **among the search-filtered list (ignoring rank/belt filters)**. Tap toggles belt
       filter; selecting a belt clears the rank filter.
     - "More" button: `sliders` icon + `t('kata.more')`, style accent-soft background + accent text; opens the filter sheet.
  4. **List** of `KataRow` for `filterKata(ALL_KATA, …)`, 1px gap between rows, horizontal padding 16px.
  5. **Empty state** when the filtered list is empty: big `kata` icon (64px, `--text-2`), title `t('kata.noneFound')`;
     if filters are applied: text `t('kata.tryAdjusting')` and a primary button `t('kata.clearFilters')`;
     otherwise text `t('kata.noData')`.
- [ ] 4.6 `KataRow.tsx` — an `<a href={routeToHash({name:'kataDetail', kataNumber, tab:'moves'})}>` card:
  - Left: 44px circle with kata number, white bold text, background `linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, transparent))`, 2px white border.
  - Middle: name (20px semibold, single line, ellipsis). If `showJapanese`: `japaneseName` (17px, `--text-2`) and `hiraganaName` (12px, `--text-2`).
  - Wide screens only (≥768px): an orange info chip "🎯 {n} techniques" (`t('kata.techniquesCount', {count})`), white text on `var(--orange)`.
  - Right: `RankBadge size="small"` above a `chevronRight` icon.
  - Card: `var(--card)` bg, 12px radius, hairline border `var(--separator)` 0.5px, `var(--shadow)`; padding 16px (20px on wide). Active (`:active`) → scale(0.98).
- [ ] 4.7 `KataFilterSheet.tsx` (Sheet title `t('filter.title')`, left action `t('filter.clearAll')`, right action `t('common.done')`):
  - Section "Filter by Rank": grid `repeat(auto-fill, minmax(80px, 1fr))` of rank buttons for `availableRanks(ALL_KATA)`:
    20px belt dot, rank name (11px), `(count)`. Selected → accent-soft bg + 2px accent border. Tap toggles rank filter and clears belt filter.
  - Section "Filter by Belt Color": grid `minmax(120px, 1fr)` of belt buttons: 16px dot, belt name, `({count} kata)`. Same selection style. Tap toggles belt filter and clears rank filter.
- [ ] 4.8 Keep the kata list filter state in a small module-level store or context so it survives navigating
  to a detail page and back (iOS keeps the view model alive). Same for the search text.
- [ ] 4.9 Tests `KataListScreen.test.tsx`: renders 10 rows; typing "tekki" (after advancing fake timers 300 ms) leaves 1 row;
  clicking a belt chip filters; toggling Japanese hides "平安初段".

Acceptance: green. Visual check in dev at 390px and 1024px widths, light + dark. Commit.

---

## Phase 5 — Shared text components

Reference: `IOS/Views/Common/ClickableVocabularyText.swift`, `ExpandableDescriptionView.swift`, `SpeakButton.swift`.

- [ ] 5.1 `components/VocabularySheetContext.tsx`: context with `openTerm(id: number)`; renders ONE `Sheet`
  at app level containing `VocabularyDetailContent` (built in Phase 7; for now render term name + definition)
  with right action `t('common.done')`. Add the provider in `App.tsx`.
- [ ] 5.2 `components/VocabText.tsx`: props `text: string; highlightClass?: string; className?: string`.
  Renders `linkVocabulary(text, ALL_TERMS)` segments: plain segments as text, linked segments as
  `<button type="button" class="vocab-link">` styled as inline text (no button chrome), **bold**, colour
  `var(--accent)` (or the `highlightClass` colour), that calls `openTerm(termId)` and
  `event.stopPropagation()` (so it doesn't toggle an expandable parent).
- [ ] 5.3 `components/ExpandableText.tsx`: props `text: string; threshold?: number (default 100)`.
  - Collapsed: clamp to 2 lines (`display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden`).
  - Show a small chevron button on the right (`chevronDown` / `chevronUp`, `--text-2`, aria-label expand/collapse)
    when `text.length > threshold` OR the element is actually truncated (`scrollHeight > clientHeight + 1`,
    measured in `useLayoutEffect` and on resize via `ResizeObserver`).
  - Tapping the text area (not a vocab link) or the chevron toggles. Transition ~100 ms.
  - Content is rendered with `VocabText`.
- [ ] 5.4 `components/SpeakButton.tsx` + `src/domain/speech.ts`:
  - `speech.ts`: `isSpeechSupported()` (`'speechSynthesis' in window`), `speak(text, lang = 'ja-JP')`,
    and a tiny subscribe mechanism exposing the currently speaking text.
    `speak`: if currently speaking → `speechSynthesis.cancel()`; if the same text was speaking, stop and return.
    Create `SpeechSynthesisUtterance(text)`, `lang = 'ja-JP'`, `rate = 0.8`; pick a voice whose `lang` starts with `ja`
    if available (`speechSynthesis.getVoices()`; voices may load async — listen to `voiceschanged` once).
    On `end`/`error` clear the speaking text.
  - `SpeakButton`: icon button (`speaker`, or `speakerOn` in accent colour while this text is speaking),
    `aria-label={t('vocabulary.speak')}`. Render nothing if speech is not supported.
  - iOS Safari requires speech to start from a user gesture — calling `speak` inside the click handler is enough.
- [ ] 5.5 Tests: `VocabText` renders a button for "Kata" in a sentence and clicking it calls `openTerm`;
  `ExpandableText` shows a chevron for a 300-char text and not for "Short text.".
  (Mock `speechSynthesis` only if you test SpeakButton.)

Acceptance: green. Commit.

---

## Phase 6 — Kata detail screen

Reference: `IOS/Views/KataDetail/*.swift`.

Files: `screens/kata/KataDetailScreen.tsx`, `KataHeader.tsx`, `SegmentedControl.tsx` (in components), `KataOverviewTab.tsx`, `KataMovesTab.tsx`, `KataMoveCard.tsx`, `KataSubMoveCard.tsx`, `StanceBadge.tsx`, `KiaiBadge.tsx`, `KataHistoryTab.tsx`.

- [ ] 6.1 `KataDetailScreen`: find kata by `kataNumber` in `ALL_KATA`; if not found show a "not found" message with a link back.
  NavBar: inline title = kata name, back button `t('nav.kata')` → `goBack({name:'kataList'})`.
  Below: `KataHeader`, `SegmentedControl`, then the selected tab. Changing the tab uses `navigate(..., { replace: true })`
  so tabs don't pollute browser history.
- [ ] 6.2 `KataHeader` (background `var(--card)`, padding 8px 16px):
  - Row 1: capsule `#{kataNumber}` (15px semibold, bg `--fill`); if `showJapanese`: `{hiraganaName} ({japaneseName})` 15px;
    spacer; `RankBadge`.
  - Row 2 (11px): left `t('kata.movesCount', {count: numberOfMoves})` ("Moves: 21"); right kiai text:
    0 kiai → `t('kata.kiaiNone')`; 1 → `t('kata.kiaiOne', {move})`; more → `t('kata.kiaiMany', {moves})`
    where `moves` = numbers joined with `t('common.and')` (" and " / " og ").
- [ ] 6.3 `SegmentedControl` (generic: `options: {value, label, icon}[]`, `value`, `onChange`): iOS-style segmented
  control on `--fill` background, selected segment white/`--card-2` with shadow; `role="tablist"` + `role="tab"` + `aria-selected`.
  Segments: Overview (`info`), Moves (`list`), History (`book`).
- [ ] 6.4 `KataOverviewTab` (padding 16px, sections spaced 20px):
  - "Description" heading (17px semibold) + `VocabText` of `kata.description`.
  - "Key Techniques" heading + grid `repeat(auto-fill, minmax(150px, 1fr))` of capsules (accent-soft bg, 12px text) each with `VocabText`.
  - If `referenceURL`: "Reference" heading + link card (accent-soft bg, accent text, 12px radius, padding 16): `link` icon, "Learn More", spacer, `external` icon. `target="_blank" rel="noopener noreferrer"`.
  - If `videoURLs` non-empty: heading "Video Tutorial" (1) / "Video Tutorials" (>1); one red link card per URL (`--red-soft` bg, `--red` text): `video` icon, "Watch on YouTube" or "Watch on YouTube ({n})" when more than one.
- [ ] 6.5 `KataMovesTab`: list of `KataMoveCard` for `sortedMoves(kata)`, gap 12px, padding 16px.
- [ ] 6.6 `KataMoveCard` (bg `var(--card)`, radius 12, padding 16):
  - Header row: **sequence badge** (accent bg, white bold 17px text `moveLabel(move)`, height 30, capsule;
    min-width 30, and 50 when `sequenceName` exists) — then the main info column — spacer — metadata column.
  - Main info (first sub-move exists): `VocabText` of `technique` (17px medium); if `showJapanese` and `hiragana`: hiragana (12px `--text-2`); `StanceBadge`.
    If there are no sub-moves: `VocabText` of `move.japaneseName`.
  - Metadata column (right aligned): `KiaiBadge` if `moveBadgeShowsKiai(move)`; below it direction text
    `"{DIRECTION} ({arrow})"` 12px `--text-2` (direction uppercased, arrow from `directionArrow`).
  - Below header: `ExpandableText` of the first sub-move's `description`.
  - Then, if more than one sub-move: the remaining sub-moves as `KataSubMoveCard`s, stacked with 8px gap, indented `padding-left: 42px`.
- [ ] 6.7 `KataSubMoveCard` (bg `var(--card-2)`, radius 8, padding 8px 12px): row with `MoveIcon` (accent colour, 20px wide),
  column with `VocabText` technique (17px medium), hiragana (if showJapanese), `StanceBadge`; spacer; `KiaiBadge` if `subMove.kiai`.
  Below: `ExpandableText` of the description.
- [ ] 6.8 `StanceBadge`: capsule, bg `var(--green-soft)`, padding 3px 8px; `VocabText` of stance in **bold 11px** with
  `highlightClass` that colours links `var(--green-text)` and plain text `var(--text)`; if `showJapanese` and stanceHiragana:
  ` ({stanceHiragana})` semibold 11px in `var(--green-text)` at 80% opacity.
- [ ] 6.9 `KiaiBadge`: text "KIAI!" bold 11px `var(--red)` on `var(--red-soft)`, capsule, padding 2px 6px.
- [ ] 6.10 `KataHistoryTab`: heading "Historical Background" + placeholder paragraph (`t('kata.historyPlaceholder')`, `--text-2`);
  heading "Kata Statistics" + four stat rows (bg `--fill`, radius 8, padding 8px 16px, value in accent medium):
  Total Moves = numberOfMoves; Required Rank = rank name; Kata Number = `#n`; Key Techniques = keyTechniques.length.
- [ ] 6.11 Tests: detail of kata 1 shows "Moves: 21", Moves tab is default, the "Rei" badge is rendered,
  switching to Overview shows "Description"; kata 4 header shows a kiai sentence (not "No kiai").

Acceptance: green; manual check that tapping a highlighted term in a move opens the vocabulary sheet and tapping
elsewhere on the description expands it. Commit.

---

## Phase 7 — Vocabulary

Reference: `IOS/Views/VocabularyView.swift`, `VocabularyTermRowView.swift`, `VocabularyDetail/*.swift`.

- [ ] 7.1 `screens/vocabulary/VocabularyListScreen.tsx`:
  - NavBar large title `t('nav.vocabulary')`.
  - `SearchField` placeholder `t('vocabulary.searchPlaceholder')` (no debounce needed; 112 items).
  - Row below: category button (capsule, `--card` bg, `filter` icon + selected category name or `t('vocabulary.allCategories')`)
    that opens a Sheet titled `t('vocabulary.selectCategory')` listing "All Categories" + every category in
    `categoriesWithTerms(ALL_TERMS)` (each with its icon), plus a Cancel action. On the right, if a category or search is active:
    text button `t('vocabulary.clear')` in accent colour.
  - List (plain list, hairline separators) of `VocabularyRow` linking to `#/vocabulary/<id>`.
  - Empty state: `book` icon, `t('vocabulary.emptyTitle')`, `t('vocabulary.emptySubtitle')`.
  - Keep search + category in a module-level store so they survive navigation.
- [ ] 7.2 `VocabularyRow.tsx`: line 1: term (17px semibold) + spacer + category icon (accent, 12px).
  Line 2: japaneseName (15px medium) · "•" · hiraganaName (15px `--text-2`) · `SpeakButton(text = hiraganaName)`.
  Line 3: shortDescription (17px `--text-2`, 2-line clamp). Chevron right at the far right. Padding 8px 16px.
  The SpeakButton must not trigger navigation (`preventDefault` + `stopPropagation`); so make the row a `<div>` containing
  an `<a>` covering the text area, with the speak button outside the `<a>`.
- [ ] 7.3 `VocabularyDetailContent.tsx` (used by both the detail screen and the vocabulary sheet from Phase 5):
  - Header (bg `--fill`, padding 16): term (22px bold); japaneseName (20px medium) · hiraganaName (20px `--text-2`);
    on the right `SpeakButton` + category icon (accent, 22px); below: shortDescription (15px `--text-2`).
  - Body (bg `--bg-grouped`, padding 16, gap 16): three cards (bg `--card`, radius 12, padding 16, `--shadow`):
    "Definition" + definition; "Japanese Component Breakdown" + componentBreakdown (only if present);
    "Category" + icon (22px accent) + category name.
- [ ] 7.4 `VocabularyDetailScreen.tsx`: NavBar inline title = term, back `t('nav.vocabulary')`; content = `VocabularyDetailContent`. Unknown id → not-found message.
- [ ] 7.5 Replace the temporary sheet content from 5.1 with `VocabularyDetailContent`.
- [ ] 7.6 Tests: list renders 112 rows; search "zenkutsu" shows Zenkutsu-dachi; selecting category "Kicks" shows only kick terms.

Acceptance: green. Commit.

---

## Phase 8 — Quiz domain logic (no UI)

Reference: `IOS/Services/QuizDataService.swift`, `IOS/ViewModels/QuizViewModel.swift`, `IOS/Models/QuizQuestion.swift`, `IOS/Models/QuestionCategory.swift`.

### 8.1 Types — `src/domain/quiz/types.ts`

- [ ] 8.1.1
  ```ts
  export type QuestionCategory = 'history' | 'techniques' | 'sequences' | 'applications' | 'ranks' | 'kata_order' | 'terminology' | 'philosophy';
  export const QUESTION_CATEGORIES: QuestionCategory[]; // in that order
  export type QuestionType = 'static_question' | 'kata_moves_count' | 'kata_kiai_selection' | 'kata_techniques' | 'kata_stances';
  export interface QuizQuestion {
    id: string;                 // unique, e.g. `${type}-${kataNumber}-${n}` or `static-${n}`
    question: string;
    options: string[];          // empty for kiai selection
    correctAnswerIndex: number; // 0 for kiai selection (unused)
    category: QuestionCategory;
    type: QuestionType;
    requiredRank: string;       // RankId
    explanation?: string;
    relatedKataNames?: string[];
    kataNumber?: number;        // for kiai selection: which kata to display
    correctMoves?: number[];    // for kiai selection: sequence numbers with kiai
  }
  export type QuizAnswer = { kind: 'choice'; index: number | null } | { kind: 'kiai'; moves: number[] } | { kind: 'skipped' };
  export interface QuizConfig { rank: string; category: QuestionCategory | null; numberOfQuestions: number; timed: boolean; timeLimitSec: number; }
  export const DEFAULT_QUIZ_CONFIG: QuizConfig = { rank: '9_kyu', category: null, numberOfQuestions: 10, timed: true, timeLimitSec: 600 };
  ```

### 8.2 Random helpers — `src/domain/quiz/random.ts`

- [ ] 8.2.1 `export type Rng = () => number;` `shuffle<T>(arr, rng): T[]` (Fisher–Yates, returns a new array),
  `pick<T>(arr, rng): T | undefined`, `randInt(min, max, rng)` (inclusive). Tests use a seeded RNG
  (implement `mulberry32(seed)` in the same file).

### 8.3 Static questions — `src/domain/quiz/staticQuestions.ts`

- [ ] 8.3.1 Copy these six questions **verbatim** (from `generateStaticQuestions()` in `QuizDataService.swift`):

  | # | question | options (correct first marked ✓) | correct idx | category | rank | explanation | related |
  |---|----------|-----------------------------------|-------------|----------|------|-------------|---------|
  | 1 | What is the first kata learned in Shōtōkan karate? | Heian Shodan ✓, Heian Nidan, Tekki Shodan, Bassai Dai | 0 | kata_order | 9_kyu | Heian Shodan is traditionally the first kata taught to beginners in Shōtōkan karate. | Heian Shodan |
  | 2 | What does 'Heian' mean in English? | Peace ✓, Strength, Power, Balance | 0 | terminology | 9_kyu | Heian means 'peaceful mind' or 'peace' in Japanese. | Heian Shodan, Heian Nidan, Heian Sandan, Heian Yondan, Heian Godan |
  | 3 | Which kata is typically learned at 5th Kyū level? | Heian Godan, Tekki Shodan ✓, Bassai Dai, Kankū Dai | 1 | ranks | 5_kyu | Tekki Shodan is traditionally taught at 5th Kyū (Brown Belt) level. | Tekki Shodan |
  | 4 | What stance is predominantly used in Tekki Shodan? | Zenkutsu-dachi, Kōkutsu-dachi, Kiba-dachi ✓, Shiko-dachi | 2 | techniques | 5_kyu | Tekki Shodan is performed entirely in Kiba-dachi (horse riding stance). | Tekki Shodan |
  | 5 | Which kata is often considered the flagship kata of Shōtōkan? | Heian Shodan, Tekki Shodan, Bassai Dai ✓, Empi | 2 | philosophy | 1_dan | Bassai Dai is often considered the flagship kata of Shōtōkan, representing the essence of the style. | Bassai Dai |
  | 6 | What does 'Bassai' mean? | To storm a fortress ✓, Flying swallow, Peaceful mind, Iron horse | 0 | terminology | 1_dan | Bassai means 'to storm a fortress' or 'to penetrate a fortress', reflecting the powerful nature of this kata. | Bassai Dai |

  Options must be stored in the order listed (the ✓ only marks the correct one).

### 8.4 Dynamic questions — `src/domain/quiz/generate.ts`

- [ ] 8.4.1 `export function generateAllQuestions(katas: Kata[], rng: Rng = Math.random): QuizQuestion[]`
  = static questions + moves-count + kiai-selection + technique + stance questions (in that order).
- [ ] 8.4.2 **Moves count** (one per kata), category `sequences`, rank = `kata.beltRank`:
  - question: `How many moves are in ${kata.name}?`
  - correct = `numberOfMoves`. Build a `Set<number>` of 3 distinct wrong answers, all ≥ 1 and ≠ correct:
    1. `correct + pick([-3,-2,-1,1,2,3])` (clamped to ≥ 1);
    2. a random `numberOfMoves` of another kata (if different);
    3. `randInt(15, 30)`;
    then fill with `randInt(max(1, correct-5), correct+5)` until there are 3 (skip duplicates/correct).
    (The web version guarantees uniqueness; the iOS version could produce duplicates.)
  - options = shuffle([correct, ...wrong].map(String)); correctAnswerIndex = index of correct.
  - explanation: `${kata.name} contains ${correct} moves in total.`; related: `[kata.name]`.
- [ ] 8.4.3 **Kiai selection** (one per kata that has ≥1 kiai move per `kiaiMoveNumbers`), category `sequences`, rank = beltRank:
  - question: `Select the moves where the karateka should say kiai in ${kata.name}:`
  - options `[]`, correctAnswerIndex 0, `kataNumber`, `correctMoves = kiaiMoveNumbers(kata)`.
  - explanation: 1 move → `In ${name}, kiai is performed on move ${a}.`; more → `In ${name}, kiai is performed on move ${a} and move ${b}.` (join `"move X"` parts with `" and "`).
- [ ] 8.4.4 **Technique** questions, category `techniques`, type `kata_techniques`:
  - `allTechniques` = unique `subMove.technique` over all kata, all moves with `sequenceName !== 'Rei'`.
  - If fewer than 5 unique techniques overall → generate none.
  - For each kata: eligible moves = moves with ≥1 sub-move and `sequenceName !== 'Rei'`; pick 2 at random (`shuffle(...).slice(0,2)`).
  - For each picked move: correct = first sub-move technique; wrong = 4 random others from `allTechniques` (≠ correct);
    options = shuffle(5); question: `What technique is used in ${kata.name} in step ${moveLabel(move)}?`;
    explanation `The technique used in ${kata.name} step ${label} is ${correct}.`
- [ ] 8.4.5 **Stance** questions: identical to 8.4.4 but with `subMove.stance`, type `kata_stances`, category `techniques`,
  question `What stance is used in ${kata.name} in step ${label}?`, explanation `The stance used in ${kata.name} step ${label} is ${correct}.`
- [ ] 8.4.6 `export function questionsFor(all: QuizQuestion[], rank: string, category: QuestionCategory | null): QuizQuestion[]`
  — keep questions with `rankSortOrder(q.requiredRank) <= rankSortOrder(rank)` (questions with unknown rank are excluded),
  then filter by category if given. Not shuffled.
- [ ] 8.4.7 `export function pickQuizQuestions(all, config, rng): QuizQuestion[]` = `shuffle(questionsFor(...)).slice(0, numberOfQuestions)`.

### 8.5 Quiz reducer — `src/domain/quiz/reducer.ts`

- [ ] 8.5.1 State:
  ```ts
  export type QuizStatus = 'notStarted' | 'inProgress' | 'paused' | 'completed';
  export interface QuizState {
    status: QuizStatus;
    config: QuizConfig;
    questions: QuizQuestion[];
    index: number;
    answers: QuizAnswer[];         // same length as questions, initialised to {kind:'skipped'}
    selectedIndex: number | null;  // current multiple-choice selection
    selectedMoves: number[];       // current kiai selection
    revealed: boolean;             // answer submitted → show correctness + explanation
    timeRemainingSec: number;
    startedAt: number | null;      // ms epoch
    finishedAt: number | null;
    result: QuizResult | null;
  }
  export interface QuizResult { total: number; correct: number; incorrect: number; skipped: number; timeSpentSec: number; scorePercent: number; passed: boolean; rank: string; category: QuestionCategory | null; }
  ```
- [ ] 8.5.2 Actions and behaviour:
  - `START {questions, config, now}` → status `inProgress`, index 0, answers all skipped, selections cleared,
    `revealed=false`, `timeRemainingSec = config.timed ? config.timeLimitSec : 0`, `startedAt=now`. If `questions` is empty, stay `notStarted`.
  - `SELECT_OPTION {index}` → ignored if `revealed`; sets `selectedIndex` and `answers[i] = {kind:'choice', index}`.
  - `TOGGLE_MOVE {sequence}` → ignored if `revealed`; adds/removes from `selectedMoves`.
  - `SUBMIT` → for choice questions requires `selectedIndex !== null`; for kiai requires `selectedMoves.length > 0`
    (store `answers[i] = {kind:'kiai', moves: sorted selectedMoves}`); sets `revealed = true`. Otherwise ignored.
  - `NEXT` → requires `revealed`. If last question → complete (see below). Else index+1, `revealed=false`,
    load selection from `answers[index+1]` (choice → selectedIndex; kiai → selectedMoves; skipped → cleared).
  - `PREVIOUS` → only if `index > 0` and `!revealed`; index-1, `revealed=false`, load selection as above.
  - `SKIP` → `answers[i] = {kind:'skipped'}`; if last → complete; else index+1 and load selection.
  - `TICK {now}` → only when `inProgress` and `config.timed`; `timeRemainingSec = max(0, timeRemainingSec - 1)`; when it reaches 0 → complete.
    (The UI calls TICK once per second; to be robust against background tabs the UI may dispatch
    `SYNC_TIME {remaining}` computed from a deadline — implement `SYNC_TIME` too.)
  - `PAUSE` → `inProgress` → `paused`. `RESUME` → `paused` → `inProgress`.
  - `COMPLETE {now}` → compute result, status `completed`, `finishedAt = now`.
  - `RESET` → initial state but keep `config`.
  - `SET_CONFIG {partial}` → merge into config, clamping: numberOfQuestions 1..50; timeLimitSec ≥ 60.
- [ ] 8.5.3 Result computation (per question i):
  - `choice` with index === correctAnswerIndex → correct; `choice` with other non-null index → incorrect; `choice` null → skipped.
  - `kiai`: same set as `correctMoves` (order-independent) → correct, else incorrect.
  - `skipped` → skipped.
  - `scorePercent = total ? (correct / total) * 100 : 0` (NOT rounded). The UI displays `Math.floor(scorePercent)` (like iOS `Int(score)`).
  - `passed = scorePercent >= 70`. `timeSpentSec = Math.round((finishedAt - startedAt)/1000)`.
- [ ] 8.5.4 Helpers: `isLastQuestion(state)`, `canGoBack(state)`, `currentQuestion(state)`, `hasAnswerSelected(state)`.

### 8.6 Tests

- [ ] 8.6.1 `generate.test.ts` (seeded rng):
  - static count is 6; moves-count count = number of kata (10);
  - every non-kiai question: options unique, `0 <= correctAnswerIndex < options.length`, technique/stance questions have 5 options, moves-count 4;
  - no question text contains "step Rei";
  - kiai question exists for kata 4 (Heian Yondan);
  - `questionsFor(all, '9_kyu', null)` contains only rank ≤ 9_kyu (i.e. the 2 static 9_kyu questions);
  - `questionsFor(all, '1_dan', 'terminology')` has 2 questions.
- [ ] 8.6.2 `reducer.test.ts`: full flow — start with 3 questions (choice, kiai, choice); select wrong, submit, next;
  toggle the correct moves, submit, next; skip last → completed with correct 1, incorrect 1, skipped 1, passed false.
  Timer: start timed with 2 s; TICK twice → completed.

Acceptance: green. Commit.

---

## Phase 9 — Quiz menu screen

Reference: `IOS/Views/QuizMenuView.swift`.

- [ ] 9.1 `src/state/QuizContext.tsx`: `QuizProvider` holding `useReducer(quizReducer, initial)` and generating
  the question pool **once per app session** with `useMemo(() => generateAllQuestions(ALL_KATA), [])`.
  `startQuiz()` = `dispatch(START, { questions: pickQuizQuestions(pool, state.config, Math.random), … })`, then `navigate({name:'quizPlay'})`.
  Expose `state`, `dispatch`, `availableCount = questionsFor(pool, config.rank, config.category).length`, `startQuiz`.
  Add the provider in `App.tsx`.
- [ ] 9.2 `screens/quiz/QuizMenuScreen.tsx`, NavBar large title `t('nav.quiz')`, vertical stack (gap 24, padding 16) of cards
  (bg `--card`, radius 12, 1px border `--separator`, padding 16):
  1. **Header card** (bg `--fill`, radius 16, centred): `brain` icon 48px accent; "Test Your Knowledge" (22px bold);
     `t('quiz.headerSubtitle')` (`--text-2`).
  2. **Select Your Rank**: heading + caption `t('quiz.rankCaption')`; horizontally scrolling row of 20 rank buttons
     (all ranks, `RANKS`): 20px belt dot (3px white ring when selected), rank name 11px (bold when selected);
     selected → accent-soft bg + 2px accent border. Tap → `SET_CONFIG {rank}` and clear the selected difficulty.
     Scroll the selected rank into view on mount.
  3. **Quick Difficulty Selection**: heading + caption; 4 equal-width buttons (Beginner `star` green, Intermediate `starHalf` accent,
     Advanced `award` orange, Expert `crown` red): icon 22px + label 12px; selected → coloured bg with white icon/text, else `--fill`.
     Tap → remember selected level (component state) and `SET_CONFIG {rank: highestRankOf(level)}`.
  4. **Question Category**: heading + caption; grid `repeat(auto-fill, minmax(120px,1fr))` gap 12: first "All Categories" (`quiz` icon),
     then the 8 categories with their icons (see Icon table) and names `t('quizCategory.<id>')`; min-height 80, centred;
     selected → accent bg, white icon+text; else `--fill` bg, accent icon.
  5. **Quiz Settings**:
     - "Number of Questions" + value in accent; `<input type="range" min=5 max=30 step=5>` (accent-color: var(--accent)).
     - "Timed Quiz" + `Toggle`.
     - If timed: "Time Limit" + `t('quiz.minutes', {count})` in accent; range 300..1800 step 300 (seconds).
     - Info row: `info` icon accent + `t('quiz.availableQuestions', {count: availableCount})` (12px `--text-2`).
  6. **Start Quiz** button: full width, accent gradient bg, white 17px semibold, `play` icon, radius 12, shadow in accent 30%;
     disabled (opacity 0.6) when `availableCount === 0`.
- [ ] 9.3 Test: default rank 9th Kyū shows "Available questions: 2"; selecting "Advanced" difficulty selects 2nd Dan and the count increases; Start navigates to `#/quiz/play`.

Acceptance: green. Commit.

---

## Phase 10 — Quiz play + results

Reference: `IOS/Views/QuizView.swift`, `IOS/Views/KataKiaiSelectionView.swift`.

Files: `screens/quiz/QuizPlayScreen.tsx`, `QuizProgressHeader.tsx`, `QuestionCard.tsx`, `AnswerOption.tsx`, `ExplanationCard.tsx`, `KiaiSelection.tsx`, `QuizNavButtons.tsx`, `QuizPaused.tsx`, `QuizResults.tsx`.

- [ ] 10.1 `QuizPlayScreen` (full screen, no tab bar/sidebar):
  - If `status === 'notStarted'` (e.g. page reload on `#/quiz/play`) → `navigate({name:'quizMenu'}, {replace:true})`.
  - NavBar inline (no title): left button "Exit" (red) while `inProgress`/`paused` → opens `ConfirmDialog`
    (title "Exit Quiz?", message "Your progress will be lost if you exit now.", buttons "Continue Quiz" / "Exit" destructive;
    Exit → `RESET` + navigate to quiz menu). Right: "Done" (bold) when `completed` → `RESET` + navigate to quiz menu.
    Optional right button while timed and `inProgress`: `pause` icon → `PAUSE`.
  - Body by status: `inProgress` → progress header + question + nav buttons (buttons sticky at the bottom with safe-area padding);
    `paused` → `QuizPaused`; `completed` → progress header + `QuizResults`.
  - Timer: `useEffect` while `inProgress && config.timed`: store `deadline = Date.now() + timeRemainingSec*1000`,
    `setInterval(…, 1000)` dispatching `SYNC_TIME {remaining: Math.max(0, Math.ceil((deadline - Date.now())/1000))}`; clear on cleanup.
    Also pause automatically on `visibilitychange` → hidden? **No** (iOS doesn't); keep running.
  - Browser back / hash change away from quiz play while in progress → treat as exit (dispatch RESET). Acceptable simplification.
- [ ] 10.2 `QuizProgressHeader` (bg `--card`, padding 16):
  - When inProgress or completed: row with `t('quiz.questionProgress', {current: index+1, total})` (12px medium) and, if timed and remaining > 0,
    `clock` icon + `m:ss` coloured `--text` if > 60 s, `--orange` if > 30 s, else `--red`.
    Below: progress bar (height 8px, radius 4, bg `--fill`, fill accent, width = (index+1)/total).
  - Info chips row: "Rank" chip (title 11px `--text-2`, value 12px medium accent, bg accent 10%); "Category" chip (green) if a category is selected.
- [ ] 10.3 `QuestionCard` (multiple choice): card bg `--card`, radius 16, shadow; caption "QUESTION" (12px, uppercase, letter-spacing 1px, `--text-2`);
  question text 20px medium; options list gap 12 of `AnswerOption`.
- [ ] 10.4 `AnswerOption`: full-width button, padding 16, radius 12, 2px border. Left: 32px circle with letter A–E (bold).
  States (in priority order):
  - revealed & this is correct → bg green 10%, border green, letter circle green/white text, option text green, `checkCircle` icon green at the right.
  - revealed & selected & wrong → bg red 10%, border red, circle red, text red, `xCircle` icon red.
  - revealed & not selected & wrong → default colours (as below), but with a red `xCircle` icon at the right
    (iOS shows ✓ on the correct option and ✗ on every other option once revealed).
  - selected (not revealed) → bg accent-soft, border accent, circle accent with white letter.
  - default → bg `--fill`, transparent border, circle `--separator` with `--text` letter.
  Disabled when revealed. Use `aria-pressed` for selection.
- [ ] 10.5 `ExplanationCard` (shown when revealed, multiple choice only): bg orange 10%, radius 12, padding 16:
  `lightbulb` icon orange + "Explanation" (17px semibold); explanation text; if related kata: "Related Kata" (15px medium) and
  a horizontal row of capsules (accent-soft bg, accent text, 12px).
- [ ] 10.6 `KiaiSelection` (kiai questions):
  - Question text (17px semibold) and instruction "Tap the move numbers to select which moves have kiai" (15px `--text-2`).
  - List of ALL moves of the kata (`sortedMoves`), each a button row (radius 12, 1px border; selected → accent border + accent 10% bg):
    left 32px circle with `moveLabel(move)` (selected → accent bg + white text, else grey 30%);
    middle: `move.japaneseName` (17px medium); below it a row with the first sub-move stance in a green capsule (green-soft bg, green-text,
    include ` (stanceHiragana)` if present — use `var(--text)`-safe colours, NOT black), then `move.direction` (12px `--text-2`),
    and — only when revealed and `moveHasKiai(move)` — a "KIAI!" badge. Right: `checkCircle` (accent) when selected else `circle` (grey).
  - Toggle via `TOGGLE_MOVE`. Disabled when revealed.
  - When revealed: result box (bg `--card`, radius 12, padding 16): `checkCircle` green + "Correct!" or `xCircle` red + "Incorrect";
    if incorrect: "Correct answer: {moves joined by ', '}" (15px `--text-2`); explanation (12px `--text-2`).
- [ ] 10.7 `QuizNavButtons` (bg `--bg`, padding 16, gap 12):
  - Row: "Previous" button (`chevronLeft`, accent text, accent-soft bg, flex 1) shown only if `canGoBack && !revealed`;
    main button (flex 1, white semibold on accent; grey `#8E8E93` and disabled when nothing selected and not revealed):
    not revealed → "Submit Answer" + `check`; revealed & not last → "Next Question" + `chevronRight`; revealed & last → "Finish Quiz" + `flag`.
    Submit → `SUBMIT`; Next/Finish → `NEXT`.
  - Below (only when not revealed): text button "Skip Question" (`--text-2`) → `SKIP`.
  - Same component for kiai questions (the reducer handles the difference).
  - Important: reset any per-question UI state by giving question components `key={question.id}`.
- [ ] 10.8 `QuizPaused`: `pause` icon 64px orange; "Quiz Paused" (28px bold); "Take your time. Resume when ready."; accent button "Resume Quiz" (`play` icon) → `RESUME`.
- [ ] 10.9 `QuizResults` (scrollable, gap 24, padding 16):
  - Icon 64px: `checkCircle` if passed else `xCircle`; colour by score: ≥90 green, ≥70 accent, ≥50 orange, else red.
  - "Quiz Complete!" (28px bold); "{floor(score)}% Score" (22px semibold, same colour).
  - Stats card (bg `--fill`, radius 16, padding 16) with rows (label left, bold coloured value right):
    Correct Answers `{correct}/{total}` green; Incorrect Answers red; Skipped Questions orange (only if > 0);
    Time Spent accent (`"{m}m {s}s"` or `"{s}s"` when < 1 min); Rank Level purple (rank name); Category indigo (only if set).
  - Button "Back to Main Menu" (`home` icon, accent bg, white): `RESET` and navigate to `{name:'kataList'}` (iOS switches to the Kata tab).
- [ ] 10.10 Tests (`QuizPlayScreen.test.tsx`): with a mocked QuizProvider state containing 2 static questions —
  selecting an option enables "Submit Answer"; submitting shows "Explanation" and the ✓ on the correct option;
  finishing shows "Quiz Complete!". A kiai question renders move rows and "Correct answer:" after a wrong submit.

Acceptance: green; full manual quiz run in the dev server (timed and untimed, including kiai question at rank 2nd Dan). Commit.

---

## Phase 11 — About screen

Reference: `IOS/Views/AboutView.swift`.

- [ ] 11.1 `screens/about/AboutScreen.tsx`, NavBar large title `t('nav.about')`, content padding 16, sections separated by a hairline:
  1. Centered: `kata` icon 60px accent inside a 100px accent-soft circle; "Shōtōkan Kata" (34px bold); `t('about.tagline')` (20px `--text-2`).
  2. "About": the three paragraphs `t('about.p1')`, `t('about.p2')`, and `t('about.thanks')` (italic, `--text-2`).
  3. "Features": five rows (icon 22px accent, title 15px medium, description 12px `--text-2`): see Appendix A keys `about.feature1..5.*`
     with icons `book`, `language`, `kataOrder`, `ranks`, `quiz`.
  4. "Respect for Tradition": italic paragraph `t('about.tradition')`.
  5. "Open Source": paragraph `t('about.openSource')` and link "View on GitHub" → `https://github.com/jenslohmann/ShotokanKata` (new tab).
  6. **(Web only) "Install the app"**: `InstallHint` component:
     - If running standalone (`matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone`) → text `t('install.installed')`.
     - Else if a `beforeinstallprompt` event was captured (listen in `main.tsx`, store it in a module) → button `t('install.button')` that calls `prompt()`.
     - Else if iOS/iPadOS (`/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)`) →
       instructions `t('install.ios')` with the `share` icon inline.
     - Else → `t('install.other')`.
  7. **(Web only) "Language"**: segmented control Auto / English / Dansk bound to `langSetting`.
  8. Small footer: app version from `package.json` (`import pkg from '../../../package.json'` → `pkg.version`) — `t('about.version')`.
- [ ] 11.2 Test: About renders "Open Source" and the GitHub link with the correct href.

Acceptance: green. Commit.

---

## Phase 12 — PWA (installable + offline)

- [ ] 12.1 Create `scripts/make-icons.mjs` (Node ESM, uses the `sharp` devDependency; works on macOS, Linux and Windows)
  that reads `icon-source/app-icon.jpg` and writes PNGs into `public/`:
  ```js
  import sharp from 'sharp';
  import path from 'node:path';
  import { fileURLToPath } from 'node:url';
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const src = path.join(root, 'icon-source', 'app-icon.jpg');
  const out = (f) => path.join(root, 'public', f);
  const plain = [['pwa-512x512.png', 512], ['pwa-192x192.png', 192], ['apple-touch-icon.png', 180], ['favicon-64x64.png', 64]];
  for (const [file, size] of plain) {
    await sharp(src).resize(size, size, { fit: 'cover' }).png().toFile(out(file));
  }
  // maskable: icon scaled to 80 % and centred on a 512×512 white square (safe zone for Android masks)
  const inner = await sharp(src).resize(410, 410, { fit: 'cover' }).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: '#FFFFFF' } })
    .composite([{ input: inner, gravity: 'center' }]).png().toFile(out('maskable-512x512.png'));
  console.log('Icons written to public/');
  ```
  Run `npm run icons`. If `icon-source/app-icon.jpg` is missing, run `npm run sync-data` first.
  If `sharp` cannot be installed on this machine, use `npx @vite-pwa/assets-generator` instead and note it in PROGRESS.md.
  Commit the generated PNGs (CI does not regenerate them).
- [ ] 12.2 Add `VitePWA` to `vite.config.ts`:
  ```ts
  import { VitePWA } from 'vite-plugin-pwa';
  // plugins: [react(), VitePWA({ ... })]
  VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    includeAssets: ['favicon-64x64.png', 'apple-touch-icon.png'],
    manifest: {
      name: 'Shōtōkan Kata',
      short_name: 'Kata',
      description: 'Learn traditional Shōtōkan karate kata, vocabulary and test your knowledge.',
      lang: 'en',
      start_url: './',
      scope: './',
      display: 'standalone',
      orientation: 'any',
      theme_color: '#BC2835',
      background_color: '#FFFFFF',
      icons: [
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json,webmanifest}'],
      navigateFallback: 'index.html',
      cleanupOutdatedCaches: true,
    },
    devOptions: { enabled: false },
  })
  ```
- [ ] 12.3 `index.html` `<head>` additions:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="description" content="Learn traditional Shōtōkan karate kata." />
  <meta name="theme-color" content="#BC2835" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Shōtōkan Kata" />
  <link rel="icon" type="image/png" href="./favicon-64x64.png" />
  <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
  ```
- [ ] 12.4 Add `src/vite-env.d.ts` reference `/// <reference types="vite-plugin-pwa/client" />` if you import `virtual:pwa-register`
  (only needed if you choose manual registration; with `injectRegister: 'auto'` it is not required).
- [ ] 12.5 Prevent iOS standalone quirks: `html, body { overscroll-behavior-y: none; }`; inputs font-size ≥ 16px (prevents zoom on focus in iOS Safari).
- [ ] 12.6 Verify: `npm run build && npm run preview`, open http://localhost:4173 in Chrome → DevTools → Application:
  manifest has no errors, service worker is activated, "Offline" checkbox + reload still works, all screens work offline.
  Run Lighthouse "PWA"/"Best practices" if available. Write results in PROGRESS.md.
  (If you cannot run a browser, at least verify `dist/manifest.webmanifest` and `dist/sw.js` exist and list them in PROGRESS.md.)

Acceptance: green; `dist/sw.js` and `dist/manifest.webmanifest` exist. Commit.

---

## Phase 13 — Polish: accessibility, responsive layout, dark mode

- [ ] 13.1 Keyboard: every interactive element reachable by Tab, visible focus ring, Enter/Space activate, Escape closes sheets/dialogs.
- [ ] 13.2 Screen readers: icon-only buttons have `aria-label`; `RankBadge` has text; quiz option buttons have `aria-pressed`;
  the progress bar uses `role="progressbar"` with `aria-valuenow/min/max`; the timer has `aria-live="off"` (don't spam).
- [ ] 13.3 Text scaling: use `rem` for font sizes (1rem = 16px base; e.g. 17px → 1.0625rem) so browser zoom/text size works.
- [ ] 13.4 Widths: check 320, 375, 390, 430 (phones), 768, 834, 1024, 1366 (iPad/desktop). No horizontal page scroll; chip rows scroll internally.
- [ ] 13.5 Landscape phone: tab bar still usable; content not hidden behind notch (`env(safe-area-inset-left/right)` padding).
- [ ] 13.6 Dark mode: every screen checked; no black-on-black or white-on-white text; belt dots visible.
- [ ] 13.7 Reduced motion respected (base.css rule).
- [ ] 13.8 Performance: the production JS bundle (gzip) should be < 250 KB; if larger, check that lucide is tree-shaken (named imports only).
- [ ] 13.9 No `console.log` left in `src/` (warnings for missing data are OK).

Acceptance: green; checklist results noted in PROGRESS.md. Commit.

---

## Appendix A — UI strings (en / da)

Put every key below into `src/i18n/en.ts` and `src/i18n/da.ts`. Placeholders use `{name}`.
Keys are grouped only for readability; the objects are flat (`'nav.kata': 'Kata'`).

| key | en | da |
|-----|----|----|
| app.title | Shōtōkan Kata | Shōtōkan Kata |
| nav.kata | Kata | Kata |
| nav.quiz | Quiz | Quiz |
| nav.vocabulary | Vocabulary | Ordbog |
| nav.about | About | Om |
| nav.sections | Sections | Sektioner |
| common.done | Done | Færdig |
| common.cancel | Cancel | Annuller |
| common.clear | Clear | Ryd |
| common.and | and | og |
| common.unknown | Unknown | Ukendt |
| common.notFound | Not found | Ikke fundet |
| common.expand | Show more | Vis mere |
| common.collapse | Show less | Vis mindre |
| rank.10_kyu | 10th Kyū | 10. Kyū |
| rank.9_kyu | 9th Kyū | 9. Kyū |
| rank.8_kyu | 8th Kyū | 8. Kyū |
| rank.7_kyu | 7th Kyū | 7. Kyū |
| rank.6_kyu | 6th Kyū | 6. Kyū |
| rank.5_kyu | 5th Kyū | 5. Kyū |
| rank.4_kyu | 4th Kyū | 4. Kyū |
| rank.3_kyu | 3rd Kyū | 3. Kyū |
| rank.2_kyu | 2nd Kyū | 2. Kyū |
| rank.1_kyu | 1st Kyū | 1. Kyū |
| rank.1_dan | 1st Dan | 1. Dan |
| rank.2_dan | 2nd Dan | 2. Dan |
| rank.3_dan | 3rd Dan | 3. Dan |
| rank.4_dan | 4th Dan | 4. Dan |
| rank.5_dan | 5th Dan | 5. Dan |
| rank.6_dan | 6th Dan | 6. Dan |
| rank.7_dan | 7th Dan | 7. Dan |
| rank.8_dan | 8th Dan | 8. Dan |
| rank.9_dan | 9th Dan | 9. Dan |
| rank.10_dan | 10th Dan | 10. Dan |
| belt.white | White Belt | Hvidt Bælte |
| belt.yellow | Yellow Belt | Gult Bælte |
| belt.orange | Orange Belt | Orange Bælte |
| belt.green | Green Belt | Grønt Bælte |
| belt.purple | Purple Belt | Lilla Bælte |
| belt.brown | Brown Belt | Brunt Bælte |
| belt.black | Black Belt | Sort Bælte |
| difficulty.beginner | Beginner | Begynder |
| difficulty.intermediate | Intermediate | Øvet |
| difficulty.advanced | Advanced | Avanceret |
| difficulty.expert | Expert | Ekspert |
| kata.japaneseToggle | Japanese / Hiragana | Japansk / Hiragana |
| kata.searchPlaceholder | Search kata... | Søg kata... |
| kata.allKata | All Kata | Alle Kata |
| kata.more | More | Mere |
| kata.noneFound | No Kata Found | Ingen kata fundet |
| kata.tryAdjusting | Try adjusting your search or filters | Prøv at justere din søgning eller dine filtre |
| kata.clearFilters | Clear Filters | Ryd filtre |
| kata.noData | No kata data available | Ingen kata-data tilgængelige |
| kata.techniquesCount | {count} techniques | {count} teknikker |
| kata.movesCount | Moves: {count} | Bevægelser: {count} |
| kata.kiaiNone | No kiai in this kata. | Ingen kiai i denne kata. |
| kata.kiaiOne | Kiai on move {move}. | Kiai på bevægelse {move}. |
| kata.kiaiMany | Kiai on moves {moves}. | Kiai på bevægelserne {moves}. |
| kata.tab.overview | Overview | Oversigt |
| kata.tab.moves | Moves | Bevægelser |
| kata.tab.history | History | Historie |
| kata.description | Description | Beskrivelse |
| kata.keyTechniques | Key Techniques | Nøgleteknikker |
| kata.reference | Reference | Reference |
| kata.learnMore | Learn More | Læs mere |
| kata.videoTutorial | Video Tutorial | Videovejledning |
| kata.videoTutorials | Video Tutorials | Videovejledninger |
| kata.watchOnYouTube | Watch on YouTube | Se på YouTube |
| kata.watchOnYouTubeN | Watch on YouTube ({n}) | Se på YouTube ({n}) |
| kata.historicalBackground | Historical Background | Historisk baggrund |
| kata.historyPlaceholder | This section will contain historical information about the kata, including its origins, development, and significance in Shōtōkan karate. | Denne sektion vil indeholde historisk information om kataen, herunder dens oprindelse, udvikling og betydning i Shōtōkan karate. |
| kata.statistics | Kata Statistics | Kata-statistik |
| kata.totalMoves | Total Moves | Bevægelser i alt |
| kata.requiredRank | Required Rank | Krævet graduering |
| kata.kataNumber | Kata Number | Kata-nummer |
| kata.keyTechniquesCount | Key Techniques | Nøgleteknikker |
| filter.title | Filters | Filtre |
| filter.clearAll | Clear All | Ryd alle |
| filter.byRank | Filter by Rank | Filtrer efter graduering |
| filter.byBelt | Filter by Belt Color | Filtrer efter bæltefarve |
| filter.kataCount | ({count} kata) | ({count} kata) |
| vocabulary.searchPlaceholder | Search terms... | Søg termer... |
| vocabulary.allCategories | All Categories | Alle kategorier |
| vocabulary.selectCategory | Select Category | Vælg kategori |
| vocabulary.clear | Clear | Ryd |
| vocabulary.emptyTitle | No terms found | Ingen termer fundet |
| vocabulary.emptySubtitle | Try adjusting your search or filter | Prøv at justere din søgning eller filter |
| vocabulary.definition | Definition | Definition |
| vocabulary.breakdown | Japanese Component Breakdown | Japansk komponentopdeling |
| vocabulary.category | Category | Kategori |
| vocabulary.speak | Speak Japanese word | Udtal japansk ord |
| vocabCategory.general | General | Generelt |
| vocabCategory.etiquette | Etiquette | Etikette |
| vocabCategory.titles | Titles | Titler |
| vocabCategory.techniques | Techniques | Teknikker |
| vocabCategory.stances | Stances | Stillinger |
| vocabCategory.blocks | Blocks | Blokeringer |
| vocabCategory.punches | Punches | Slag |
| vocabCategory.kicks | Kicks | Spark |
| vocabCategory.training | Training | Træning |
| vocabCategory.ranks | Ranks | Graduering |
| vocabCategory.equipment | Equipment | Udstyr |
| quizCategory.history | History | Historie |
| quizCategory.techniques | Techniques | Teknikker |
| quizCategory.sequences | Sequences | Sekvenser |
| quizCategory.applications | Applications | Anvendelser |
| quizCategory.ranks | Ranks | Gradueringer |
| quizCategory.kata_order | Kata Order | Kata-rækkefølge |
| quizCategory.terminology | Terminology | Terminologi |
| quizCategory.philosophy | Philosophy | Filosofi |
| quiz.headerTitle | Test Your Knowledge | Test din viden |
| quiz.headerSubtitle | Challenge yourself with questions about Shōtōkan kata, techniques, and philosophy based on your current rank. | Udfordr dig selv med spørgsmål om Shōtōkan kata, teknikker og filosofi baseret på din nuværende graduering. |
| quiz.selectRank | Select Your Rank | Vælg din graduering |
| quiz.rankCaption | Questions will be appropriate for your rank level and below. | Spørgsmålene passer til din graduering og lavere. |
| quiz.quickDifficulty | Quick Difficulty Selection | Hurtigt valg af sværhedsgrad |
| quiz.quickDifficultyCaption | Or choose by difficulty level instead of specific rank. | Eller vælg efter sværhedsgrad i stedet for en bestemt graduering. |
| quiz.category | Question Category | Spørgsmålskategori |
| quiz.categoryCaption | Choose a specific category or leave unselected for mixed questions. | Vælg en bestemt kategori, eller lad være for blandede spørgsmål. |
| quiz.allCategories | All Categories | Alle kategorier |
| quiz.settings | Quiz Settings | Quiz-indstillinger |
| quiz.numberOfQuestions | Number of Questions | Antal spørgsmål |
| quiz.timed | Timed Quiz | Tidsbegrænset quiz |
| quiz.timeLimit | Time Limit | Tidsgrænse |
| quiz.minutes | {count} minutes | {count} minutter |
| quiz.availableQuestions | Available questions: {count} | Tilgængelige spørgsmål: {count} |
| quiz.start | Start Quiz | Start quiz |
| quiz.exit | Exit | Afslut |
| quiz.exitTitle | Exit Quiz? | Afslut quiz? |
| quiz.exitMessage | Your progress will be lost if you exit now. | Dine fremskridt går tabt, hvis du afslutter nu. |
| quiz.continue | Continue Quiz | Fortsæt quiz |
| quiz.pause | Pause | Pause |
| quiz.questionProgress | Question {current} of {total} | Spørgsmål {current} af {total} |
| quiz.rank | Rank | Graduering |
| quiz.categoryChip | Category | Kategori |
| quiz.questionLabel | Question | Spørgsmål |
| quiz.explanation | Explanation | Forklaring |
| quiz.relatedKata | Related Kata | Relaterede kata |
| quiz.previous | Previous | Forrige |
| quiz.submit | Submit Answer | Indsend svar |
| quiz.next | Next Question | Næste spørgsmål |
| quiz.finish | Finish Quiz | Afslut quiz |
| quiz.skip | Skip Question | Spring over |
| quiz.kiaiInstruction | Tap the move numbers to select which moves have kiai | Tryk på bevægelsesnumrene for at vælge, hvilke bevægelser der har kiai |
| quiz.correct | Correct! | Korrekt! |
| quiz.incorrect | Incorrect | Forkert |
| quiz.correctAnswer | Correct answer: {answer} | Korrekt svar: {answer} |
| quiz.paused | Quiz Paused | Quiz sat på pause |
| quiz.pausedMessage | Take your time. Resume when ready. | Tag dig god tid. Fortsæt, når du er klar. |
| quiz.resume | Resume Quiz | Fortsæt quiz |
| quiz.complete | Quiz Complete! | Quiz gennemført! |
| quiz.score | {score}% Score | {score}% score |
| quiz.correctAnswers | Correct Answers | Korrekte svar |
| quiz.incorrectAnswers | Incorrect Answers | Forkerte svar |
| quiz.skippedQuestions | Skipped Questions | Oversprungne spørgsmål |
| quiz.timeSpent | Time Spent | Tidsforbrug |
| quiz.rankLevel | Rank Level | Gradueringsniveau |
| quiz.backToMenu | Back to Main Menu | Tilbage til hovedmenuen |
| about.tagline | Traditional Karate Learning | Traditionel karatelæring |
| about.about | About | Om |
| about.p1 | Shōtōkan Kata is a comprehensive learning platform for traditional Shōtōkan karate practitioners. This app provides detailed information about authentic JKA (Japan Karate Association) kata, including complete move sequences, Japanese terminology, and proper pronunciation guides. | Shōtōkan Kata er en omfattende læringsplatform for udøvere af traditionel Shōtōkan karate. Appen giver detaljeret information om autentiske JKA-kata (Japan Karate Association), herunder komplette bevægelsessekvenser, japansk terminologi og udtalevejledning. |
| about.p2 | Whether you're a beginner learning your first kata or an advanced practitioner reviewing complex sequences, this app serves as your digital companion for mastering the art of Shōtōkan karate. | Uanset om du er begynder og lærer din første kata, eller en erfaren udøver der repeterer komplekse sekvenser, er appen din digitale følgesvend i Shōtōkan karate. |
| about.thanks | Special thanks to Malene Kirkeby sensei, a multiple WUKF world championship gold medalist, for her exceptional kata work and dedication to the art of Shōtōkan karate. Some of her work is found in this app. | En særlig tak til Malene Kirkeby sensei, flerdobbelt WUKF-verdensmester, for hendes enestående kata-arbejde og dedikation til Shōtōkan karate. Noget af hendes arbejde findes i denne app. |
| about.features | Features | Funktioner |
| about.feature1.title | Complete Kata Database | Komplet kata-database |
| about.feature1.desc | Detailed information for all traditional JKA Shōtōkan kata | Detaljeret information om alle traditionelle JKA Shōtōkan kata |
| about.feature2.title | Authentic Japanese Terminology | Autentisk japansk terminologi |
| about.feature2.desc | Proper technique names with hiragana pronunciation guides | Korrekte teknik-navne med hiragana-udtalevejledning |
| about.feature3.title | Step-by-Step Sequences | Trin-for-trin sekvenser |
| about.feature3.desc | Complete move breakdowns with stances and directions | Komplette bevægelser med stillinger og retninger |
| about.feature4.title | Rank-Based Organization | Organiseret efter graduering |
| about.feature4.desc | Kata organized by traditional Kyū and Dan rank progression | Kata organiseret efter traditionel Kyū- og Dan-progression |
| about.feature5.title | Knowledge Testing | Videnstest |
| about.feature5.desc | Quiz system to test your understanding of kata and techniques | Quiz til at teste din forståelse af kata og teknikker |
| about.traditionTitle | Respect for Tradition | Respekt for traditionen |
| about.tradition | This app seeks to honor the traditional teachings of Shōtōkan karate as refined by the Japan Karate Association (JKA). All kata information follows authentic JKA curriculum standards, ensuring practitioners learn with respect for the art's rich heritage. In case of doubt please refer to your instructor or official JKA resources - e.g. the books "Karate-dō kata" volumes 1-4 by Japan Karate Association. | Appen søger at ære de traditionelle læresætninger i Shōtōkan karate, som de er forfinet af Japan Karate Association (JKA). Al kata-information følger autentiske JKA-pensumstandarder. Er du i tvivl, så spørg din instruktør eller brug officielle JKA-kilder – f.eks. bøgerne "Karate-dō kata" bind 1-4 fra Japan Karate Association. |
| about.openSourceTitle | Open Source | Open source |
| about.openSource | This app is open source and available on GitHub. Feel free to explore the code, contribute improvements, or use it as a learning resource. | Appen er open source og tilgængelig på GitHub. Du er velkommen til at udforske koden, bidrage med forbedringer eller bruge den som læringsressource. |
| about.viewOnGitHub | View on GitHub | Se på GitHub |
| about.language | Language | Sprog |
| about.languageAuto | Auto | Auto |
| about.languageEnglish | English | English |
| about.languageDanish | Dansk | Dansk |
| about.version | Version {version} | Version {version} |
| install.title | Install the app | Installer appen |
| install.button | Install | Installer |
| install.installed | The app is installed on this device. | Appen er installeret på denne enhed. |
| install.ios | In Safari, tap the Share button and choose "Add to Home Screen". | Tryk på Del-knappen i Safari, og vælg "Føj til hjemmeskærm". |
| install.other | Use your browser's menu and choose "Install app" or "Add to Home Screen". | Brug browserens menu, og vælg "Installer app" eller "Føj til hjemmeskærm". |

Notes:
- The heading strings used on the Overview/History/Vocabulary detail screens are listed above; if you need an additional
  UI string, add it to BOTH files and to this table (in PLAN.md) in the same commit.
- Kata names, kata descriptions, technique names, vocabulary content and quiz question texts are data and stay in English
  (they are NOT translated).

