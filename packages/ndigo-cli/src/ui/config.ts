/**
 * Reads and writes `ndigo.ui.json`, resolves the registry source and aliases,
 * and maps registry target placeholders to application paths.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { usageError } from '../helpers/app-scripts.js';
import { normalizeRegistrySource } from './registry.js';

/** The consumer configuration file. */
export const UI_CONFIG_FILE = 'ndigo.ui.json';

/** The install lockfile. */
export const UI_LOCK_FILE = 'ui.lock.json';

/** The default registry (GitHub serves the repository root registry). */
export const DEFAULT_REGISTRY_SOURCE = 'https://raw.githubusercontent.com/ndigo/ndigo/main/registry.json';

/**
 * Filesystem aliases used to resolve registry targets.
 */
export interface UiAliases {
    /** Directory for `@ui/` targets. */
    readonly ui: string;
    /** Directory for `@lib/` targets. */
    readonly lib: string;
    /** Directory for `@components/` targets. */
    readonly components: string;
    /** Directory for `@hooks/` targets. */
    readonly hooks: string;
}

/**
 * Contents of `ndigo.ui.json`.
 */
export interface UiConfig {
    /** Root registry source (path or URL). */
    readonly registry?: string;
    /** Alias overrides. */
    readonly aliases?: Partial<UiAliases>;
    /** Authoring flavour (`webcomponent`, `ejs`, or `both`). */
    readonly flavour?: string;
}

/**
 * Default aliases, relative to the application directory.
 */
export const DEFAULT_ALIASES: UiAliases = {
    ui: 'src/ui',
    lib: 'src/lib',
    components: 'src/components',
    hooks: 'src/hooks',
};

const targetPattern = /^@(ui|lib|components|hooks)\/(.+)$/u;

/**
 * Reads `ndigo.ui.json`; absent files return `null`.
 * @param dir - Application directory.
 * @returns The configuration, or `null` when absent.
 */
export function readUiConfig(dir: string): UiConfig | null {
    const path = join(dir, UI_CONFIG_FILE);
    if (!existsSync(path)) return null;
    try {
        return JSON.parse(readFileSync(path, 'utf8')) as UiConfig;
    } catch {
        throw usageError(`invalid JSON in ${path}`);
    }
}

/**
 * Writes `ndigo.ui.json` with defaults filled in.
 * @param dir - Application directory.
 * @param config - Configuration to write.
 * @param force - Overwrite an existing file.
 * @returns The written path.
 */
export function writeUiConfig(dir: string, config: UiConfig, force: boolean): string {
    const path = join(dir, UI_CONFIG_FILE);
    if (existsSync(path) && !force) {
        throw usageError(`${path} already exists (use --force to overwrite)`);
    }
    const payload = {
        $schema: 'https://ndigo.dev/schema/ndigo.ui.json',
        registry: config.registry ?? DEFAULT_REGISTRY_SOURCE,
        aliases: { ...DEFAULT_ALIASES, ...config.aliases },
        ...(config.flavour === undefined ? {} : { flavour: config.flavour }),
    };
    writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
    return path;
}

/**
 * Resolves the full alias table for an application.
 * @param dir - Application directory.
 * @returns Defaults merged with the configuration overrides.
 */
export function resolveAliases(dir: string): UiAliases {
    return { ...DEFAULT_ALIASES, ...readUiConfig(dir)?.aliases };
}

/**
 * Resolves the registry source: an explicit flag, the config, or the default.
 * @param dir - Application directory (for the config lookup).
 * @param flag - `--registry` value, when provided.
 * @returns The normalized registry source.
 */
export function resolveRegistrySource(dir: string, flag?: string): string {
    if (flag !== undefined) return normalizeRegistrySource(flag);
    return normalizeRegistrySource(readUiConfig(dir)?.registry ?? DEFAULT_REGISTRY_SOURCE);
}

/**
 * Maps a registry target placeholder to an application-relative path.
 * @param target - Target from the registry item, e.g. `@ui/nd-dialog/nd-dialog.ts`.
 * @param aliases - Alias table.
 * @returns The application-relative path.
 */
export function resolveTargetPath(target: string, aliases: UiAliases): string {
    const match = targetPattern.exec(target);
    if (match === null) {
        if (target.startsWith('@')) throw usageError(`unknown registry target '${target}'`);
        return target;
    }
    const kind = match[1] as keyof UiAliases;
    return join(aliases[kind], match[2]);
}
