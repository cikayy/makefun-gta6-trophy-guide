# Leonida Legend — GTA VI Trophy Guide & Platinum Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/cikayy/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/cikayy/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app that is a guide and tracker for all **55 official PlayStation 5 trophies of Grand Theft Auto VI**: the full official list with a saved checklist, a six-stage roadmap to the platinum, watch-out flags for the trophies the official descriptions suggest doing when you see them, and a guide to every trophy written for this entry, with its sources named beside it.

## Run it

```sh
node serve.ts
```

then open http://localhost:8080 (use `node serve.ts --port 8901` for another port). Any static file server with `app/` at its root works too. Opening `app/index.html` via `file://` is not recommended — browsers may block the fetch of `app/data/trophies.json`. The app itself works fully offline: every file it loads lives under `app/`, and it makes no network requests.

## Features

- All 55 trophies with their official name, description and grade (1 platinum, 2 gold, 6 silver, 46 bronze)
- Checklist saved in the browser (localStorage), with Export / Import of progress as a JSON file of earned trophy ids, and Reset
- Search, plus filters by kind (story, missable watch-outs, collectibles, activities, world, money), by grade, and by earned status
- Spoiler setting: with "Hide story spoilers" on, unearned story trophies show as hidden until earned
- Roadmap to the platinum in six stages, built from the official descriptions and their counts (250 stunts, 42 Shooting Range challenges, 100 WAiNK locations, $250,000 laundered, and more)
- 9 watch-out flags, phrased honestly as cautions derived from the descriptions' wording — the game is not out, so nothing is claimed as confirmed missable
- A guide to each trophy in our own words, citing its sources next to the guide

## Sources & credits

Trophy names, descriptions and grades are the official PlayStation 5 list as published by PlayStation and listed by Exophase and PSNProfiles, cross-checked between the two. Every number in the guides comes from the official descriptions themselves, except 42 Shooting Range challenges, the tracked count listed with the official list by Exophase and PSNProfiles. All guide text was written for this entry; no text is copied from any guide. General trophy-hunting advice (for example keeping a manual save before the final mission) is labelled as general practice where it appears. This is a fan-made tool: no Rockstar Games logos, artwork or game screenshots are used.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>

## License

MIT — see LICENSE.
