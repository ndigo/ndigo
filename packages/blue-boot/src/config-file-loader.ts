/**
 * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
import { IllegalStateError, JSONObject } from '@blue/core';
import { getErrorMessage } from '@blue/util';
import type { ConfigurableEnvironment } from '@blue/context';
import type { ConfigFileReader } from '@blue/context';

/**
 * Exact version of the optional `@toon-format/toon` peer (AD-66 D-4) — keep
 * in sync with the `peerDependencies`/`devDependencies` pin in
 * `packages/blue-boot/package.json`; the install hint in
 * {@link loadToonDecoder} references it.
 */
const TOON_PEER_VERSION = '4.1.1';

/**
 * Runtime shape of the optional `@toon-format/toon` peer. Declared locally
 * instead of `import type`-ed so that building `@blue/boot` from source never
 * requires the optional peer to resolve (AD-66): the lazy dynamic import in
 * {@link loadToonDecoder} is the only load site.
 */
interface ToonDecoderModule {
    decode(content: string): unknown;
}

/**
 * The config-file format to load. `'auto'` (default) probes
 * `application.json` then `application.toon` per location — JSON wins on
 * collision; the other values restrict probing to one format, and
 * `BLUE_CONFIG_IMPORT` paths whose extension contradicts a restricted
 * `format` error out (imports inherit the rule, AD-66 D-2). TOON files
 * follow spec v4.1 and decode through the optional `@toon-format/toon` peer
 * (see {@link StandardConfigFileLoader}).
 */
export type ConfigFileFormat = 'auto' | 'json' | 'toon';

/**
 * Options accepted by {@link StandardConfigFileLoader}.
 */
export interface ConfigFileLoaderOptions {
    /**
     * The file reader seam. `null` (the default) disables file loading — used
     * by browser environments and specs.
     */
    reader?: ConfigFileReader | null;
    /**
     * `./config/`, `./` by default; overridden by `BLUE_CONFIG_LOCATION`
     * (comma-separated directories). `optional:` prefixes are honored.
     */
    locations?: string[];
    /**
     * The base file name (without directory or extension). Defaults to
     * `application`.
     */
    baseName?: string;
    /**
     * Which file format(s) to probe. Defaults to `'auto'` (JSON first, then
     * TOON). See {@link ConfigFileFormat}.
     */
    format?: ConfigFileFormat;
    /**
     * TOON decoder seam. Defaults to a lazy `import('@toon-format/toon')`
     * (the optional peer). Injectable for specs and alternative validators;
     * must return the plain JSON object the document decodes to. TOON strict
     * mode (spec §14) is the default of the reference decoder.
     */
    decodeToon?: (content: string) => JSONObject | Promise<JSONObject>;
}

const DEFAULT_LOCATIONS = ['./config/', './'];

/**
 * Lazy loader for the optional `@toon-format/toon` peer. DELIBERATE dynamic
 * import (exception to the static-import rule): consumers without the
 * optional peer keep zero install/build cost — a static import would fail
 * their builds. The literal specifier plus `@vite-ignore` keeps the module a
 * *declared, scannable* runtime dependency while bundlers skip it.
 * `toon-spec: 4.1` (https://github.com/toon-format/spec).
 */
const loadToonDecoder = async (): Promise<(content: string) => JSONObject> => {
    let peer: ToonDecoderModule;
    try {
        peer = (await import(/* @vite-ignore */ '@toon-format/toon')) as ToonDecoderModule;
    } catch (cause) {
        // Every resolution failure maps to "not installed": the peer is
        // optional, so a missing/corrupt install is the expected case. A
        // version whose exports changed surfaces through the shape check
        // below instead of a misleading "not valid TOON" at parse time.
        throw new IllegalStateError(
            'A .toon config file was found, but the optional "@toon-format/toon" dependency is not installed. ' +
                `Install it (e.g. \`npm i @toon-format/toon@${TOON_PEER_VERSION}\`) to use TOON config files.`,
            { cause }
        );
    }
    if (typeof peer.decode !== 'function') {
        throw new IllegalStateError(
            `The installed "@toon-format/toon" does not expose the expected decode() export — expected v${TOON_PEER_VERSION}. ` +
                `Reinstall it (e.g. \`npm i @toon-format/toon@${TOON_PEER_VERSION}\`).`
        );
    }
    return peer.decode as unknown as (content: string) => JSONObject;
};

const withTrailingSlash = (location: string): string => (location.endsWith('/') ? location : `${location}/`);

