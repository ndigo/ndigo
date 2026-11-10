/**
 * The machine-output contract: one document on stdout, diagnostics on stderr,
 * and exit codes unchanged. `--json` is the canonical machine contract
 * (AD-97); `--toon` is an experimental sibling for the verbs whose payloads
 * measured ≥30% savings vs pretty JSON on ≥2 KB documents — `routes` clears
 * it (−59% vs pretty / −36% vs minified JSON on a real manifest), while
 * `ui list` did not (heterogeneous records: −21% vs pretty / ~0% vs minified,
 * scripts/toon-measure.mjs) and stays JSON-only (issue #349). Marked experimental while TOON is a Working Draft. Nothing here
 * changes human output, and both flags error when passed together.
 */
import { usageError } from '../helpers/app-scripts.js';

/**
 * Loader for the reference TOON encoder. NOT exported — an `export`d
 * function leaves the dynamic import inside a never-terminated statement for
 * the manifest scanner (`scripts/import-scanner.mjs`), silently missing the
 * specifier; the non-exported wrapper mirrors `@ndigo/test`'s
 * `loadWebAutoConfiguration` shape. DELIBERATE dynamic import: the CLI
 * binary starts tens of times per script run; a static import would pay the
 * SDK load on every invocation. A literal specifier keeps the module a
 * declared runtime dependency (check-manifests rule 1). No `@vite-ignore`
 * needed: the binary runs from compiled lib/ under node — no bundler in
 * this lane. Defined BEFORE the exported functions below: the scanner only
 * adopts a dynamic import from a statement it can recognize as new, and a
 * preceding `export` line leaves that state unset.
 */
async function loadToonEncoder(): Promise<(value: unknown) => string> {
    // The SDK's `encode` runs on any JSON-model input; the narrower package
    // contract keeps every writer commentary-free.
    return (await import('@toon-format/toon')).encode as (value: unknown) => string;
}

/** The shared `--json` flag definition. */
export const jsonFlag = {
    kind: 'boolean',
    brief: 'Emit one JSON document on stdout.',
    optional: true,
} as const;

/** The shared `--toon` flag definition — experimental; verbs measured against scripts/toon-measure.mjs. */
export const toonFlag = {
    kind: 'boolean',
    brief: 'Emit one TOON document on stdout. [experimental — TOON is a Working Draft]',
    optional: true,
} as const;

/** The output format a command selected. */
export type OutputFormat = 'json' | 'toon';

/**
 * Resolves the requested machine format from both flags.
 *
 * @param flags - The command's parsed flags.
 * @returns `'json'` or `'toon'` when a machine document was requested, or
 *   `undefined` when human output should render.
 * @throws A usage error when both flags are set — the contracts are
 *   exclusive, and silently picking one would make a scripted pipeline's
 *   output depend on argument order.
 */
export function pickFormat(flags: { json?: boolean; toon?: boolean }): OutputFormat | undefined {
    const json = flags.json === true;
    const toon = flags.toon === true;
    if (json && toon) {
        throw usageError('--json and --toon are mutually exclusive');
    }
    if (json) return 'json';
    if (toon) return 'toon';
    return undefined;
}

/**
 * Writes one JSON document, newline-terminated.
 *
 * @param value - The command's result.
 */
export function writeJson(value: unknown): void {
    process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

/**
 * Loader for the reference TOON encoder. NOT exported — an `export`d function
/**
 * Writes one TOON document, newline-terminated. The encoder loads lazily so
 * the CLI's startup path is untouched — `ndigo` never imports the SDK unless
 * a `--toon` document is actually emitted.
 *
 * @param value - The command's result.
 */
export async function writeToon(value: unknown): Promise<void> {
    const encode = await loadToonEncoder();
    process.stdout.write(`${encode(value)}\n`);
}
