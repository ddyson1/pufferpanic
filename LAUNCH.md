# Launch plan

Dates assume a start in early October 2026. Each phase has a clear finish line; do not start the next until the previous one is actually done.

## Phase 1: ship the web version (week 1)
- [ ] Push this repository and turn on GitHub Pages (Settings, Pages, main branch, root). Check the game and `/wiki/` load at the Pages address, and that "Add to Home Screen" works on your phone.
- [ ] Register `killiandmilli.com` or similar and point it at Pages (optional, but portals and press like a real domain).
- [ ] Create an itch.io page: upload `index.html` as an HTML game, set it to "pay what you want", add the ten screenshots, the icon and the copy from `marketing/listing.md`.
- [ ] Play every level yourself on a laptop and a phone. Note anything unfair. The usual single-number tunings are in `index.html`: PUFF_CD, STUN_T, enemy speeds in ESPEED, the Queen's warning time (0.9) and Bruiser's charge speed (9.5).

## Phase 2: playtest and tune (weeks 2 to 3)
- [ ] Get five people who have never seen the game to play while you watch, without helping. Write down where they get stuck or stop having fun.
- [ ] Watch for: the difficulty of the deep reefs after Bruiser, whether people discover puffing on their own, whether co-op partners understand reviving, and whether the first boss is readable.
- [ ] Tune, then repeat with two or three new people.
- [ ] Decide the final name and check it against the App Store, Google Play, itch.io and the USPTO trademark database.

## Phase 3: portals (weeks 3 to 5)
- [ ] Apply to Poki for Developers and the CrazyGames developer portal with the itch.io link, screenshots and copy. Apply to both at once; neither requires exclusivity by default.
- [ ] When accepted, add the portal's SDK script tag in the head of `index.html` where the comment says. The game already calls gameplayStart, gameplayStop, commercialBreak and rewardedBreak at the right moments through the `Ads` adapter, and the "Watch an ad to continue" option switches on automatically when an SDK is present.
- [ ] Pass their QA: fast load, no external links, sound muted during ads, works at every window size, touch controls on mobile.
- [ ] Pitch Coolmath Games (licensing, kid-friendly) and Armor Games (upfront sponsorship) by email with the same kit.
- [ ] Post on r/WebGames and r/IndieGaming, and send the itch link to a few browser-game newsletters.

## Phase 4: measure (weeks 6 to 10)
- [ ] Track plays, play time and revenue per portal for a month. Portals pay roughly $15 to $28 per thousand rewarded-video views from US players and far less elsewhere, so this tells you what the game is worth before spending on mobile.
- [ ] If a portal offers an exclusive or licensing deal, compare it against the other portals' trailing month before signing.

## Phase 5: mobile (only if phase 4 is good)
- [ ] Wrap the game with Capacitor for iOS (Mac, Xcode, Apple Developer Program at $99 a year) and Android.
- [ ] Add haptics on puff and boss hits, keep saves in Capacitor Preferences, bundle the fonts, and handle backgrounding (pause on blur is already in).
- [ ] Decide premium ($2.99, no ads, story and unlocks as the pitch) versus free with rewarded ads. Premium is simpler and fits a story game; free needs retention work.
- [ ] Submit, then send the store link to the sites that covered the web version.

## Later ideas
- Steam build (Remote Play Together makes the co-op shareable online).
- A level editor using the existing text-map format, so players make reefs.
- A pitch to a publisher if the numbers support it.