const stripPrefix = (location: string): { path: string; optional: boolean; required: boolean } => ({
    path: location.replace(/^(optional|required):/, ''),
    optional: location.startsWith('optional:'),
    required: location.startsWith('required:'),
});

/**
 * Recursively merges `override` into `base` (mutates a copy of `base`):
 * objects merge, scalars override, **arrays replace**.
 */
export function mergeConfig(base: JSONObject, override: JSONObject): JSONObject {
    const result: JSONObject = { ...base };
    for (const key of Object.keys(override)) {
        const value = override[key];
        const existing = result[key];
        if (isPlainObject(existing) && isPlainObject(value)) {
            result[key] = mergeConfig(existing as JSONObject, value as JSONObject);
        } else {
            result[key] = value; // scalars override, arrays replace
        }
    }
    return result;
}

const isPlainObject = (value: unknown): boolean => value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Decoder diagnostics quote input slices, and config files routinely hold
 * credentials — bound the message and strip control characters before it
 * enters an error/log (AD-66, SEC parity with the JSON path's bounded
 * `JSON.parse` message).
 */
const MAX_DECODER_MESSAGE_CHARS = 200;
const sanitizeDecoderMessage = (message: string): string => {
    // oxlint-disable-next-line no-control-regex -- stripping control characters from diagnostics is the purpose of this sanitizer.
    const printable = message.replace(/[\u0000-\u001f\u007f]/g, ' ');
    return printable.length > MAX_DECODER_MESSAGE_CHARS
        ? `${printable.slice(0, MAX_DECODER_MESSAGE_CHARS - 3)}...`
        : printable;
};

/**
 * Loads `application.json` / `application-{profile}.json` (and, when
 * `format` is `'auto'` or `'toon'`, `application.toon` /
 * `application-{profile}.toon` — JSON wins the collision) config files into
 * a `ConfigurableEnvironment`, orchestrated by boot AFTER profiles are
 * applied and BEFORE CLI/builder wiring (CLI > boot > files > env >
 * defaults). See AD-66: TOON is an opt-in, decode-only authoring format;
 * JSON stays the default.
 */
export class StandardConfigFileLoader {
    #reader: ConfigFileReader | null;
    #locations: string[];
    #baseName: string;
    #format: ConfigFileFormat;
    #decodeToon: ((content: string) => JSONObject | Promise<JSONObject>) | null;

    constructor(options: ConfigFileLoaderOptions = {}) {
        this.#reader = options.reader ?? null;
        this.#locations =
            options.locations ?? (process.env.BLUE_CONFIG_LOCATION || DEFAULT_LOCATIONS.join(',')).split(',');
        this.#baseName = options.baseName ?? 'application';
        this.#format = options.format ?? 'auto';
        this.#decodeToon = options.decodeToon ?? null;
    }

