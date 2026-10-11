# PROGRESS
## Current phase
1 (done — green: typecheck/test/build all exit 0; committed)
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
## Blocked
- (empty)
## Notes / decisions
- create-vite@9.2.1 template uses TypeScript ~6.0.2, Vite ^8.3.0, React 19.2.8, oxlint. vite-plugin-pwa/vitest support Vite 8, no downgrade needed.
- `tsc -b --noEmit` works with TS 6.0.2 and noEmit in tsconfig (no error), so kept the plan's typecheck script as-is.
- jest-dom v7: the root entry augments Jest's matcher namespace, not vitest's `Assertion`. The vitest entry (`@testing-library/jest-dom/vitest`) augments vitest and is the correct runtime+type import. So setup.ts imports `@testing-library/jest-dom/vitest` (plan said `@testing-library/jest-dom`); tsconfig `types` keeps `@testing-library/jest-dom` per plan (harmless, matches plan text). typecheck+test confirm matchers resolve.
- lucide-react installed at ^1.55.0 (1.x line). Will verify icon export names when Icon.tsx is written (Phase 3).
- Green: npm run typecheck && npm run test && npm run build all exit 0.
