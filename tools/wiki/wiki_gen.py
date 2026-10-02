import json, base64, io, html
from collections import Counter, OrderedDict
from PIL import Image

import os
HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, 'img') + '/'
LV = json.load(open(os.path.join(HERE, 'levels.json')))

def uri(path, w=None, q=80):
    im = Image.open(path).convert('RGB')
    if w and im.size[0] > w:
        im = im.resize((w, round(im.size[1] * w / im.size[0])), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
def img(name, alt, w=None, cls=''):
    return f'<img src="{uri(IMG + name + ".png", w)}" alt="{html.escape(alt)}" class="{cls}" loading="lazy">'
def bimg(path, alt, w=480, cls=''):
    return f'<img src="{uri(path, w)}" alt="{html.escape(alt)}" class="{cls}" loading="lazy">'

ENEMY = OrderedDict([
  ('C', dict(name='Crab', plural='crabs', img='crab', id='crab', speed='2.7',
     text='Walks in straight lines and turns when it bumps into rock, coral or a snack, with the occasional random change of direction. The easiest creature to wall off.')),
  ('J', dict(name='Jellyfish', plural='jellyfish', img='jellyfish', id='jellyfish', speed='1.5',
     text='Drifts slowly and randomly, and floats straight over coral, so walls do not stop it. Drawn above everything else on the board.')),
  ('E', dict(name='Eel', plural='eels', img='eel', id='eel', speed='3.0',
     text='Hunts the nearest pufferfish with pathfinding, but cannot pass through coral. Sealing yourself in, or hiding in kelp, makes it wander instead.')),
  ('S', dict(name='Swordfish', plural='swordfish', img='swordfish', id='swordfish', speed='2.0 (8.5 charging)',
     text='Wanders until it spots a pufferfish along an open row or column within 8 tiles. Its eye turns red, it winds up for about half a second, then charges at high speed until it hits something and is dazed.')),
  ('O', dict(name='Octopus', plural='octopuses', img='octopus', id='octopus', speed='2.3',
     text='Hunts you and treats coral as a speed bump: when a block is in its way it chews through it in under a second.')),
  ('M', dict(name='Mantis shrimp', plural='mantis shrimp', img='mantis', id='mantis-shrimp', speed='2.4',
     text='Hunts you through coral. When it reaches a wall it winds up and punches out the entire line of coral in that direction at once.')),
  ('A', dict(name='Manta ray', plural='manta rays', img='manta', id='manta-ray', speed='4.2',
     text='Glides fast in straight lines and sails right over coral. It only turns when it reaches rock or the edge of the reef.')),
  ('Y', dict(name='Stingray', plural='stingrays', img='stingray', id='stingray', speed='2.6',
     text='Hides buried in the sand with only its eyes showing. When a pufferfish comes within about two tiles it bursts out (harmless for about half a second), hunts for five seconds, then burrows again.')),
  ('F', dict(name='Lionfish', plural='lionfish', img='lionfish', id='lionfish', speed='1.2',
     text='Slow, but every few seconds it trembles, then fans out its spines for just over a second. While flared it is dangerous out to about a tile and a quarter, shown by a dashed red ring.')),
])
SNACK = OrderedDict([
  ('krill', dict(name='Krill', plural='krill', img='snack_krill', text='Stationary.')),
  ('pearl', dict(name='Pearl', plural='pearls', img='snack_pearl', text='Stationary.')),
  ('grape', dict(name='Sea grapes', plural='sea grapes', img='snack_grape', text='Stationary.')),
  ('star', dict(name='Starfish', plural='starfish', img='snack_star', text='Stationary, and slowly spins.')),
  ('shrimp', dict(name='Shrimp', plural='shrimp', img='snack_shrimp', text='Swims away from the nearest pufferfish once you are within five tiles. Corner it or trap it in coral.')),
  ('moon', dict(name='Moon pearl', plural='moon pearls', img='snack_moon', text='Flickers, then blinks to a random open spot every few seconds, unless it is trapped in coral.')),
  ('clam', dict(name='Clam', plural='clams', img='snack_clam', text='Opens for about two seconds, then closes for about one and a half. The pearl can only be collected while it is open.')),
])
TERRAIN = [
  ('#', 'Rock', 'tile_rock', 'rock', 'Solid for everyone. Coral lines and charges stop at it.'),
  ('c', 'Coral', 'tile_coral', 'coral', 'Grown and broken by the pufferfish. Blocks most creatures, but jellyfish and manta rays pass over it, octopuses chew through it, and mantis shrimp punch it out. A snack inside coral is visible but cannot be collected until the coral is broken.'),
  ('h', 'Hot vent', 'tile_vent', 'hot-vent', 'Safe to swim over, but coral cannot grow on it: a wall stops short at the vent with a burst of steam.'),
  ('UDLR', 'Current', 'tile_current', 'current', 'Carries anything standing on it, pufferfish and creatures alike, one tile at a time in the direction of the arrows, and bends a coral line as it grows or breaks, so one press can wrap a wall around a corner. Holding a direction swims against it.'),
  ('x', 'Sea urchin', 'tile_urchin', 'urchin', 'Catches any pufferfish that swims onto it. Growing coral over it smothers it; once the coral is broken it takes three seconds to re-arm, shown by a ring.'),
  ('k', 'Kelp', 'tile_kelp', 'kelp', 'Hides you: a pufferfish fades while it is in kelp, and hunters such as eels, stingrays and swordfish lose track of it unless they are on the very next tile. Any creature that walks into the kelp can still catch you.'),
]

def count_map(L):
    m = ''.join(L['map'])
    return Counter(m)
def plural(n, one, many):
    return f'{n} {one if n == 1 else many}'
def andlist(items):
    items = [i for i in items if i]
    if not items: return ''
    if len(items) == 1: return items[0]
    return ', '.join(items[:-1]) + ' and ' + items[-1]

# first appearances
first = {}
for i, L in enumerate(LV):
    c = count_map(L)
    for k in ENEMY:
        if c[k] and k not in first: first[k] = i
    for t in L['waves']:
        if t not in first: first[t] = i
    for ch in 'hxkN':
        if c[ch] and ch not in first: first[ch] = i
    if any(c[d] for d in 'UDLR') and 'UDLR' not in first: first['UDLR'] = i
def lvlink(i):
    return f'<a href="#level-{i+1}">Level {i+1}</a>'

# ---------- level sections ----------
level_html = []
for i, L in enumerate(LV):
    c = count_map(L)
    if L.get('boss'):
        boss = 'Bruiser the shark' if L['boss'] == 'shark' else 'the Kraken Queen'
        extra = [plural(c[k], ENEMY[k]['name'].lower(), ENEMY[k]['plural']) for k in ENEMY if c[k]]
        sent = f'This is a boss reef against {boss}. There are no snacks to collect; the level is won by defeating the boss.'
        if extra: sent += f' The arena also has {andlist(extra)}.'
    else:
        enemies = [plural(c[k], ENEMY[k]['name'].lower(), ENEMY[k]['plural']) for k in ENEMY if c[k]]
        waves = []
        for wi, t in enumerate(L['waves']):
            n = c[str(wi + 1)]
            waves.append(f"{n} {SNACK[t]['plural']}")
        sent = f'This level has {andlist(enemies)}, and the pufferfish need to collect {andlist(waves)}, in that order.'
    feats = []
    if c['N']: feats.append('Nori the seal')
    if c['h']: feats.append(plural(c['h'], 'hot vent', 'hot vents'))
    if c['x']: feats.append(plural(c['x'], 'sea urchin', 'sea urchins'))
    if c['k']: feats.append(f"kelp beds ({c['k']} tiles)")
    cur = sum(c[d] for d in 'UDLR')
    if cur: feats.append(plural(cur, 'current tile', 'current tiles'))
    if c['c']: feats.append(plural(c['c'], 'pre-grown coral block', 'pre-grown coral blocks'))
    intro = []
    for k, v in ENEMY.items():
        if first.get(k) == i: intro.append(f'<a href="#{v["id"]}">{v["plural"]}</a>')
    for k, v in SNACK.items():
        if first.get(k) == i and i > 0: intro.append(f'<a href="#snacks">{v["plural"]}</a>')
    for ch, nm, *_ in TERRAIN:
        if first.get(ch) == i and ch not in '#c': intro.append(f'<a href="#terrain">{nm.lower()}s</a>' if not nm.endswith('p') else f'<a href="#terrain">{nm.lower()}</a>')
    if first.get('N') == i: intro.append('<a href="#nori">Nori the seal</a>')
    if L.get('boss') == 'shark': intro.append('<a href="#bruiser">Bruiser</a>')
    if L.get('boss') == 'queen': intro.append('<a href="#kraken-queen">the Kraken Queen</a>')
    head = f'Level {i+1}: {html.escape(L["name"])}'
    level_html.append(f'''
<section class="level" id="level-{i+1}">
  <h3>{head}{' <span class="badge">Boss</span>' if L.get('boss') else ''}</h3>
  <figure class="thumb right">{img(f"level{i+1}", f"Level {i+1}, {L['name']}, at the start", 300)}<figcaption>{html.escape(L['name'])} at the start of play</figcaption></figure>
  <p>{sent}</p>
  {f'<p>Also on this reef: {andlist(feats)}.</p>' if feats else ''}
  {f'<p><b>Introduces:</b> {andlist(intro)}.</p>' if intro else ''}
  <p class="hint">Level hint: &#8220;{html.escape(L['hint'])}&#8221;</p>
</section>''')

# ---------- enemy table ----------
enemy_rows = ''.join(f'''
<tr id="{v['id']}"><td class="pic">{img(v['img'], v['name'], 140)}</td><th scope="row">{v['name']}</th><td>{v['text']}</td><td class="num">{v['speed']}</td><td>{lvlink(first[k])}</td></tr>''' for k, v in ENEMY.items())
snack_rows = ''.join(f'''
<tr id="snack-{k}"><td class="pic">{img(v['img'], v['name'], 110)}</td><th scope="row">{v['name']}</th><td>{v['text']}</td><td>{lvlink(first[k])}</td></tr>''' for k, v in SNACK.items())
terrain_rows = ''.join(f'''
<tr id="{tid}"><td class="pic">{img(im, nm, 110)}</td><th scope="row">{nm}</th><td>{tx}</td><td>{lvlink(first[ch]) if ch in first else lvlink(0)}</td></tr>''' for ch, nm, im, tid, tx in TERRAIN)

level_index = ''.join(f'<li><a href="#level-{i+1}">{html.escape(L["name"])}</a>{" (boss)" if L.get("boss") else ""}</li>' for i, L in enumerate(LV))

SECTIONS = [('overview', 'Overview'), ('controls', 'Controls'), ('characters', 'Characters'), ('mechanics', 'Mechanics'),
            ('enemies', 'Enemies'), ('bosses', 'Bosses'), ('snacks', 'Snacks'), ('terrain', 'Terrain and hazards'),
            ('levels', 'Levels'), ('story', 'Story'), ('look-and-sound', 'Look and sound'), ('development', 'Development'), ('trivia', 'Trivia')]
toc = ''.join(f'<li><a href="#{a}">{t}</a></li>' for a, t in SECTIONS)
side = ''.join(f'<li><a href="#{a}">{t}</a></li>' for a, t in SECTIONS)

B = os.path.join(HERE, '..', '..', 'tests', 'out') + '/'
page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Killi and Milli Wiki</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Grandstander:wght@700;800&display=swap" rel="stylesheet">
<style>
:root{{
  --bg:#eef5f4; --paper:#ffffff; --fg:#13262d; --muted:#4f6a72; --line:#c9dcda; --soft:#e3efed; --link:#0b6f87; --link-v:#5b4a9a;
  --head:#063845; --gold:#c98a06; --box:#f5faf9; --spoiler:#fff6dc;
  box-sizing:border-box; padding-top:env(safe-area-inset-top,0px); padding-bottom:env(safe-area-inset-bottom,0px); color-scheme:light;
}}
html{{scroll-padding-top:calc(env(safe-area-inset-top,0px) + 64px);scroll-behavior:smooth}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--bg:#071a20;--paper:#0c242c;--fg:#dcebee;--muted:#8fb0b8;--line:#1d3d47;--soft:#12313b;--link:#5fc8dc;--link-v:#b3a6ee;--head:#9fe0ea;--gold:#f6c445;--box:#0f2c35;--spoiler:#2a2410;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#071a20;--paper:#0c242c;--fg:#dcebee;--muted:#8fb0b8;--line:#1d3d47;--soft:#12313b;--link:#5fc8dc;--link-v:#b3a6ee;--head:#9fe0ea;--gold:#f6c445;--box:#0f2c35;--spoiler:#2a2410;color-scheme:dark}}
@media (prefers-reduced-motion: reduce){{html{{scroll-behavior:auto}}}}
*,*::before,*::after{{box-sizing:inherit}}
body{{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 "Atkinson Hyperlegible",system-ui,sans-serif}}
a{{color:var(--link)}} a:hover{{text-decoration-thickness:2px}}
img{{max-width:100%;height:auto;display:block;border-radius:8px}}
.topbar{{position:sticky;top:0;z-index:5;background:var(--head);color:#eaf8f8;display:flex;align-items:center;gap:16px;padding:10px 20px;padding-top:calc(10px + env(safe-area-inset-top,0px));margin-top:calc(-1 * env(safe-area-inset-top,0px))}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]) .topbar{{background:#04232c}}}}
.logo{{font-family:Grandstander,system-ui,sans-serif;font-weight:800;font-size:1.25rem;color:#f6c445;text-decoration:none;white-space:nowrap}}
.logo span{{color:#eaf8f8;font-weight:700}}
.play{{color:#f6c445;font-weight:700;text-decoration:none;white-space:nowrap}}
.search{{margin-left:auto;position:relative;width:min(340px,50vw)}}
.search input{{width:100%;font:inherit;padding:7px 12px;border-radius:999px;border:0;background:rgba(255,255,255,.14);color:#fff}}
.search input::placeholder{{color:rgba(255,255,255,.7)}}
.search input:focus{{outline:2px solid #f6c445;background:rgba(255,255,255,.22)}}
.results{{position:absolute;right:0;left:0;top:calc(100% + 6px);background:var(--paper);color:var(--fg);border:1px solid var(--line);border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.18);list-style:none;margin:0;padding:6px;max-height:60vh;overflow:auto}}
.results[hidden]{{display:none}}
.results a{{display:block;padding:6px 10px;border-radius:6px;text-decoration:none;color:var(--fg)}}
.results a:hover,.results a:focus{{background:var(--soft)}}
.results small{{color:var(--muted)}}
.layout{{display:grid;grid-template-columns:200px minmax(0,1fr);gap:24px;max-width:1240px;margin:0 auto;padding:20px}}
nav.side{{position:sticky;top:76px;align-self:start;font-size:.95rem}}
nav.side h2{{font-family:Grandstander,system-ui,sans-serif;font-size:.95rem;color:var(--muted);margin:0 0 6px;font-weight:700}}
nav.side ul{{list-style:none;margin:0 0 16px;padding:0}}
nav.side li a{{display:block;padding:3px 8px;border-radius:6px;text-decoration:none}}
nav.side li a:hover{{background:var(--soft)}}
main{{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:22px 30px 30px;min-width:0}}
h1{{font-family:Grandstander,system-ui,sans-serif;font-weight:800;font-size:2.3rem;line-height:1.1;margin:0;color:var(--fg)}}
.from{{color:var(--muted);font-size:.9rem;margin:4px 0 16px;border-bottom:1px solid var(--line);padding-bottom:10px}}
h2{{font-family:Grandstander,system-ui,sans-serif;font-weight:800;font-size:1.55rem;border-bottom:1px solid var(--line);padding-bottom:4px;margin:36px 0 12px;clear:both}}
h3{{font-family:Grandstander,system-ui,sans-serif;font-weight:700;font-size:1.2rem;margin:22px 0 8px}}
p{{margin:0 0 12px}}
.infobox{{float:right;width:300px;margin:0 0 16px 24px;background:var(--box);border:1px solid var(--line);border-radius:12px;padding:12px;font-size:.92rem}}
.infobox .ttl{{font-family:Grandstander,system-ui,sans-serif;font-weight:800;font-size:1.25rem;text-align:center;margin:0 0 8px}}
.infobox figure{{margin:0 0 6px}}
.infobox figcaption{{text-align:center;font-style:italic;color:var(--muted);font-size:.85rem;margin-top:4px}}
.infobox table{{width:100%;border-collapse:collapse}}
.infobox th{{text-align:left;vertical-align:top;padding:5px 8px 5px 0;width:42%;color:var(--muted);font-weight:700}}
.infobox td{{padding:5px 0;vertical-align:top}}
.infobox tr+tr th,.infobox tr+tr td{{border-top:1px solid var(--line)}}
.toc{{display:inline-block;background:var(--box);border:1px solid var(--line);border-radius:10px;padding:10px 18px 10px 14px;margin:4px 0 8px}}
.toc b{{display:block;font-family:Grandstander,system-ui,sans-serif;margin-bottom:4px}}
.toc ol{{margin:0;padding-left:22px;columns:2;column-gap:28px}}
.wikitable{{width:100%;border-collapse:collapse;margin:8px 0 16px;font-size:.95rem}}
.tablewrap{{overflow-x:auto}}
.wikitable th,.wikitable td{{border:1px solid var(--line);padding:8px 10px;vertical-align:middle;text-align:left}}
.wikitable thead th{{background:var(--soft);font-family:Grandstander,system-ui,sans-serif}}
.wikitable tbody th{{white-space:nowrap}}
.wikitable td.pic{{width:96px;padding:6px}}
.wikitable td.pic img{{width:84px}}
.wikitable td.num{{white-space:nowrap;font-variant-numeric:tabular-nums}}
.thumb{{margin:0 0 12px;max-width:300px}}
.thumb.right{{float:right;margin-left:20px;width:min(300px,45%)}}
.thumb figcaption{{font-size:.85rem;color:var(--muted);margin-top:4px}}
.level{{clear:both;border-top:1px dashed var(--line);padding-top:4px;overflow:hidden}}
.level:first-of-type{{border-top:0}}
.hint{{color:var(--muted);font-style:italic}}
.badge{{font-family:"Atkinson Hyperlegible",system-ui,sans-serif;font-size:.75rem;font-weight:700;background:#c2364a;color:#fff;border-radius:999px;padding:2px 9px;vertical-align:middle;margin-left:6px}}
.chars{{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px;margin:8px 0 12px}}
.char{{background:var(--box);border:1px solid var(--line);border-radius:12px;padding:12px}}
.char h3{{margin:8px 0 4px}}
.char p{{margin:0;font-size:.95rem}}
.pair{{display:grid;grid-template-columns:1fr 1fr;gap:8px}}
.gallery{{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:10px 0 16px}}
.gallery figure{{margin:0}}
.gallery figcaption{{font-size:.85rem;color:var(--muted);margin-top:4px}}
.boss{{overflow:hidden;margin-bottom:12px}}
details.spoiler{{background:var(--spoiler);border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin:10px 0 16px}}
details.spoiler summary{{cursor:pointer;font-weight:700}}
.navbox{{clear:both;margin-top:40px;border:1px solid var(--line);border-radius:12px;overflow:hidden;font-size:.92rem}}
.navbox .nt{{background:var(--head);color:#eaf8f8;text-align:center;font-family:Grandstander,system-ui,sans-serif;font-weight:800;padding:6px}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]) .navbox .nt{{background:#04232c}}}}
.navbox table{{width:100%;border-collapse:collapse}}
.navbox th{{background:var(--soft);text-align:right;padding:6px 10px;width:150px;white-space:nowrap;vertical-align:top}}
.navbox td{{padding:6px 10px}}
.navbox tr+tr th,.navbox tr+tr td{{border-top:1px solid var(--line)}}
.navbox td a+a::before{{content:"  ";white-space:pre}}
footer{{max-width:1240px;margin:0 auto;padding:0 20px 30px;color:var(--muted);font-size:.85rem}}
kbd{{font:inherit;font-size:.88em;background:var(--soft);border:1px solid var(--line);border-bottom-width:2px;border-radius:5px;padding:0 5px;white-space:nowrap}}
:focus-visible{{outline:3px solid var(--gold);outline-offset:2px}}
@media (max-width:900px){{
  .layout{{grid-template-columns:1fr;padding:12px}}
  nav.side{{position:static}} nav.side ul{{display:flex;flex-wrap:wrap;gap:4px}} nav.side li a{{background:var(--soft)}}
  main{{padding:16px}}
  .infobox{{float:none;width:auto;margin:0 0 16px}}
  .thumb.right{{float:none;margin:0 0 10px;width:100%;max-width:420px}}
  .toc ol{{columns:1}}
  .search{{width:46vw}}
}}
</style>
</head>
<body>
<header class="topbar">
  <a class="logo" href="#top">Killi and Milli <span>Wiki</span></a>
  <a class="play" href="../">Play the game</a>
  <div class="search" role="search">
    <label for="q" class="sr" style="position:absolute;left:-9999px">Search the wiki</label>
    <input id="q" type="search" placeholder="Search the wiki" autocomplete="off" aria-controls="results">
    <ul class="results" id="results" hidden></ul>
  </div>
</header>
<div class="layout" id="top">
<nav class="side" aria-label="Sections">
  <h2>On this page</h2>
  <ul>{side}</ul>
  <h2>Levels</h2>
  <ul>{''.join(f'<li><a href="#level-{i+1}">{i+1}. {html.escape(L["name"])}</a></li>' for i, L in enumerate(LV))}</ul>
</nav>
<main>
<h1>Killi and Milli</h1>
<div class="from">From the Killi and Milli Wiki, the encyclopedia of the warm shallows</div>

<aside class="infobox" aria-label="Game summary">
  <div class="ttl">Killi and Milli</div>
  <figure>{bimg(B + 'b_intro0.png', 'Killi and Milli in their home reef, from the intro story', 300)}<figcaption>Killi and Milli at home in the shallows</figcaption></figure>
  <table>
    <tr><th scope="row">Genre</th><td>Arcade maze, co-op</td></tr>
    <tr><th scope="row">Players</th><td>1 or 2 (local co-op)</td></tr>
    <tr><th scope="row">Levels</th><td>18 (16 reefs and 2 boss reefs)</td></tr>
    <tr><th scope="row">Controls</th><td>Keyboard, touch</td></tr>
    <tr><th scope="row">Platform</th><td>Web browser</td></tr>
    <tr><th scope="row">Created by</th><td>Devin Dyson</td></tr>
    <tr><th scope="row">Inspired by</th><td><i>Bad Ice-Cream</i> (Nitrome, 2010)</td></tr>
    <tr><th scope="row">Working title</th><td><i>Puffer Panic</i></td></tr>
  </table>
</aside>

<p><b>Killi and Milli</b> is an arcade maze game for one or two players about two pufferfish who must gather every snack on the reef before the Moonlight Feast, while grumpy sea creatures close in. It is a spiritual successor to Nitrome&#8217;s <i>Bad Ice-Cream</i>: instead of firing lines of ice, the pufferfish grow and break walls of coral, and instead of melting, they can puff up to protect themselves.</p>
<p>The game has 16 reefs that each introduce one new creature, snack or hazard, with Bruiser's Reef after the twelfth and the Kraken Queen's after the last, an illustrated story, and optional visual themes and sound packs.</p>

<nav class="toc" aria-label="Contents"><b>Contents</b><ol>{toc}</ol></nav>

<h2 id="overview">Overview</h2>
<p>Each reef is a 15 by 13 tile maze. Snacks appear in waves: when every snack in a wave has been eaten, the next wave appears in new spots. Clearing the last wave clears the reef. If a creature touches a pufferfish, that pufferfish is caught.</p>
<p>The main tool is coral. Facing an open tile, the pufferfish grows a line of coral blocks that runs until it hits something. Facing coral, the same button breaks the whole line. Walls are how you block, trap and steer the creatures, and also how you can accidentally trap snacks: a snack inside coral can be seen but not eaten until the coral is broken.</p>

<h2 id="controls">Controls</h2>
<div class="tablewrap"><table class="wikitable">
<thead><tr><th scope="col">Mode</th><th scope="col">Swim</th><th scope="col">Grow or break coral</th><th scope="col">Puff up</th></tr></thead>
<tbody>
<tr><th scope="row">1 player</th><td><kbd>Arrows</kbd> or <kbd>WASD</kbd></td><td><kbd>Space</kbd> (also <kbd>F</kbd>, <kbd>J</kbd>, <kbd>Z</kbd>, <kbd>/</kbd>)</td><td><kbd>Shift</kbd> (also <kbd>G</kbd>, <kbd>X</kbd>, <kbd>K</kbd>, <kbd>.</kbd>)</td></tr>
<tr><th scope="row">2 players, Killi</th><td><kbd>WASD</kbd></td><td><kbd>Space</kbd> or <kbd>F</kbd></td><td>left <kbd>Shift</kbd> or <kbd>G</kbd></td></tr>
<tr><th scope="row">2 players, Milli</th><td><kbd>Arrows</kbd></td><td><kbd>Option</kbd> or <kbd>Alt</kbd> (also <kbd>/</kbd>)</td><td>right <kbd>Shift</kbd> or <kbd>.</kbd></td></tr>
<tr><th scope="row">Touch</th><td>On-screen pad</td><td>Coral button</td><td>Puff button</td></tr>
</tbody></table></div>
<p><kbd>P</kbd> or <kbd>Esc</kbd> pauses, <kbd>R</kbd> restarts the reef, and there is a Pause button for touch players. Two-player mode needs a keyboard, since a phone shows controls for one fish.</p>

<h2 id="characters">Characters</h2>
<div class="chars">
  <div class="char" id="killi"><div class="pair">{img('killi', 'Killi', 140)}{img('killi_puffed', 'Killi puffed up', 140)}</div><h3>Killi</h3><p>A golden pufferfish with brown spots who puffs first and asks questions later. Player one.</p></div>
  <div class="char" id="milli"><div class="pair">{img('milli', 'Milli', 140)}{img('milli_shield', 'Milli inside a bubble shield', 140)}</div><h3>Milli</h3><p>A pale blue pufferfish with dark blue spots and a single eyelash, who always has a plan. Player two. Her sounds are pitched a little higher than Killi&#8217;s.</p></div>
  <div class="char" id="nori">{img('nori', 'Nori the seal', 220)}<h3>Nori</h3><p>A friendly harbor seal. She wanders the reef, swims over when the pufferfish are far away, bumps creatures out of the way, and hands out <a href="#bubble-shield">bubble shields</a>. First appears in {lvlink(first['N'])}.</p></div>
</div>

<h3 id="customization">Choosing and customizing your fish</h3>
<p>From the title screen, the fish screen lets a single player choose to play as Killi or Milli, and in two-player mode lets both players customize their fish (Killi is always player one and Milli player two). Each fish has a color, a pattern and an accessory, shown in a live preview that puffs up every few seconds. Choices are saved and carry into gameplay, the top bar, name tags and the story scenes, and each fish can be reset to its original look. Killi starts as Sunny with spots and Milli as Sky with spots.</p>
<figure class="thumb right">{bimg(B + 'f_gallery.png', 'Every color, pattern and accessory, drawn by the game', 300)}<figcaption>Every color, pattern and accessory</figcaption></figure>
<p>Four colors (Sunny, Sky, Coral and Mint), two patterns (spots and plain) and three accessories (none, a bow and a flower) are available from the start. The other 13 pieces are earned. Locked pieces appear on the fish screen with a lock and the way to earn them, along with a count of how many have been earned, and the clear screen announces anything newly unlocked with a button to try it on. A level counts as cleared in either one- or two-player mode.</p>
<div class="tablewrap"><table class="wikitable"><thead><tr><th scope="col">Piece</th><th scope="col">How to unlock</th></tr></thead><tbody><tr><th scope="row">Lavender color</th><td>Clear level 3</td></tr><tr><th scope="row">Stripes pattern</th><td>Clear level 5</td></tr><tr><th scope="row">Glasses</th><td>Clear level 6</td></tr><tr><th scope="row">Tangerine color</th><td>Clear level 8</td></tr><tr><th scope="row">Sailor cap</th><td>Clear level 10</td></tr><tr><th scope="row">Freckles pattern</th><td>Clear level 12</td></tr><tr><th scope="row">Starfish clip</th><td>Clear level 14</td></tr><tr><th scope="row">Midnight color</th><td>Clear level 16</td></tr><tr><th scope="row">Shark fin hat</th><td>Defeat Bruiser (level 17)</td></tr><tr><th scope="row">Royal crown</th><td>Beat the Kraken Queen (level 18)</td></tr><tr><th scope="row">Hearts pattern</th><td>Beat the Kraken Queen (level 18)</td></tr><tr><th scope="row">Pearl necklace</th><td>Eat 500 snacks in total, across all play</td></tr><tr><th scope="row">Gold color</th><td>Earn 3 stars on every level</td></tr></tbody></table></div>
<h2 id="mechanics">Mechanics</h2>
<h3 id="coral-walls">Coral walls</h3>
<p>Grown in a straight line from the tile in front of the pufferfish until it reaches rock, coral, a creature, a pufferfish or a hot vent. <a href="#terrain">Currents</a> bend the line as it grows. Breaking works the same way in reverse, clearing the whole connected line.</p>
<h3 id="puff">Puffing up</h3>
<p>Puffing turns a pufferfish into a spiky ball for 1.3 seconds. While puffed it cannot move but cannot be caught, and any creature nearby is stunned for 2.6 seconds. Puffing then needs 4.5 seconds to recharge, shown by the meter in the top bar. Bosses are the exception: see <a href="#bosses">Bosses</a>.</p>
<h3 id="bubble-shield">Bubble shield</h3>
<p>Swimming past <a href="#nori">Nori</a> wraps a pufferfish in a bubble that absorbs one hit, stuns the creature that hit it, and pops. Nori needs about seven seconds to make another, shown by a small bubble over her head when one is ready.</p>
<h3 id="co-op">Co-op and getting caught</h3>
<p>In two-player mode, a caught pufferfish is out until the next wave of snacks appears, then returns at its starting spot with a moment of invulnerability. In boss reefs, landing a hit on the boss brings a caught partner back. The reef only restarts if both pufferfish are caught at the same time.</p>
<h3 id="scoring">Score and time</h3>
<p>A scoreboard in the top bar shows the reef&#8217;s running time and score. Each snack is worth points, with harder snacks worth more, and a floating number shows each award. Eating snacks less than 1.2 seconds apart builds a streak worth 5 extra points per snack in a row, up to 50 extra, and the number turns gold while a streak is going. Each hit on a boss is worth 200 points, and the defeating hit adds 1,000 more. In two-player mode each pufferfish keeps its own score and the scoreboard shows the team total. Getting caught does not cost points.</p>
<div class="tablewrap"><table class="wikitable"><thead><tr><th scope="col">Snack</th><th scope="col">Points</th></tr></thead><tbody>
<tr><th scope="row">Krill</th><td class="num">10</td></tr><tr><th scope="row">Sea grapes</th><td class="num">15</td></tr><tr><th scope="row">Pearl</th><td class="num">20</td></tr><tr><th scope="row">Starfish</th><td class="num">25</td></tr><tr><th scope="row">Clam</th><td class="num">30</td></tr><tr><th scope="row">Shrimp</th><td class="num">40</td></tr><tr><th scope="row">Moon pearl</th><td class="num">50</td></tr>
</tbody></table></div>
<h3 id="stars">Stars and best times</h3>
<p>Clearing a reef awards stars based on how many times anyone was caught: none earns three stars, one or two earns two, and more earns one. The level select shows each reef&#8217;s best stars and best time, tracked separately for one and two players. The best score is saved alongside them. Clearing a reef unlocks the next.</p>

<h2 id="enemies">Enemies</h2>
<p>Speeds are in tiles per second; the pufferfish swim at 5.2. Creatures treat snacks as walls, a detail borrowed from the fruit in <i>Bad Ice-Cream</i>.</p>
<div class="tablewrap"><table class="wikitable">
<thead><tr><th scope="col">Image</th><th scope="col">Creature</th><th scope="col">Behavior</th><th scope="col">Speed</th><th scope="col">First appears</th></tr></thead>
<tbody>{enemy_rows}</tbody></table></div>

<h2 id="bosses">Bosses</h2>
<p>Both bosses follow the same idea: they cannot be stunned by a normal puff. You use coral to stop them, then puff right next to them while they are stuck to land a hit. The top bar shows the boss&#8217;s health. Once a boss is defeated, every other creature in the arena calms down.</p>
<div class="boss" id="bruiser">
  <h3>Bruiser the shark</h3>
  <figure class="thumb right">{bimg(B + 'b_bruiser_fight.png', 'Bruiser charging across his reef', 300)}<figcaption>Bruiser&#8217;s Reef</figcaption></figure>
  {img('bruiser', 'Bruiser the shark', 220, 'inline')}
  <p>The boss of {lvlink(12)}. Bruiser hunts the pufferfish and, when he spots one along a row or column, roars, winds up and charges. He can see through coral but cannot swim through it. Charging into rock dazes him briefly; charging into coral breaks the block and leaves him dizzy for about 2.6 seconds, which is the only time a puff beside him hurts him. He has 4 health and gets faster, with a shorter wind-up, as he takes damage.</p>
</div>
<div class="boss" id="kraken-queen">
  <h3>The Kraken Queen</h3>
  <figure class="thumb right">{bimg(B + 'b_queen_stuck.png', 'A tentacle stuck against a coral wall, ringed in gold', 300)}<figcaption>A tentacle stuck in coral</figcaption></figure>
  {img('queen', 'The Kraken Queen', 300, 'inline')}
  <p>The final boss, in {lvlink(17)}. She fills the top of the arena and sends tentacles across whole rows and columns, aimed at where a pufferfish is. Each lane flashes red for about 0.9 seconds first. A tentacle that runs into coral gets stuck just in front of it with a glowing gold ring, and a puff beside the tip hurts her. If nobody hits a stuck tentacle in time, she smashes the coral and pulls back. She has 6 health, and at 3 or less she attacks with two tentacles at once.</p>
</div>

<h2 id="snacks">Snacks</h2>
<div class="tablewrap"><table class="wikitable">
<thead><tr><th scope="col">Image</th><th scope="col">Snack</th><th scope="col">Behavior</th><th scope="col">First appears</th></tr></thead>
<tbody>{snack_rows}</tbody></table></div>

<h2 id="terrain">Terrain and hazards</h2>
<div class="tablewrap"><table class="wikitable">
<thead><tr><th scope="col">Image</th><th scope="col">Tile</th><th scope="col">Effect</th><th scope="col">First appears</th></tr></thead>
<tbody>{terrain_rows}</tbody></table></div>

<h2 id="levels">Levels</h2>
<p>There are 18 levels. Counts below are from the level data and are the same in one- and two-player mode.</p>
{''.join(level_html)}

<h2 id="story">Story</h2>
<p>An illustrated five-panel intro plays the first time the game is opened, and can be replayed from the Story button on the title screen.</p>
<p>In the warm shallows live two pufferfish, Killi and Milli, who are in charge of the snacks for the reef&#8217;s yearly Moonlight Feast. The night before the feast, something huge wakes in the Trench and every grumpy creature on the reef starts to move. To save the feast, the two set out to gather every snack, reef by reef, and soon make a friend in Nori the seal. Each boss gets its own story card the first time it is reached.</p>
<div class="gallery">
  <figure>{bimg(B + 'b_intro1.png', 'The Moonlight Feast snacks', 300)}<figcaption>The Moonlight Feast</figcaption></figure>
  <figure>{bimg(B + 'b_intro2.png', 'A giant eye opens in the deep', 300)}<figcaption>Something wakes in the Trench</figcaption></figure>
  <figure>{bimg(B + 'b_intro3.png', 'Killi grows a coral wall to stop a crab', 300)}<figcaption>The plan</figcaption></figure>
</div>
<details class="spoiler"><summary>The ending (contains a spoiler)</summary>
  <p>Defeating the Kraken Queen plays a five-panel ending. She was never trying to wreck the reef: she had heard about the Moonlight Feast and nobody had invited her. So Killi and Milli invite her, with a pearl for an invitation, and that year&#8217;s feast is the biggest the reef has ever seen: every creature comes, the Queen sits at the head of the table, and Bruiser brings dessert all the way up from the Trench without crashing into anything. They eat until the moon goes down.</p>
  <div class="gallery">
    <figure>{bimg(B + 'b_ending0.png', 'The Kraken Queen, calm, with the fish edging closer', 300)}<figcaption>The Queen explains</figcaption></figure>
    <figure>{bimg(B + 'b_ending1.png', 'Milli brings the Queen a pearl', 300)}<figcaption>The invitation</figcaption></figure>
    <figure>{bimg(B + 'b_ending2.png', 'Everyone at the feast under lanterns and a full moon', 300)}<figcaption>The biggest feast the reef has seen</figcaption></figure>
    <figure>{bimg(B + 'b_ending3.png', 'Bruiser arrives with a cake balanced on his nose', 300)}<figcaption>Bruiser brings dessert</figcaption></figure>
    <figure>{bimg(B + 'b_ending4.png', 'The feast as the moon sets', 300)}<figcaption>Until the moon went down</figcaption></figure>
  </div>
</details>

<h2 id="look-and-sound">Look and sound</h2>
<p>A Look and sound panel, reached from the title screen, opens a live demo reef where nothing can catch you. Choices are saved and apply to the whole game.</p>
<div class="tablewrap"><table class="wikitable">
<thead><tr><th scope="col">Setting</th><th scope="col">Options</th></tr></thead>
<tbody>
<tr><th scope="row">Look</th><td><b>Cut paper</b>, the default (layered paper shapes with soft drop shadows, like a handmade diorama), <b>Reef</b> (daylight teal water, pink brain coral, mossy stone), <b>Twilight</b> (deep night water with glowing coral and lichen), <b>Lagoon</b> (bright shallow water, sea glass blocks, sandstone)</td></tr>
<tr><th scope="row">Sound effects</th><td><b>Bubbly</b> (soft synth bloops with a watery echo), <b>Chiptune</b> (square-wave blips like an old handheld)</td></tr>
<tr><th scope="row">Music</th><td><b>Follows the reef</b> by default, which picks a loop by reef and gives each boss its own; or <b>Reef loop</b>, <b>Tide pool</b> or <b>Moon drift</b> everywhere</td></tr>
</tbody></table></div>

<h2 id="development">Development</h2>
<p>The game began as a pufferfish take on <i>Bad Ice-Cream</i> under the working title <i>Puffer Panic</i>, and was renamed <i>Killi and Milli</i> when two-player co-op was added. Later updates added the second half of the creature roster, Nori, the two boss reefs and the story.</p>
<p>Several ideas from the original&#8217;s enemies were adapted rather than copied: the swordfish&#8217;s line-of-sight charge echoes the log men, the mantis shrimp&#8217;s wall punch echoes the blue squid, the shrimp and moon pearl echo the fleeing pears and teleporting cherries, and currents, hot vents and urchins echo the arrow tiles, hot tiles and campfires.</p>

<h2 id="trivia">Trivia</h2>
<ul>
<li>Every sound effect in the four packs and all five music loops are synthesized in the browser as the game runs; the game contains no audio files.</li>
<li>Sounds are panned left or right by where they happen on the reef, and snack pickups climb a musical scale when eaten in quick succession.</li>
<li>The shark fin hat and royal crown are trophies from the two bosses, and the hearts pattern, unlocked by finishing the story, is a nod to Killi and Milli being in love.</li>
<li>Cut paper became the default look after four art directions were compared side by side: ink and flat color, watercolor storybook, cut-paper diorama and soft clay 3D.</li>
<li>A Retro pixel look, a Wooden sound pack and an upbeat chiptune track called Arcade tide were made for the Look and sound panel, then cut.</li>
<li>Nori is the only character, other than the pufferfish, who appears in both boss reefs.</li>
<li>The Kraken Queen is the only creature whose body is part of the arena itself.</li>
</ul>

<div class="navbox" role="navigation" aria-label="Killi and Milli topics">
  <div class="nt">Killi and Milli</div>
  <table>
    <tr><th scope="row">Characters</th><td><a href="#killi">Killi</a><a href="#milli">Milli</a><a href="#nori">Nori</a><a href="#customization">Customization</a></td></tr>
    <tr><th scope="row">Enemies</th><td>{''.join(f'<a href="#{v["id"]}">{v["name"]}</a>' for v in ENEMY.values())}</td></tr>
    <tr><th scope="row">Bosses</th><td><a href="#bruiser">Bruiser</a><a href="#kraken-queen">Kraken Queen</a></td></tr>
    <tr><th scope="row">Snacks</th><td>{''.join(f'<a href="#snack-{k}">{v["name"]}</a>' for k, v in SNACK.items())}</td></tr>
    <tr><th scope="row">Terrain</th><td>{''.join(f'<a href="#{tid}">{nm}</a>' for _, nm, _, tid, _ in TERRAIN)}</td></tr>
    <tr><th scope="row">Mechanics</th><td><a href="#coral-walls">Coral walls</a><a href="#puff">Puffing up</a><a href="#bubble-shield">Bubble shield</a><a href="#co-op">Co-op</a><a href="#scoring">Score and time</a><a href="#stars">Stars</a></td></tr>
  </table>
</div>
</main>
</div>
<footer>This page describes Killi and Milli as of October 2026. Images are taken from the game in its default Cut paper look.</footer>
<script>
(() => {{
  const q = document.getElementById('q'), list = document.getElementById('results');
  const entries = [...document.querySelectorAll('main h2[id], main h3, main tr[id], main section.level, main .char[id], main .boss[id]')].map(el => {{
    const id = el.id || (el.closest('[id]') || {{}}).id;
    const title = (el.querySelector && el.querySelector('h3, th') ? el.querySelector('h3, th').textContent : el.textContent).trim();
    const section = (() => {{ let n = el; while (n && n.previousElementSibling !== undefined) {{ n = n.previousElementSibling || n.parentElement; if (n && n.tagName === 'H2') return n.textContent; if (n && n.tagName === 'MAIN') return ''; }} return ''; }})();
    return id ? {{id, title, text: el.textContent.toLowerCase(), section}} : null;
  }}).filter(Boolean);
  const seen = new Set(), uniq = entries.filter(e => !seen.has(e.id) && seen.add(e.id));
  function render() {{
    const v = q.value.trim().toLowerCase();
    if (!v) {{ list.hidden = true; list.innerHTML = ''; return; }}
    const hits = uniq.map(e => ({{e, score: e.title.toLowerCase().includes(v) ? 2 : e.text.includes(v) ? 1 : 0}})).filter(h => h.score).sort((a, b) => b.score - a.score).slice(0, 8);
    list.innerHTML = hits.length ? hits.map(h => `<li><a href="#${{h.e.id}}">${{h.e.title.replace(/</g, '&lt;')}}${{h.e.section && h.e.section !== h.e.title ? ` <small>in ${{h.e.section}}</small>` : ''}}</a></li>`).join('') : '<li><small style="padding:6px 10px;display:block">No matches. Try a creature, snack or level name.</small></li>';
    list.hidden = false;
  }}
  q.addEventListener('input', render);
  q.addEventListener('keydown', e => {{
    if (e.key === 'Enter') {{ const a = list.querySelector('a'); if (a) {{ location.hash = a.getAttribute('href'); list.hidden = true; q.blur(); }} }}
    if (e.key === 'Escape') {{ q.value = ''; render(); }}
    if (e.key === 'ArrowDown') {{ const a = list.querySelector('a'); if (a) {{ e.preventDefault(); a.focus(); }} }}
  }});
  list.addEventListener('click', e => {{ if (e.target.closest('a')) {{ list.hidden = true; }} }});
  document.addEventListener('click', e => {{ if (!e.target.closest('.search')) list.hidden = true; }});
}})();
</script>
</body>
</html>
'''
page = page.replace('class="inline"', 'class="inline" style="max-width:220px;margin:0 0 10px"')
assert '\u2014' not in page
open(os.path.join(HERE, '..', '..', 'wiki', 'index.html'), 'w').write(page)
print('wiki bytes', len(page))
