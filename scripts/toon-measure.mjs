#!/usr/bin/env node
/**
 * Measures TOON (spec v4.4) against JSON for real payloads — the evidence
 * behind the CLI `--toon` pilot (issue #349): keep only the verbs where TOON
 * clears ≥30% on ≥2 KB documents vs the pretty JSON the `--json` contract
 * emits today. Reports both comparisons separately, because the honest bars
 * differ: pretty JSON is what `--json` writes; minified JSON is what a
 * hypothetical wire client would carry.
 *
 * Usage:
 *   node scripts/toon-measure.mjs <document.json> ...
 *
 * Feed it the bytes a command actually emits (`ndigo ui list --json >
 * /tmp/list.json`), a nested array exported from any source, or any document
 * whose encoding is worth pricing.
 */
import { readFileSync } from 'node:fs';
import { decode, encode } from '@toon-format/toon';

const input = [];
let selectPath;
for (const arg of process.argv.slice(2)) {
    if (arg === '--select') {
        selectPath = process.argv[process.argv.indexOf('--select') + 1];
        break;
    }
    input.push(arg);
}
if (input.length === 0) {
    console.error('usage: node scripts/toon-measure.mjs <file.json> [...] [--select <path>]');
    process.exit(2);
}

const rows = [];
for (const file of input) {
    let value = JSON.parse(readFileSync(file, 'utf8'));
    if (selectPath) {
        let node = value;
        for (const key of selectPath.split('.')) {
            node = node?.[key];
        }
        value = node;
    }
    const pretty = JSON.stringify(value, null, 2);
    const minified = JSON.stringify(value);
    const toon = encode(value);
    // Round-trip guard: a measurement of a lossy document is meaningless.
    if (JSON.stringify(decode(toon)) !== JSON.stringify(value)) {
        console.error(`${file}: TOON round-trip failed — skipping`);
        continue;
    }
    rows.push({
        file: `${file}${selectPath ? `#${selectPath}` : ''}`,
        pretty,
        minified,
        toon,
    });
}

const pad = (cells) => cells.map((cell) => cell.padEnd(9)).join('  ');
console.log(pad(['fixture', 'pretty', 'minified', 'toon', 'vs-pretty', 'vs-min']));
for (const { file, pretty, minified, toon } of rows) {
    const vsPretty = ((toon.length / Math.max(pretty.length, 1) - 1) * 100).toFixed(0);
    const vsMin = ((toon.length / Math.max(minified.length, 1) - 1) * 100).toFixed(0);
    console.log(
        `${file}\n    ${pad([`${pretty.length}B`, `${minified.length}B`, `${toon.length}B`, `${vsPretty}%`, `${vsMin}%`])}`
    );
}
