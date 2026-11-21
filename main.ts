// Leonida Legend — entrypoint.
//
// Builds the submission dossier for the GTA VI trophy guide. The program
// run by the grader may start this file from any working directory and
// with the repository mounted read-only, so every path below is resolved
// from the bot directory (or this file's own location) and the output
// directory is resolved absolutely: nothing is ever read from, or written
// to, a location derived from the process working directory.

import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Where the repository lives. The grader names it through
// MAKEFUN_BOT_DIR; a plain local run falls back to the folder this
// entrypoint sits in, which is the repository root either way.
const root = process.env.MAKEFUN_BOT_DIR ?? path.dirname(fileURLToPath(import.meta.url));

// Where the dossier goes. path.resolve() returns its second argument
// unchanged when that argument is already absolute, so an absolute
// MAKEFUN_OUTPUT_DIR (the grader's /output) is honored as-is and the
// dossier can never land inside a read-only repository.
const outDir = path.resolve(root, process.env.MAKEFUN_OUTPUT_DIR ?? 'out');

// ---------------------------------------------------------------------------
// Pre-flight validation: fail loudly here rather than ship a broken dossier.
// ---------------------------------------------------------------------------

const VALID_GRADES = new Set(['platinum', 'gold', 'silver', 'bronze']);

const trophiesPath = path.join(root, 'app', 'data', 'trophies.json');
const trophies = JSON.parse(await readFile(trophiesPath, 'utf8'));

if (!Array.isArray(trophies) || trophies.length !== 55) {
  throw new Error(`trophies.json must hold exactly 55 trophies, found ${trophies?.length}`);
}

const seenNames = new Set<string>();
const gradeCounts = new Map<string, number>();
for (const trophy of trophies) {
  if (seenNames.has(trophy.name)) {
    throw new Error(`duplicate trophy name: ${trophy.name}`);
  }
  seenNames.add(trophy.name);
  if (!VALID_GRADES.has(trophy.grade)) {
    throw new Error(`trophy "${trophy.name}" has an unknown grade: ${trophy.grade}`);
  }
  if (typeof trophy.guide !== 'string' || trophy.guide.trim() === '') {
    throw new Error(`trophy "${trophy.name}" is missing its guide`);
  }
  gradeCounts.set(trophy.grade, (gradeCounts.get(trophy.grade) ?? 0) + 1);
}

const shotsDir = path.join(root, 'screenshots');
const shotNames = (await readdir(shotsDir))
  .filter((name) => /\.(jpe?g|png)$/i.test(name))
  .sort();
if (shotNames.length !== 4) {
  throw new Error(`screenshots/ must hold exactly 4 images, found ${shotNames.length}`);
}
for (const name of shotNames) {
  const { size } = await stat(path.join(shotsDir, name));
  if (size > 262_144) {
    throw new Error(`screenshot ${name} is ${size} bytes, over the 262144 byte cap`);
  }
}

const gradeSummary = [...gradeCounts.entries()]
  .map(([grade, count]) => `${count} ${grade}`)
  .join(', ');
console.log(
  `Leonida Legend: 55 trophies (${gradeSummary}); screenshots: ${shotNames.join(', ')}`,
);

// ---------------------------------------------------------------------------
// Build the dossier with the vendor frontend and write it to outDir only.
// ---------------------------------------------------------------------------

const dossierBytes = await buildDossier(root, {
  title: 'Leonida Legend',
  tagline:
    'The complete GTA VI trophy guide and platinum tracker: all 55 official PS5 trophies with a checklist that saves in your browser, a six-stage platinum roadmap, missable watch-outs and a guide for every trophy.',
  text_max_bytes: 1500 * 1024,
  screenshot_max_bytes: 262_144,
  screenshots_max: 10,
});

await mkdir(outDir, { recursive: true });
const dossierPath = path.join(outDir, 'dossier.json');
await writeFile(dossierPath, dossierBytes);
console.log(`Wrote ${dossierPath} (${dossierBytes.length} bytes)`);
