# Killi and Milli: notes for Claude Code

## What this is
A co-op arcade maze game (a spiritual successor to Nitrome's *Bad Ice-Cream*) by Devin Dyson. Two pufferfish, Killi and Milli, grow and break coral walls, puff up to stun creatures, and gather snacks across 16 reefs plus two boss reefs. There is a story, a Look and sound settings lab, character customization with earnable outfits, scoring, and a wiki. The game is being prepared for web portals (Poki, CrazyGames), itch.io, and later an iOS build. See `LAUNCH.md` for the plan and `marketing/listing.md` for copy.

## Layout
- `index.html` is the entire game: HTML, CSS and one `<script>` with no build step and no dependencies. Keep it that way unless there is a strong reason; portals and the PWA rely on the single file.
- `wiki/index.html` is generated. Do not hand-edit it; change `tools/wiki/wiki_gen.py` and run `npm run wiki`.
- `tests/` are jsdom-based suites that drive the real game through a debug hook (`window.__pp`) and render frames with `@napi-rs/canvas`. `npm run test:quick` takes about 3 minutes; `npm run test:gameplay` adds randomized playthroughs of all 18 levels in both modes and takes about 5 minutes. Run the quick suite after any change and the full suite before a release. Tests write images to `tests/out/` (gitignored); look at them when a change is visual.
- `tools/` regenerates the wiki images, store screenshots and icons from the game itself, so visuals in the wiki always match the build.
- `sw.js` caches the game for offline play. Bump `CACHE` in it whenever `index.html` changes in a release.

## How the game code is organized (all in index.html)
Config (constants, `LEVELS` text maps with a legend comment, `STORY`, `THEMES`, `PALETTES`/`PATTERNS`/`ACCESSORIES`/`UNLOCKS`), then the `Ads` adapter, DOM and save state, level flow (`loadLevel`, `nextWave`, `levelWon`, `startLevel`, menus), simulation (`update`, players, snacks, enemies with `decide`/`bfsStep`, bosses, collisions), particles, art (`buildArt`/`buildPaperArt` sprite prerendering, `drawScene`, `drawRows` draws back-to-front by row for the three-quarter view, one draw function per creature), HUD, input, sound (every effect and both music tracks are synthesized with Web Audio; `PACKS` and `TRACKS`), the Look and sound lab, story rendering, and the frame loop. `window.__pp` at the end exposes hooks for the tests.

## Conventions and decisions already made
- Product copy: no em dashes, no exclamation points, no emoji. Sentence case. Plain verbs.
- Names: Killi (not Killo), Milli, Nori the seal, Bruiser the shark, the Kraken Queen. Store copy never mentions Bad Ice-Cream or Nitrome.
- Default look is Cut paper. Reef, Twilight and Lagoon remain as options. A Retro pixel look, a Wooden sound pack and an Arcade tide music track were built and deliberately cut; do not bring them back.
- Scoring: snack values in `SNACK_PTS`, streak bonus, 200 per boss hit, 1,000 for the defeating hit. Stars come from catches (0 = 3 stars, 1 to 2 = 2, more = 1).
- Unlocks are defined in `UNLOCKS` and checked by `isUnlocked`; `fishCfg` falls back to defaults for anything locked. Unlock announcements compare against `S.unlocksAtStart`, taken at level start, because milestones can be crossed mid-level.
- Save data lives in `localStorage` under `puffer-panic-v2`. Add new keys with a fallback; never break old saves. One-time migrations go next to `save.paperDefault`.
- The `Ads` adapter is the only place that should know about portal SDKs. When a portal accepts the game, add their script tag in `<head>` at the marked comment and nothing else should need to change.
- Tunables people are most likely to ask about: `PSPEED`, `PUFF_T`, `PUFF_CD`, `STUN_T`, `ESPEED` per creature, the Queen's lane warning (0.9 s in `spawnTent`), Bruiser's charge speed (9.5) and dizzy time (2.6).

## Working style the owner expects
Lead with the answer. Verify rather than assert: run the tests, render a frame, and say what was checked. Push back when a request is disproportionate to the stakes. Prefer concise prose to bullet lists in replies.

## Verify before claiming
`npm run test:quick` must pass. For visual work, render with the relevant test and view the PNG in `tests/out/`. For audio, `npm run test:audio` renders every effect offline and prints peak levels; effects should stay above about 0.08 and below clipping, with music quieter than effects.
