/**
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { JSONObject, JSONValue } from '@blue/core';

/**
 * Assigns a dotted key into a nested object (`'server.port', '9000'` →
 * `{ server: { port: '9000' } }`), matching keypath lookup semantics.
 */
const setNested = (target: JSONObject, key: string, value: JSONValue): void => {
    const segments = key.split('.');
    let cursor: JSONObject = target;
    for (let i = 0; i < segments.length - 1; i++) {
        const segment = segments[i];
        const existing = cursor[segment];
        if (existing === null || typeof existing !== 'object' || Array.isArray(existing)) {
            cursor[segment] = {};
        }
        cursor = cursor[segment] as JSONObject;
    }
    cursor[segments[segments.length - 1]] = value;
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
 * Repeated keys: last one wins. Non-`--` positionals are ignored (Spring's
 * `CommandLinePropertySource` behavior — they never become properties; Node's
 * `process.argv` already exposes them natively).
 *
 * @param args - The argument list (typically `process.argv.slice(2)`).
 * @returns The parsed property map.
 *
 * @example
 * ```ts
 * parseCommandLineArgs(['--server.port=9000', '--debug', '--name', 'blue', 'positional'])
 * // { 'server.port': '9000', debug: true, name: 'blue' }
 * ```
 */
export function parseCommandLineArgs(args: string[]): JSONObject {
    const parsed: JSONObject = {};
    let positionals = false;
    for (let index = 0; index < args.length; index++) {
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
