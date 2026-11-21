# Leonida Legend — GTA VI trophy guide & platinum tracker

[![Build](https://github.com/cikayy/makefun-gta6-trophy-guide/actions/workflows/build.yml/badge.svg)](https://github.com/cikayy/makefun-gta6-trophy-guide/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/cikayy/makefun-gta6-trophy-guide/blob/master/LICENSE)

**Leonida Legend** is an offline, static web app that guides you through all
55 official PlayStation 5 trophies for Grand Theft Auto VI — from the first
chapter trophy to the platinum, *Vice Got a Price!* Every trophy carries a
guide written in our own words, the checklist remembers your progress in the
browser, and a six-stage platinum roadmap orders the whole hunt so nothing
is left to chance.

## Features

- **All 55 official trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze —
  with their official names and descriptions.
- **A guide for every trophy**, written in our own words: what to do, in
  what order, and what to keep a save for.
- **Checklist with localStorage persistence** — tick trophies off and your
  progress (plus a progress bar) survives reloads.
- **Search and filters** — by text, kind (story, activities, world,
  collectibles, money, platinum), grade, and status (earned / not earned /
  watch-outs).
- **Spoiler shield** — story trophy descriptions stay hidden until you earn
  the trophy (or switch the setting off).
- **Watch-out flags** — trophies whose official descriptions suggest a
  one-off moment or choice are badged, with a keep-a-save caution in their
  guides.
- **Six-stage platinum roadmap** — story first, then strangers, activities,
  collections, money, and the 100% finish.
- **Export / import / reset** — back your checklist up as JSON and restore
  it on another device.
- **Fully offline** — no build step, no external requests; the only links
  anywhere are the two source homepages cited in each guide dialog.

## Data & sources

- Trophy names, grades and descriptions are the **official PS5 trophy set**
  for Grand Theft Auto VI, reproduced exactly.
- Every guide is **written in our own words** from those descriptions. The
  only tracked count used anywhere is the **42 Shooting Range challenges**
  for *The Shootist*, as tracked by
  [Exophase](https://www.exophase.com/) and
  [PSNProfiles](https://psnprofiles.com/).
- **Watch-outs are cautions, not confirmed missables.** They are read from
  the descriptions' own wording — a unique animal, a choice, a single
  partner moment — and are flagged so you keep a save, never stated as
  proven one-chance trophies. A few official descriptions are deliberately
  cryptic; their guides say so honestly instead of inventing specifics.

## How to run

Serve the `app/` folder with the bundled server (Node 22+):

```sh
node serve.ts --port 8902
# then open http://127.0.0.1:8902/
```

Any static file server works just as well — the app is plain HTML, CSS and
JavaScript plus `app/data/trophies.json`.

To build the submission dossier:

```sh
node main.ts
# writes out/dossier.json
```

Deep links and screenshots use URL parameters: `?view=roadmap`,
`?kind=story`, `?open=17`, `?focus=17`, `?spoiler=off`, `?earned=3,10,22`,
`?q=heist`.

## Screenshots

| File | What it shows |
| --- | --- |
| `screenshots/1-cover.jpg` | The guide's first screen — progress, search and filters over the opening trophies |
| `screenshots/2-roadmap.jpg` | The six-stage platinum roadmap |
| `screenshots/3-guide.jpg` | A per-trophy guide in the app's own words (The Shootist) |
| `screenshots/4-missable-spoiler.jpg` | Story trophies hidden by the spoiler setting, with filters and watch-out badges |

## Disclaimer

Unofficial fan project. Grand Theft Auto and GTA are trademarks of
Rockstar Games / Take-Two Interactive. This project is not affiliated with
or endorsed by them.

## License

MIT — see [LICENSE](LICENSE).
