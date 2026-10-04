# Killi and Milli: Poki submission

Everything in this folder, in the order Poki for Developers asks for it. Poki reviews every game by hand, then runs it through a player fit test and a web fit test on their own site before a global release, so the build and the thumbnail are what matter most.

## Game build
- File: `killi-and-milli-poki.zip`. HTML5, index.html at the root, one file plus icons, about 210 KB (their limit for the first download is 8 MB). No engine.
- The Poki SDK v2 is loaded in the page and the game calls it: init and gameLoadingFinished on load, gameplayStart and gameplayStop around play, pauses and menus, commercialBreak at natural breaks (starting a reef, retrying), and rewardedBreak behind "Watch an ad to continue". Sound is muted while an ad plays and the game stays paused until it ends.
- No external requests besides the SDK, no links out of the game, no login, no share tags. Saves in localStorage only.
- Screen: the game scales itself to any frame. In Poki's 16:9 frame on desktop it shows the board with the icon buttons in its corner; on phones and tablets it switches to touch controls by itself.

## Thumbnail
- Static: `thumbnails/poki-thumb-1024.png` (and `poki-thumb-628.png`, their minimum size). Square, full bleed, no text: Killi and Milli in their default look with the clam between them, the crab, jellyfish and moray behind.
- Animated: `poki-animated-thumb-1080.mp4`. 1080 x 1080, 60 fps, 5 seconds, silent, loops. The jellyfish, moray and clam are drawn by the game itself, so they move the way they do in play.
- Poki's thumbnail guidance this follows: no text or title, main character in its default skin, one clear foreground, simple background.

## Game page
- Title: Killi and Milli
- Categories (up to four): Two Player, Puzzle, Arcade, Cute. If one is missing from their list, take Fish or Casual.
- Description (they rewrite it for search, so this is input): Grow coral walls, puff up into a spiky ball, and race to collect every snack on the reef before the creatures catch you. Play alone or with a friend on the same keyboard across 16 reefs and two boss fights, each with its own twist: currents, kelp to hide in, vents, snacks that run away and pearls that teleport. Earn outfits for your fish and stars for clean runs.
- What makes it stand out: a cut paper look, real local co-op where a caught fish comes back with the next wave of snacks, and an illustrated story with a boss at the bottom of the reef.
- Controls: arrow keys or WASD to swim, Space to grow or break coral, Shift to puff up, P or Esc to pause. Two players: Killi keeps WASD, Space and left Shift; Milli takes the arrows, Option or Alt, and right Shift. Touch controls on phones and tablets.
- Players: 1 or 2 on one device. No online play.
- Age: everyone. No blood, no chat, no purchases, no user content.
- Languages: English.
- Developer: Devin Dyson. Also on itch.io at https://devindyson.itch.io/killi-and-milli, which works as the playable link if they ask for one before the build.

## Also in this folder
- `covers/`: the 16:9, 4:3, 2:3 and square covers with the title, if they ask for wide art.
- `screenshots/`: four gameplay shots at 1440 x 1080.
- `gameplay-video.mp4`: the 49 second montage with music.

## Before uploading
1. Open the build locally with the SDK (`npx serve dist/poki`) and check in the console that the SDK starts and that play, pause and the continue option do not throw.
2. Play it on a phone in landscape and on a tablet, since mobile is most of Poki's traffic and they weigh the single player mobile game most.
3. Run `npm run test:gameplay`.
