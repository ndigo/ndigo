/**
 * Command-line argument parsing for the application context.
 */
import { JSONObject, JSONValue, KeypathConverter } from '@ndigo/core';

/**
 * Assigns a dotted or bracketed key into a nested object
 * (`'server.port', '9000'` → `{ server: { port: '9000' } }`,
 * `'items[0]', 'x'` → `{ items: ['x'] }`), matching keypath lookup
 * semantics.
 */
const keypathConverter = new KeypathConverter();

const setNested = (target: JSONObject, key: string, value: JSONValue): void => {
    // Only attempt keypath parsing when the key actually contains nesting
    // markers; a plain name (including ones with dashes, like `foo-bar`) is
    // kept literal. An unparseable dotted/bracketed key is also kept literal.
    const tokens = key.includes('.') || key.includes('[') ? keypathConverter.convert(key) : null;
    if (!tokens) {
        target[key] = value;
        return;
    }
    if (tokens.length === 1) {
        target[tokens[0]] = value;
        return;
    }
    let cursor: JSONObject = target;
    const lastIndex = tokens.length - 1;
    for (let index = 0; index < lastIndex; index++) {
        const token = tokens[index];
        const nextToken = tokens[index + 1];
        const existing = (cursor as Record<PropertyKey, unknown>)[token];
        let child: unknown;
        if (typeof nextToken === 'number') {
            child = Array.isArray(existing) ? existing : [];
            if (!Array.isArray(existing)) {
                (cursor as Record<PropertyKey, unknown>)[token] = child;
            }
        } else if (existing === null || typeof existing !== 'object' || Array.isArray(existing)) {
            child = {};
            (cursor as Record<PropertyKey, unknown>)[token] = child;
        } else {
            child = existing;
        }
        cursor = child as JSONObject;
    }
    (cursor as Record<PropertyKey, unknown>)[tokens[tokens.length - 1]] = value;
};

/**
 * Parses command-line arguments into a property map for the `commandLine`
 * property source.
 *
 * Supported forms:
 * - `--key=value` — explicit equals form
 * - `--key value` — space-separated form (consumes the next arg as the value)
 * - `--flag` — bare flag, value `true` (minimist-style; a typed boolean read
 *   of a present flag must not invert into "disabled")
 * - `--` — terminator; everything after is treated as positional and ignored
 *
 * Repeated keys: last one wins. Non-`--` positionals are ignored (the reference framework's
 * `CommandLinePropertySource` behavior — they never become properties; Node's
 * `process.argv` already exposes them natively).
 *
 * @param args - The argument list (typically `process.argv.slice(2)`).
 * @returns The parsed property map.
 *
 * @example
 * ```ts
 * parseCommandLineArgs(['--server.port=9000', '--debug', '--name', 'ndigo', 'positional'])
 * // { 'server.port': '9000', debug: true, name: 'ndigo' }
 * ```
 */
export function parseCommandLineArgs(args: string[]): JSONObject {
    const parsed: JSONObject = {};
    let positionals = false;
    const length = args.length;
    for (let index = 0; index < length; index++) {
        const arg = args[index];
        if (positionals || !arg.startsWith('--')) continue; // positionals ignored
        if (arg === '--') {
            positionals = true;
            continue;
        }
        const body = arg.slice(2);
        const eq = body.indexOf('=');
        if (eq !== -1) {
            setNested(parsed, body.slice(0, eq), body.slice(eq + 1));
            continue;
        }
        // Space-separated form: consume the next arg when it is present and
        // is not itself an option (a bare `--flag --other` keeps flag=true).
        const next = args[index + 1];
        if (next !== undefined && !next.startsWith('--')) {
            setNested(parsed, body, next);
            index++;
        } else {
            setNested(parsed, body, true);
        }
    }
    return parsed;
}
