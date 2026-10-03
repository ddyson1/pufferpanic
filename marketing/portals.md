# Portal submissions: CrazyGames and Poki

Both take the same build with their own SDK script tag added. `npm run portal:crazygames` and `npm run portal:poki` write the zips to `dist/`, with the service worker left out, the manifest link removed, and no request to anything outside the file except the SDK itself (the title font is bundled). `npm run portal:assets` cuts the images below from the key art and captures four gameplay screenshots cut to 1440 x 1080 around the board into `marketing/portals/`.

The `Ads` adapter in `index.html` already calls both SDKs: init and loading finished on load, gameplay start and stop around play, pauses and menus, a midgame ad at natural pauses, and a rewarded ad behind "Watch an ad to continue". Sound is muted while an ad shows.

## Shared copy

- Name: Killi and Milli
- One line: Puffs first, asks questions later. A co-op reef maze for one or two players.
- Short: A co-op arcade maze game. Grow coral walls to trap crabs, eels and stingrays, puff up when they get close, and gather every snack before the Moonlight Feast.
- Long: use the long description from `listing.md`, without the rating line.
- Genre: Arcade. Secondary: Puzzle, Casual.
- Tags: arcade, maze, co-op, 2 player, local multiplayer, puzzle, cute, ocean, fish, family, casual, 1 player
- Controls: Arrows or WASD to swim. Space grows or breaks coral. Shift puffs up. Two players: Killi keeps WASD, Space and left Shift, Milli takes the arrows, Option or Alt, and right Shift. Touch controls on phones. P or Esc pauses.
- Devices: desktop and mobile. Orientation on mobile: landscape. Two players need a keyboard.
- Age: everyone. No blood, no text chat, no purchases, no user content.
- Languages: English.
- Multiplayer: local co-op on one keyboard. No online play.
- Monetization: ads through the portal SDK, midgame and rewarded. No in-app purchases.
- Session length: a reef takes two to three minutes; sixteen reefs plus two bosses.
- Technology: HTML5, canvas and Web Audio, no engine, one file.

## CrazyGames

Apply at the CrazyGames developer portal with the `dist/killi-and-milli-crazygames.zip` upload (index.html at the root). Fields they ask for, with the file to use:
- Cover 16:9: `marketing/portals/cover-16x9-1920x1080.png`
- Cover 4:3: `marketing/portals/cover-4x3-1600x1200.png`
- Cover 1:1: `marketing/portals/icon-1x1-1024.png`
- Cover 2:3 (portrait): `marketing/portals/cover-2x3-1000x1500.png`
- Screenshots: the four `shot-*.png`, and `marketing/gameplay.mp4` as the video if they take one
- Category: Casual or Arcade. Tags from the list above.
- Their checklist, already met: loads in under a few seconds (one 280 KB file), no external links, works in an iframe at any size, keyboard and touch, sound muted during ads, the SDK's gameplay start and stop are called, a rewarded ad is offered.

## Poki

Apply at Poki for Developers with the itch.io link as the playable demo, then they send a build request. Upload `dist/killi-and-milli-poki.zip`. Fields they ask for:
- Thumbnail 1:1: `marketing/portals/icon-1x1-628.png` (and the 1024 if they want larger)
- Cover 16:9: `marketing/portals/cover-16x9-1920x1080.png`
- Screenshots: the four `shot-*.png`
- Poki's guidelines, already met: no links out of the game, no login, nothing loaded from other domains, pauses on ad and resumes after, plays on mobile in landscape, saves in localStorage only.
- Poki inspects play time and retention in a test run on their site before listing; the single-player mobile experience is what they weigh most, so the touch layout should be checked on a real phone before sending the build.

## Before either

1. Run `npm run test:gameplay` locally.
2. Open the portal build locally with the SDK loaded (`npx serve dist/crazygames` or `dist/poki`) and confirm in the console that the SDK initialised and that play, pause and the continue option do not throw. The CrazyGames SDK v3 logs its calls when the page is opened with `?useLocalSdk=true` on their QA tool; the Poki SDK has a debug console in the Poki inspector.
3. Check the game on a phone in landscape, since that is most of the portals' traffic.
