/**
 * The `--json` contract helpers: one document on stdout, diagnostics stay on
 * stderr, and exit codes are unchanged.
 */

/** The shared `--json` flag definition. */
export const jsonFlag = {
    kind: 'boolean',
    brief: 'Emit one JSON document on stdout.',
    optional: true,
} as const;

/**
 * Writes one JSON document, newline-terminated.
 *
 * @param value - The command's result.
 */
export function writeJson(value: unknown): void {
    process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}
