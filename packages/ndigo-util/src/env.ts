/**
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * Reads an environment variable, returning `fallback` when the variable is
 * unset. The single accessor for direct `process.env` reads (C-14): it is
 * safe in environments without a `process` global (browser/worker bundles),
 * where the fallback (or `undefined`) is returned instead of throwing.
 *
 * A value set to the empty string is preserved — only a missing variable
 * triggers the fallback (node `??` semantics).
 *
 * @param name - The environment variable name.
 * @param fallback - Value returned when the variable is unset.
 * @returns The variable value, or `fallback` when unset.
 */
export function getEnv(name: string, fallback?: string): string | undefined {
    return (typeof process !== 'undefined' && process.env ? process.env[name] : undefined) ?? fallback;
}

/**
 * True when runtime warnings are desired: any environment except an explicit
 * production build. Guards against referencing `process` in environments
 * where it is absent (e.g. some browser/worker bundles).
 */
export function isDevMode(): boolean {
    return typeof process !== 'undefined' && !!process.env && getEnv('NODE_ENV') !== 'production';
}
