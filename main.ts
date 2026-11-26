// Nest Egg — Household Budget Planner (Node 22, standard library only).
//
// This program hands the entry in: it copies this repository's app/ (the
// static site) and screenshots/ into /output and writes /output/dossier.json,
// the summary the judge reads, using the vendored make.fun library.
// vendor/makefun-frontend.ts is copied from the kit unchanged — the scorer
// requires dossier.json to be byte for byte what its own copy writes.
//
// Run locally, outside the grader's container, with MAKEFUN_OUTPUT_DIR:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the rest refuse an entry the scorer would refuse — more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 16 MiB of app files (app/ counts beside /output's own 1000-entry
// cap, its screenshots/ and dossier.json).
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);

console.log(`Nest Egg entry written to ${outDir}`);
