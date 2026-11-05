/**
 * The app's Drizzle data-source singleton and its URL resolution.
 *
 * The demo reads `NDIGO_DB_URL` (a relative URL resolves against the process
 * CWD), defaulting to a file next to this module
 * (`apps/04-ndigo-api/data/ndigo-api.db`, gitignored) so journaled migrations
 * and the routed store share one durable database (AD-78). The instance is
 * created lazily on first use so integration tests can pin `NDIGO_DB_URL`
 * before any request touches it.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { getEnv } from '@ndigo/context';
import { DrizzleDataSource } from '@ndigo/orm-drizzle';

/**
 * Resolves the demo's SQLite URL.
 *
 * @param defaultUrl - Override for the file-backed default (tests pin
 *   `NDIGO_DB_URL` instead).
 * @returns The URL from `NDIGO_DB_URL` or the default.
 */
export function resolveDbUrl(defaultUrl?: string): string {
    const fileUrl = `file:${fileURLToPath(new URL('../data/ndigo-api.db', import.meta.url))}`;
    return getEnv('NDIGO_DB_URL', defaultUrl ?? fileUrl) ?? fileUrl;
}

/**
 * Ensures the file-backed database's parent directory exists before the
 * first connection (libSQL fails CANTOPEN when it does not). No-op for
 * non-`file:` URLs (e.g. `:memory:`).
 */
export async function ensureDbDir(): Promise<void> {
    const url = resolveDbUrl();
    if (!url.startsWith('file:')) return;
    await mkdir(dirname(url.slice('file:'.length)), { recursive: true });
}

let dataSource: DrizzleDataSource | null = null;

/**
 * The app's singleton Drizzle data source.
 *
 * @returns The shared instance.
 */
export function getDrizzleDataSource(): DrizzleDataSource {
    dataSource ??= new DrizzleDataSource({ url: resolveDbUrl() });
    return dataSource;
}
