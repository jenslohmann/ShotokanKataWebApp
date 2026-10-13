# PROGRESS
## Current phase
3 (done — green: typecheck/test/build all exit 0; committed). Next: Phase 4
## Done
- 0.1 read AGENTS.md
- 0.2 created PROGRESS.md
- 0.3 cloned iOS reference to .ios-reference (read-only); added .ios-reference/ to .gitignore
- 0.4 skimmed key iOS files (ContentView, KataListView, QuizDataService, QuizViewModel, KataListViewModel, DifficultyLevel) — understood behaviour
- 0.5 inspected kata.json, 04_heian_yondan.json and vocabulary.json shapes (10 kata files, 112 terms)
- 1.1 generated Vite react-ts template in /tmp and copied into project root (docs intact); git repo already main; removed template README
- 1.2 installed deps (lucide-react, vite-plugin-pwa, vitest, @testing-library/*, jsdom, sharp) — no peer conflicts, no --force/--legacy-peer-deps
- 1.3 deleted demo content (App.css, index.css, assets/, public svgs); App.tsx now renders <h1>Shōtōkan Kata</h1>; named App export; updated main.tsx
- 1.4 package.json scripts set exactly per plan (kept lint=oxlint); renamed to shotokan-kata-web
- 1.5 tsconfig.app.json: strict, resolveJsonModule, types [vite/client, vitest/globals, @testing-library/jest-dom], DOM.Iterable lib
- 1.6 vite.config.ts replaced per plan (base './', vitest globals+jsdom+setup); PWA plugin NOT added (Phase 12)
- 1.7 src/test/setup.ts created — DEVIATION: imports '@testing-library/jest-dom/vitest' (see Notes)
- 1.8 App.test.tsx created; named App export; test passes
- 1.9 index.html lang=en, title Shōtōkan Kata
- 1.10 .gitignore has node_modules, dist, dev-dist, coverage, .ios-reference/
- 2.1.1 scripts/sync-data.mjs (Node built-ins only; IOS_REF_DIR override, --update pull, JSON validation, enabled-file warning, icon copy, source.json, summary)
- 2.1.2 ran sync-data: iOS commit 90d1656, 10 kata files, 112 vocabulary terms
- 2.1.3 no predev/prebuild hooks; src/data/ and icon-source/app-icon.jpg committed
- 2.2.1 src/domain/types.ts exactly per plan
- 2.3.1 src/domain/ranks.ts (RANKS, getRank, rankSortOrder, beltOf, DIFFICULTY_*, highestRankOf) — verified against DifficultyLevel.swift code (6_kyu green)
- 2.4.1–2.4.11 src/domain/kata.ts (eager glob load, filter/search, sortedMoves, moveHasKiai, kiaiMoveNumbers, moveBadgeShowsKiai, directionArrow, moveLabel, availableRanks/Belts)
- 2.5.1–2.5.5 src/domain/vocabulary.ts (categories, ALL_TERMS sorted, filterTerms, categoriesWithTerms, findTerm)
- 2.6.1–2.6.2 src/domain/vocabularyLinks.ts (folded text + index map, longest-first, whole-word, first occurrence per variation, memoized)
- 2.7.1–2.7.4 ranks/kata/vocabulary/vocabularyLinks tests — 21 tests pass
- 3.1.1–3.1.3 styles/theme.css (all plan variables, light + dark) and base.css (reset, focus ring, .visually-hidden, reduced motion, .belt-dot--<color>); imported in main.tsx
- 3.2.1–3.2.4 i18n/en.ts + da.ts generated verbatim from PLAN.md Appendix A (184 keys + 2 new), index.ts (detectLang, translate with {placeholders}), i18n.test.ts
- 3.3.1–3.3.4 state/SettingsContext.tsx (showJapanese, langSetting, lang, t; localStorage sk.showJapanese / sk.lang wrapped in try/catch; sets <html lang>; useSettings/useT)
- 3.4.1–3.4.6 router/router.ts (Route, parseHash, routeToHash, sectionOf, sectionRoot), router/useRoute.ts (useSyncExternalStore hook, navigate with replace, goBack via in-memory stack, per-section last route via sectionHref, scroll to top / restore on back), router.test.ts round-trips
- 3.5.1 components/Icon.tsx (only lucide import; Icon + MoveIcon with mirrored shield.righthalf)
- 3.5.2–3.5.4 NavBar (back button, large title), TabBar (nav with links, aria-current), Sidebar; shared section icons/labels in components/sections.ts
- 3.5.5–3.5.6 Sheet and ConfirmDialog on native <dialog> (showModal, Escape via cancel, backdrop click), shared hook components/useModalDialog.ts
- 3.6.1–3.6.4 App shell (SettingsProvider, sidebar ≥768px / tab bar below, quizPlay full screen, 900px content column), 4 placeholder screens, App.test.tsx (default Kata title, Quiz tab navigation) — 36 tests pass
## Blocked
- (empty)
## Notes / decisions
- create-vite@9.2.1 template uses TypeScript ~6.0.2, Vite ^8.3.0, React 19.2.8, oxlint. vite-plugin-pwa/vitest support Vite 8, no downgrade needed.
- `tsc -b --noEmit` works with TS 6.0.2 and noEmit in tsconfig (no error), so kept the plan's typecheck script as-is.
- jest-dom v7: the root entry augments Jest's matcher namespace, not vitest's `Assertion`. The vitest entry (`@testing-library/jest-dom/vitest`) augments vitest and is the correct runtime+type import. So setup.ts imports `@testing-library/jest-dom/vitest` (plan said `@testing-library/jest-dom`); tsconfig `types` keeps `@testing-library/jest-dom` per plan (harmless, matches plan text). typecheck+test confirm matchers resolve.
- lucide-react installed at ^1.55.0 (1.x line). Will verify icon export names when Icon.tsx is written (Phase 3).
- Green: npm run typecheck && npm run test && npm run build all exit 0.
- Phase 2: kata data files disagree with kata.json on kataNumber: 09_bassai_dai.json has kataNumber 7, 10_kanku_dai.json has kataNumber 9 (kata.json says 9 and 10). The iOS app decodes kataNumber from the kata file, so the web app does too. Test 2.7.2 therefore expects [1,2,3,4,5,6,7,9,11,15] instead of the plan's [1,2,3,4,5,6,9,10,11,15]. Data was not changed (iOS repo is read-only) — possibly worth fixing upstream.
- Phase 2: linkVocabulary memo cache is keyed by terms array (WeakMap) and then by text, so tests with fake terms cannot collide with the app's static ALL_TERMS cache. Same behaviour as the plan for the static term list.
- Phase 3: lucide-react 1.x has no brand icons and renamed some icons. Substitutions in Icon.tsx: quiz → CircleQuestionMark (was CircleHelp), hand.raised.fingers.spread.fill → HandGrab (was Grab), video → SquarePlay (no Youtube icon), github → GitBranch (no Github icon).
- Phase 3: added i18n keys app.title (Shōtōkan Kata, sidebar header) and nav.sections (Sections / Sektioner, aria-label of tab bar and sidebar nav) to en.ts, da.ts and the PLAN.md Appendix A table.
- Phase 3: added theme variables --on-accent (#fff, text on accent backgrounds like the active sidebar row) and --navbar-bg (95% opacity bg for nav/tab bar blur), so no colours are hard-coded in component CSS.
- Phase 3: the window (not an inner container) scrolls, which behaves best with iOS Safari bars; useRoute scrolls to top on navigation and restores the saved scroll position on back. test/setup.ts stubs window.scrollTo (not implemented in jsdom).
- Phase 3: kataDetail / quizPlay / vocabDetail routes render their section placeholder until Phases 6/10/7.
