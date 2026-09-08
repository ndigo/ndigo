import { StandardEnvironment } from '@blue/context';
import type { ResolverOptions } from '@blue/context';
import { JSONObject, JSONValue } from '@blue/core';

/**
 * Default prefix for client-exposed `import.meta.env` keys (the Vite contract).
 */
const IMPORT_META_PREFIX = 'VITE_';

/**
 * Filters an `import.meta.env`-style object down to the client-visible keys
 * (matching the given prefix — the Vite `VITE_` contract by default).
 *
 * The allow-list IS the security boundary: anything not matching the prefix
 * never becomes a property, so stray secrets in the build environment cannot
 * leak into client reads. Exposed as a pure function for direct testing.
 *
 * @param env - The raw environment object (typically `import.meta.env`).
 * @param prefix - The key prefix to expose (default `VITE_`).
 * @returns The filtered, client-visible property map.
 */
export function filterImportMetaEnv(env: Record<string, unknown> | undefined, prefix = IMPORT_META_PREFIX): JSONObject {
    const filtered: JSONObject = {};
    if (!env) return filtered;
    for (const key of Object.keys(env)) {
        if (key.startsWith(prefix)) {
            filtered[key] = env[key] as JSONValue;
        }
    }
    return filtered;
}

/**
 * Detect Vite's `import.meta.env` (a build-time injection): registering
 * `importMetaEnv` unconditionally would reference `import.meta.env` in
 * non-Vite builds at eval/parse time. Absent → no `importMetaEnv` source.
 *
 * @param override - Explicit presence override (test seam); `undefined` = detect.
 */
const hasImportMetaEnv = (override?: boolean): boolean => {
    if (override !== undefined) return override;
    const meta = (import.meta as { env?: unknown }).env;
    return meta !== undefined && typeof meta === 'object' && meta !== null;
};

/**
 * Browser-specific environment implementation for `@blue/platform-web`
 * applications.
 *
 * Extends `StandardEnvironment` so that DI containers and bootstrap utilities
 * can discriminate between browser and Node environments by class identity
 * (e.g., `instanceof BrowserEnvironment`).
 *
 * Registers `importMetaEnv` (Vite's `import.meta.env`, `VITE_`-prefixed keys
 * only) when Vite is present; the host app may register a `bootstrap` source
 * with server-injected JSON via `getPropertySources().addLast('bootstrap',
 * data)`.
 *
 * **Secret boundary (AD-13)**: anything in `importMetaEnv` or `bootstrap` is
 * client-visible by definition — secrets belong in server-only sources and
 * are never registered on browser environments.
 */
export class BrowserEnvironment extends StandardEnvironment {
    /**
     * Creates a browser environment.
     *
     * @param propertySources - Custom property sources (higher precedence than the built-ins).
     * @param options - Resolver options (index strategy).
     * @param importMetaEnvPresent - Test seam: force import.meta.env presence
     *   detection (omit to auto-detect).
     */
    constructor(propertySources: JSONObject[] = [], options: ResolverOptions = {}, importMetaEnvPresent?: boolean) {
        super(propertySources, options);
        if (hasImportMetaEnv(importMetaEnvPresent)) {
            this.getPropertySources().addLast(
                'importMetaEnv',
                filterImportMetaEnv((import.meta as { env?: Record<string, unknown> }).env)
            );
        }
        this.getPropertySources().addLast('defaults', {});
    }
}
