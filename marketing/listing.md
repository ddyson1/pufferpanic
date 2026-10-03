# Store listing copy

Use the same wording everywhere so the game is easy to recognize. Never mention Bad Ice-Cream or Nitrome in store copy or tags.

## Name
Killi and Milli

## Tagline (under 80 characters)
Puffs first, asks questions later. A co-op reef maze for one or two players.

## Short description (about 150 characters)
A co-op arcade maze game. Grow coral walls to trap crabs, eels and stingrays, puff up when they get close, and gather every snack before the Moonlight Feast.

## Long description
Two small pufferfish. One very grumpy reef.

Killi and Milli are in charge of the snacks for the reef's Moonlight Feast. The night before, something huge wakes up in the Trench, every crab, jellyfish and eel on the reef is in a mood, and the snacks have scattered into every corner.

Your only tool is coral. Grow a wall to shut a creature out, break it to get through, and puff up into a spiky ball when something gets too close. Clear every snack before the moon is up, then swim deeper.

**What is waiting down there**
- 16 reefs, each with something new: currents that carry you along, kelp to hide in, vents that erupt, snacks that run away, pearls that teleport, clams that open and close.
- Two bosses. Bruiser the shark charges at anything that moves. The Kraken Queen fills the arena with tentacles.
- Nine creatures with their own habits. Crabs walk in lines, jellyfish float over walls, eels hunt you down, swordfish charge, stingrays burst out of the sand.
- Niko the seal, who bumps enemies aside and wraps you in a bubble shield.

**Play together**
One keyboard, two fish. A caught fish comes back with the next wave of snacks, and the reef only restarts if both of you are caught. Plays just as well alone.

**Make it yours**
- Choose Killi or Milli and dress them up. Most colors, patterns and accessories are earned by playing.
- A handmade cut paper look, with three more looks, four sound packs and five music loops, all made in the browser as you play.
- Scores, streaks, best times and stars on every reef. A reef takes two or three minutes.
- An illustrated story with an ending worth reaching.

**Controls**
- Swim: arrows or WASD. Coral: Space. Puff: Shift. P or Esc pauses, R restarts.
- Two players: Killi keeps WASD, Space and left Shift. Milli takes the arrows, Option or Alt, and right Shift.
- Phones: touch controls appear on screen, best in landscape. Fullscreen on desktop.

**Rating**
Everyone. No blood, no text chat, no ads and no purchases in this version. Progress saves in your browser.

## Tags
arcade, maze, co-op, 2 player, local multiplayer, puzzle, cute, ocean, fish, family, casual, short

## Age rating
Everyone. No blood, no text chat, no purchases.

## Controls text for portals
Arrows or WASD to swim. Space grows or breaks coral. Shift puffs up. Two players: Killi keeps WASD, Space and left Shift, Milli takes the arrows, Option or Alt, and right Shift. Touch controls on phones. Press P or Esc to pause.

## itch.io page settings
- Kind of project: HTML. Upload the zip built with `npm run itch` (index.html, sw.js, manifest.webmanifest, icons/) and tick "This file will be played in the browser".
- Embed: Embed in page, viewport 700 x 760, Mobile friendly on, Fullscreen button on, Automatically start on page load off, Enable scrollbars off. The game is one layout scaled as a whole to fit the frame, and offers its own Fullscreen button too.
- Classification: Games. Genre: Action. Tags from the list above (itch allows ten, drop "short" and "casual" first).
- Pricing: No payments, or Donate with a suggested $0.
- Community: Comments. Visibility: Public once the cover and screenshots are uploaded.
- Cover image: `marketing/cover-630x500.png` (itch shows it at 315 x 250, so the title stays large). The key art was made with an image model from the game's own character sheet and cast cover, so tick the generative AI disclosure in the project's settings (itch asks for it, and some browse pages leave disclosed projects out). Screenshots: the ten in `marketing/screenshots/`, in the order they are numbered (the first six are reefs, then co-op, Bruiser, the fish card and the lab).
- Theme: background #0e5a68, link and button color #f6c445, text on a light card.

## Press kit
Screenshots are in `marketing/screenshots/` (1280 px wide): 01 to 06 come from `npm run assets`; 07 to 10 (co-op, Bruiser, the fish card, the lab) are browser captures of the side layout at 1280 x 720. The store cover is `marketing/cover-630x500.png` (itch.io size; `cover-1260x1000.png` is the 2x version), cut from the key art in `marketing/keyart.png`, a 2000 x 1500 cut paper reef scene with the title on it, generated with the character sheet in `marketing/reference/` and the cast cover as references. `npm run cover` renders the plain cast cover from the game into `marketing/cast-cover-*.png`. Icons are in `icons/`. The comic and style explorations can be exported from the design canvases.