    /**
     * Loads the config files into the given environment: base file first,
     * then per-active-profile files (later profiles higher precedence), then
     * `BLUE_CONFIG_IMPORT` files. Each becomes a named source in registry
     * order (first = lowest precedence).
     *
     * @param environment - The environment to load into.
     * @returns The number of files loaded.
     */
    async load(environment: ConfigurableEnvironment): Promise<number> {
        const reader = this.#reader;
        if (!reader) return 0;

        const sources = environment.getPropertySources();
        let count = 0;

        const loadFile = async (path: string, required: boolean): Promise<boolean> => {
            const content = await reader(path);
            if (content === null) {
                if (required) {
                    throw new IllegalStateError(`Required config file not found: ${path}`);
                }
                return false;
            }
            const parsed = path.endsWith('.toon')
                ? await this.#parseToon(content, path)
                : (JSON.parse(content) as JSONObject);
            // All files (base + profile variants) deep-merge into ONE
            // `application` source: later files (profiles) override earlier
            // ones (objects merge, scalars override, arrays replace). Nested
            // objects across files would otherwise be shadowed by
            // whole-subtree first-wins in the chain.
            const existing = sources.get(this.#baseName)?.properties;
            if (existing) {
                sources.replace(this.#baseName, mergeConfig(existing as JSONObject, parsed));
            } else {
                sources.addLast(this.#baseName, parsed);
            }
            count++;
            return true;
        };

        const addLocation = async (fileName: string): Promise<boolean> => {
            // First-present-wins per file across locations; no cross-location merge.
            const probes: ConfigFileFormat[] = this.#format === 'auto' ? ['json', 'toon'] : [this.#format];
            const probeNames = probes.map((format) => `${fileName}.${format}`);
            for (const rawLocation of this.#locations) {
                const { path: location, optional, required } = stripPrefix(rawLocation.trim());
                // `required:` covers the probed formats as a pair: fail fast for
                // this location only after both probes missed it, so a later
                // location cannot silently substitute (original semantics).
                const effectiveRequired = required && !optional;
                for (const format of probes) {
                    // oxlint-disable-next-line no-await-in-loop -- formats are probed in order so JSON wins the collision; locations must be probed in order so an earlier hit stops the search.
                    if (await loadFile(`${withTrailingSlash(location)}${fileName}.${format}`, false)) {
                        return true;
                    }
                }
                if (effectiveRequired) {
                    throw new IllegalStateError(
                        `Required config file not found: ${probeNames.join(' / ')} in ${this.#locations.join(', ')}`
                    );
                }
            }
            return false;
        };

        await addLocation(this.#baseName);
        // Profile order is meaningful: later profiles must not shadow earlier
        // ones, so each is resolved (and may throw) before the next loads.
        for (const profile of environment.activeProfiles) {
            // oxlint-disable-next-line no-await-in-loop -- activeProfiles are first-present-wins and ordered; parallelizing would race the merge semantics.
            await addLocation(`${this.#baseName}-${profile}`);
        }

        const importValue = process.env.BLUE_CONFIG_IMPORT;
        if (importValue) {
            // Imports load in declaration order and share the same
            // first-present-wins source chain, so they must stay sequential.
            for (const spec of importValue.split(',')) {
                const trimmed = spec.trim();
                if (!trimmed) continue;
                const { path, optional } = stripPrefix(trimmed);
                // A restricted `format` admits one parser; an import whose
                // extension contradicts it must not sidestep the option
                // (AD-66 D-2: imports inherit the `format` rule).
                if (this.#format !== 'auto') {
                    const actual = path.endsWith('.toon') ? 'toon' : 'json';
                    if (actual !== this.#format) {
                        throw new IllegalStateError(
                            `BLUE_CONFIG_IMPORT file "${path}" is ${actual.toUpperCase()} but the loader's format option is '${this.#format}'. ` +
                                'Remove the format option or convert the file.'
                        );
                    }
                }
                // oxlint-disable-next-line no-await-in-loop -- imports resolve into one ordered source chain; parallel loads would race last-writer semantics.
                await loadFile(path, !optional);
            }
        }

        return count;
    }

    /**
     * Decodes a `.toon` document (spec v4.1) into the JSON object the
     * property-source merge consumes. Strict mode is the reference decoder's
     * default, so duplicate sibling keys and count/width mismatches error
     * (§14) — cross-file profile merging is unaffected: it happens after
     * decode, on the `application` source, with the usual object-merge /
     * array-replace semantics. The JSON path intentionally keeps its raw
     * `JSON.parse` errors; TOON errors carry the file path and a sanitized,
     * truncated decoder message.
     */
    async #parseToon(content: string, path: string): Promise<JSONObject> {
        // A JSON document pasted or renamed into a .toon file is the format's
        // most plausible authoring slip. TOON would decode `{"a": 1}` as an
        // ordinary key: value line (key `{"a"`, value `1}`) — a silent,
        // garbage object — so reject `{`/`[`-leading documents up front with
        // a rename hint. `[N]:` array-form roots also start with `[`; they
        // are invalid for config anyway (shape guard below), so the hint
        // costs nothing on the valid-to-TOON path.
        const first = content.trimStart()[0];
        if (first === '{' || first === '[') {
            throw new IllegalStateError(
                `Config file "${path}" starts like a JSON document but has a .toon extension. ` +
                    'TOON is line/indentation-based: rename the file to .json or convert its contents.'
            );
        }
        const decode = this.#decodeToon ?? (await loadToonDecoder());
        let parsed: unknown;
        try {
            parsed = await decode(content);
        } catch (cause) {
            throw new IllegalStateError(
                `Config file "${path}" is not valid TOON: ${sanitizeDecoderMessage(getErrorMessage(cause))}`,
                { cause }
            );
        }
        if (!isPlainObject(parsed)) {
            throw new IllegalStateError(
                `Config file "${path}" must decode to a TOON object (got ${Array.isArray(parsed) ? 'an array' : typeof parsed})`
            );
        }
        return parsed as JSONObject;
    }
}
