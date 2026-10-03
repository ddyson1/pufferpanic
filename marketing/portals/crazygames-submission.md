# Killi and Milli: CrazyGames submission

Everything in this folder, in the order the developer portal asks for it.

## Game build
- File: `killi-and-milli-crazygames.zip`. HTML5, index.html at the root, one file plus icons, about 210 KB. No engine.
- The CrazyGames SDK v3 is loaded in the page and the game calls it: init on load, gameplay start and stop around play and pauses, a midgame ad at natural breaks (after a reef is cleared or lost), and a rewarded ad behind "Watch an ad to continue". Sound is muted while an ad plays.
- No external requests besides the SDK. No links out of the game. No login. Saves in localStorage.

## Basics
- Name: Killi and Milli
- Category: Casual (also fits Arcade)
- Tags: arcade, maze, co-op, 2 player, local multiplayer, puzzle, cute, ocean, fish, family, casual, 1 player
- Release: new game, not published on other portals. Also on itch.io at https://devindyson.itch.io/killi-and-milli
- Languages: English
- Players: 1 or 2 (local co-op on one keyboard). No online play.
- Devices: desktop and mobile. Mobile in landscape, single player with on-screen touch controls.
- Age: everyone. No blood, no text chat, no purchases, no user generated content.
- Developer: Devin Dyson

## Short description (one line)
Puffs first, asks questions later. A co-op reef maze for one or two players.

## Description
Two small pufferfish. One very grumpy reef.

Killi and Milli are in charge of the snacks for the reef's Moonlight Feast. The night before, something huge wakes up in the Trench, every crab, jellyfish and eel on the reef is in a mood, and the snacks have scattered into every corner.

Your only tool is coral. Grow a wall to shut a creature out, break it to get through, and puff up into a spiky ball when something gets too close. Clear every snack before the moon is up, then swim deeper.

Each of the 16 reefs adds one twist: currents that carry you, kelp to hide in, vents that erupt, snacks that run away, pearls that teleport, and nine kinds of creature with their own habits. Bruiser the shark guards the way down. The Kraken Queen waits at the bottom. Niko the seal swims by to help.

Bring a friend on the same keyboard: if one fish is caught, the other keeps going and brings them back with the next wave of snacks. Dress up your fish with outfits earned by playing, chase stars and best times on every reef, and follow an illustrated story to an ending worth reaching. A reef takes two or three minutes.

## Controls
- Swim: arrow keys or WASD
- Coral: Space grows a wall in front of you, or breaks the one you face
- Puff: Shift
- Pause: P or Esc. Restart: R
- Two players: Killi keeps WASD, Space and left Shift. Milli takes the arrows, Option or Alt, and right Shift.
- Mobile: touch controls appear on screen

## Images
- `covers/cover-16x9-1920x1080.png`: 16:9 cover
- `covers/cover-4x3-1600x1200.png`: 4:3 cover
- `covers/icon-1x1-1024.png` and `icon-1x1-512.png`: square cover
- `covers/cover-2x3-1000x1500.png`: portrait cover
- `screenshots/shot-1-the-shallows.png` to `shot-4-kraken-queen.png`: gameplay, 1440 x 1080
- `gameplay-video.mp4`: 49 second gameplay montage, 1440 x 1080, with music

## Notes for their QA
- The game scales itself to any frame and has its own fullscreen button in the corner of the board.
- Keyboard focus: clicking or tapping the board focuses it, so arrow keys never scroll the page.
- Nothing is selectable on touch, so long presses never start a text selection.
- The cover art was made with an image model from the game's own character sheet; everything in the game itself is hand drawn in code.
