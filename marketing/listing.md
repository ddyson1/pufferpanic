# Store listing copy

Use the same wording everywhere so the game is easy to recognize. Never mention Bad Ice-Cream or Nitrome in store copy or tags.

## Name
Killi and Milli

## Tagline (under 80 characters)
Puffs first, asks questions later. A co-op reef maze for one or two players.

## Short description (about 150 characters)
A co-op arcade maze game. Grow coral walls to trap crabs, eels and stingrays, puff up when they get close, and gather every snack before the Moonlight Feast.

## Long description
In the warm shallows, where the coral glows at dusk, live Killi and Milli, the two smallest and roundest pufferfish on the whole reef. Killi chases anything shiny. Milli makes sure he finds his way home.

Once a year the reef gathers for the Moonlight Feast, and this year the snacks are their job. Then, the night before, a rumble rolls up from the Trench. Jellyfish wake up cross. Eels stop pretending to be friendly. Every crab sets off in a straight line, and the snacks scatter into every corner of the reef.

So the two of them set out, reef by reef, to gather every last one before the moon is up. Bruiser the shark guards the way down. The Kraken Queen waits at the bottom. And a seal called Niko, who blows the best bubbles on the reef, has noticed two very small fish heading the wrong way.

**How it plays**
Each reef is a small maze. Swim around, pick up every snack, and do not get caught.
- Grow coral in front of you to build a wall. Creatures cannot get through it.
- Break the same coral to open the way again.
- Puff up when something gets close. For a moment nothing can touch you, and whatever bumps you is stunned.
- Snacks come in waves. Clear a wave and the next one appears somewhere new.

That is the whole game, and each of the 16 reefs adds one twist: currents that carry you, kelp to hide in, vents that erupt, snacks that run away, pearls that teleport, and nine kinds of creature with their own habits.

**Two players, one keyboard**
Bring a friend. If one fish is caught, the other keeps going and brings them back with the next wave of snacks. Plays just as well alone.

**Also in the box**
- Dress up Killi or Milli. Most colors, patterns and accessories are earned by playing.
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
- Embed: Embed in page, viewport 864 x 854, Mobile friendly on, Fullscreen button on, Automatically start on page load off, Enable scrollbars off. At that size the board is drawn at exactly its reference scale with the icon row under it and no empty band; the game scales itself to any other frame, and offers its own Fullscreen button too.
- Classification: Games. Genre: Action. Tags from the list above (itch allows ten, drop "short" and "casual" first).
- Pricing: No payments, or Donate with a suggested $0.
- Community: Comments. Visibility: Public once the cover and screenshots are uploaded.
- Cover image: `marketing/cover-630x500.png` (itch shows it at 315 x 250, so the title stays large). The key art was made with an image model from the game's own character sheet and cast cover, so tick the generative AI disclosure in the project's settings (itch asks for it, and some browse pages leave disclosed projects out). Screenshots: the ten in `marketing/screenshots/`, in the order they are numbered (the first six are reefs, then co-op, Bruiser, the fish card and the lab).
- Theme: background #0e5a68, link and button color #f6c445, text on a light card.

## Press kit
Screenshots are in `marketing/screenshots/` (1280 px wide): 01 to 06 come from `npm run assets`; 07 to 10 (co-op, Bruiser, the fish card, the lab) are browser captures of the side layout at 1280 x 720. The store cover is `marketing/cover-630x500.png` (itch.io size; `cover-1260x1000.png` is the 2x version), cut from the key art in `marketing/keyart.png`, a 2000 x 1500 cut paper reef scene with the title on it, generated with the character sheet in `marketing/reference/` and the cast cover as references. `npm run cover` renders the plain cast cover from the game into `marketing/cast-cover-*.png`. Icons are in `icons/`. The comic and style explorations can be exported from the design canvases.
