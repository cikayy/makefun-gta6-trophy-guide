# Leonida Legend — GTA VI trophy guide & platinum tracker

![Build](https://github.com/cikayy/makefun-gta6-trophy-guide/actions/workflows/build.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

**Leonida Legend** is a fully offline trophy guide and platinum tracker for
Grand Theft Auto VI. It covers all 55 official PS5 trophies with a per-trophy
guide written in our own words, a six-stage platinum roadmap, missable
watch-out flags, and a checklist that saves your progress in the browser —
no account, no network, no build step.

## Features

- **All 55 trophies** — the complete official PS5 set (platinum, gold, silver
  and bronze), each with its official description and an original guide.
- **Checklist that sticks** — tick trophies off as you earn them; progress is
  stored in `localStorage`, with export/import as JSON and a reset option.
- **Filters that help** — search, filter by kind (story, activities, world,
  collectibles, money, platinum), by grade, and by status, including a
  watch-outs-only view.
- **Spoiler protection** — story trophy descriptions stay hidden until you
  earn them (toggleable).
- **Six-stage platinum roadmap** — story first, then map cleanup, races and
  activities, money and property, the 100% push, and a hard-mode victory lap.
- **Missable watch-outs** — nine trophies whose official descriptions tie
  them to a single choice, a cash threshold, a difficulty setting or a
  one-shot run are flagged so you can plan saves around them.
- **Deep links for screenshots** — `?view=roadmap`, `?kind=story`,
  `?open=45`, `?focus=<id>`, `?spoiler=off`, `?earned=3,10,22`, `?q=<text>`.

## Data & sources

Trophy names, descriptions and grades are the official PS5 trophy set for
Grand Theft Auto VI. Every guide in `app/data/trophies.json` is written in
our own words from those descriptions. The only tracked count used anywhere
is the **42 Shooting Range challenges** (for *The Shootist*), as tracked by
[Exophase](https://www.exophase.com/) and [PSNProfiles](https://psnprofiles.com/).

The watch-out flags are **cautions read from the descriptions' own wording**
— a trophy whose text says "in one playthrough", "at one time" or "without
lowering the difficulty" deserves a spare save file. They are not confirmed
missables, and the guides phrase them that way.

## Run it

Serve the `app/` folder with any static server — for example, from the repo
root:

```sh
node serve.ts            # serves the app on a local port
```

or `python3 -m http.server` inside `app/`. Then open the page, and start
ticking off trophies.

The make.fun entrypoint validates the trophy data and screenshots, then
writes a submission dossier:

```sh
node main.ts             # writes out/dossier.json
```

## Screenshots

- `screenshots/1-cover.jpg` — the first screen: progress, search and filters
  over the opening trophies.
- `screenshots/2-roadmap.jpg` — the six-stage platinum roadmap.
- `screenshots/3-guide.jpg` — a per-trophy guide dialog (The Shootist).
- `screenshots/4-missable-spoiler.jpg` — story trophies hidden by the spoiler
  setting, watch-out badges visible.

## Note

Unofficial fan project. Grand Theft Auto and GTA are trademarks of Rockstar
Games / Take-Two Interactive. This project is not affiliated with or endorsed
by Rockstar Games or Take-Two Interactive.

## License

MIT — see [LICENSE](LICENSE).
