# Store listing copy

Use the same wording everywhere so the game is easy to recognize. Never mention Bad Ice-Cream or Nitrome in store copy or tags.

## Name
Killi and Milli

## Tagline (under 80 characters)
Puffs first, asks questions later. A co-op reef maze for one or two players.

## Short description (about 150 characters)
A co-op arcade maze game. Grow coral walls to trap crabs, eels and stingrays, puff up when they get close, and gather every snack before the Moonlight Feast.

## Long description
Killi and Milli are two pufferfish in charge of the snacks for the reef's Moonlight Feast. The night before, something huge wakes up in the Trench and every grumpy creature on the reef starts to move.

Your one tool is coral. Grow a wall to block the way, break it to get through, and puff up into a spiky ball when a creature gets too close. Swim through 16 reefs that each introduce something new. Bruiser the shark blocks the way halfway down, and the Kraken Queen waits at the bottom. Nori the seal swims by to help.

- Play alone or with a friend on one keyboard. A caught fish comes back with the next wave of snacks.
- Nine creatures with their own tricks: crabs walk in lines, jellyfish float over walls, eels hunt you, swordfish charge, stingrays burst out of the sand.
- Currents that carry you along, kelp to hide in, vents that erupt and stun whatever stands on them.
- Snacks that run away, pearls that teleport, clams that open and close.
- Scores, streaks, best times and stars on every level.
- Choose Killi or Milli and dress them up. Most outfits are earned by playing.
- An illustrated story with an ending worth reaching.
- Handmade cut-paper look with three more looks, four sound packs, and calm music that follows the reef you are on.
- Works on phones in landscape with touch controls. Fullscreen on desktop.
- Short sessions. A reef takes two or three minutes.

## Tags
arcade, maze, co-op, 2 player, local multiplayer, puzzle, cute, ocean, fish, family, casual, short

## Age rating
Everyone. No blood, no text chat, no purchases.

## Controls text for portals
Arrows or WASD to swim. Space grows or breaks coral. Shift puffs up. Two players: Killi keeps WASD, Space and left Shift, Milli takes the arrows, Option or Alt, and right Shift. Touch controls on phones. Press P or Esc to pause.

## itch.io page settings
- Kind of project: HTML. Upload the zip built with `npm run itch` (index.html, sw.js, manifest.webmanifest, icons/) and tick "This file will be played in the browser".
- Embed: Embed in page, viewport 700 x 760, Mobile friendly on, Fullscreen button on, Automatically start on page load off, Enable scrollbars off. The game sizes itself to the frame and offers its own Fullscreen button too.
- Classification: Games. Genre: Action. Tags from the list above (itch allows ten, drop "short" and "casual" first).
- Pricing: No payments, or Donate with a suggested $0.
- Community: Comments. Visibility: Public once the cover and screenshots are uploaded.
- Cover image: `marketing/cover-630x500.png` (itch shows it at 315 x 250, so the title stays large). Screenshots: the ten in `marketing/screenshots/`, in the order they are numbered (the first six are reefs, then co-op, Bruiser, the fish card and the lab).
- Theme: background #0e5a68, link and button color #f6c445, text on a light card.

## Press kit
Screenshots are in `marketing/screenshots/` (1280 px wide): 01 to 06 come from `npm run assets`; 07 to 10 (co-op, Bruiser, the fish card, the lab) are browser captures of the side layout at 1280 x 720. The store cover is `marketing/cover-630x500.png` (itch.io size; `cover-1260x1000.png` is the 2x version), regenerated with `npm run cover`. Icons are in `icons/`. The comic and style explorations can be exported from the design canvases.
