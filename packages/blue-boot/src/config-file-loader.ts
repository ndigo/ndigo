import { IllegalStateError, JSONObject } from '@blue/core';
import type { ConfigurableEnvironment } from '@blue/context';
import type { ConfigFileReader } from '@blue/context';

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
}

const DEFAULT_LOCATIONS = ['./config/', './'];

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
 * Loads `application.json` / `application-{profile}.json` config files into a
 * `ConfigurableEnvironment`, orchestrated by boot AFTER profiles are applied
 * and BEFORE CLI/builder wiring (CLI > boot > files > env > defaults).
 */
export class StandardConfigFileLoader {
    #reader: ConfigFileReader | null;
    #locations: string[];
    #baseName: string;

    constructor(options: ConfigFileLoaderOptions = {}) {
        this.#reader = options.reader ?? null;
        this.#locations =
            options.locations ?? (process.env.BLUE_CONFIG_LOCATION || DEFAULT_LOCATIONS.join(',')).split(',');
        this.#baseName = options.baseName ?? 'application';
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
            const parsed = JSON.parse(content) as JSONObject;
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

        const addLocation = async (fileName: string, required = false): Promise<boolean> => {
            // First-present-wins per file across locations; no cross-location merge.
            for (const rawLocation of this.#locations) {
                const { path: location, optional, required: requiredLocation } = stripPrefix(rawLocation.trim());
                required ||= requiredLocation;
                if (await loadFile(`${withTrailingSlash(location)}${fileName}.json`, required && !optional))
                    return true;
            }
            if (required) {
                throw new IllegalStateError(
                    `Required config file not found: ${fileName}.json in ${this.#locations.join(', ')}`
                );
            }
            return false;
        };

        await addLocation(this.#baseName);
        for (const profile of environment.activeProfiles) {
            await addLocation(`${this.#baseName}-${profile}`);
        }

        const importValue = process.env.BLUE_CONFIG_IMPORT;
        if (importValue) {
            for (const spec of importValue.split(',')) {
                const trimmed = spec.trim();
                if (!trimmed) continue;
                const { path, optional } = stripPrefix(trimmed);
                await loadFile(path, !optional);
            }
        }

        return count;
    }
}
