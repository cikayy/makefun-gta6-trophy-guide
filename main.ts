// Leonida Legend — entrypoint.
//
// This script is the build step for the make.fun entry. It first sanity-
// checks the two things a judge will look at hardest — the trophy data and
// the screenshots — and only then hands the folder to the dossier builder
// from the vendor module. If the data is short a trophy or a screenshot is
// overweight, we want to find out here, not after submission.

import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Where the finished dossier lands. The kit sets MAKEFUN_OUTPUT_DIR when it
// wants the output somewhere specific; locally we just use ./out.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? 'out';
const root = process.cwd();

// The grades the official PS5 set uses. Anything outside this list in the
// data file is a typo, and typos in trophy data are exactly what this
// validation pass exists to catch.
const GRADES = new Set(['platinum', 'gold', 'silver', 'bronze']);
const SCREENSHOT_LIMIT = 262144; // 256 KiB, the per-image cap from the rules

interface Trophy {
  id: number;
  name: string;
  description: string;
  grade: string;
  kind: string;
  guide: string;
}

async function loadTrophies(): Promise<Trophy[]> {
  const raw = await readFile(path.join(root, 'app', 'data', 'trophies.json'), 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('trophies.json must be a JSON array');
  }
  const trophies = parsed as Trophy[];

  // The official set has exactly 55 trophies. A different length means the
  // data drifted from the source list it was transcribed from.
  if (trophies.length !== 55) {
    throw new Error(`expected 55 trophies, found ${trophies.length}`);
  }

  const names = new Set<string>();
  for (const t of trophies) {
    if (names.has(t.name)) {
      throw new Error(`duplicate trophy name: ${t.name}`);
    }
    names.add(t.name);
    if (!GRADES.has(t.grade)) {
      throw new Error(`trophy ${t.id} has unknown grade "${t.grade}"`);
    }
    if (typeof t.guide !== 'string' || t.guide.length === 0) {
      throw new Error(`trophy ${t.id} (${t.name}) is missing its guide`);
    }
  }
  return trophies;
}

async function checkScreenshots(): Promise<string[]> {
  const dir = path.join(root, 'screenshots');
  const files = (await readdir(dir)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
  if (files.length !== 4) {
    throw new Error(`expected exactly 4 screenshots, found ${files.length}`);
  }
  for (const f of files) {
    const info = await stat(path.join(dir, f));
    if (info.size > SCREENSHOT_LIMIT) {
      throw new Error(`screenshot ${f} is ${info.size} bytes, over the ${SCREENSHOT_LIMIT} cap`);
    }
  }
  return files;
}

const trophies = await loadTrophies();
const shots = await checkScreenshots();

// A one-line inventory so the build log shows what went into the dossier.
const perGrade = new Map<string, number>();
for (const t of trophies) perGrade.set(t.grade, (perGrade.get(t.grade) ?? 0) + 1);
const inventory = [...perGrade.entries()].map(([g, n]) => `${n} ${g}`).join(', ');
console.log(`Leonida Legend: ${trophies.length} trophies (${inventory}); screenshots: ${shots.join(', ')}`);

// The builder takes the project root (the folder holding app/ and
// screenshots/) plus a flat config, and returns the dossier as bytes; writing
// those bytes to the output directory is this script's job.
const dossierBytes: Uint8Array = await buildDossier(root, {
  title: 'Leonida Legend',
  tagline:
    'The complete GTA VI trophy guide and platinum tracker: all 55 official PS5 trophies with a checklist that saves in your browser, a six-stage platinum roadmap, missable watch-outs and a guide for every trophy.',
  text_max_bytes: 1500 * 1024,
  screenshot_max_bytes: 262144,
  screenshots_max: 10,
});

await mkdir(outDir, { recursive: true });
const dossierPath = path.join(root, outDir, 'dossier.json');
await writeFile(dossierPath, dossierBytes);

// Report the dossier size so an overweight bundle is obvious in the log.
console.log(`dossier written: ${dossierPath} (${dossierBytes.length} bytes)`);
