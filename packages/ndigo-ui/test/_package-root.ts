/**
 * Locates the `packages/ndigo-ui` root from either the repo root or the package
 * directory. The specs run under both cwds (package `pnpm test` and the root
 * Vitest lane), so the marker file is the only reliable discriminator.
 */
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

export function packageRoot(marker: string): string {
    const found = [resolve(process.cwd(), 'packages/ndigo-ui'), resolve(process.cwd())].find((candidate) =>
        existsSync(join(candidate, marker))
    );
    if (!found) throw new Error(`Cannot locate packages/ndigo-ui (marker: ${marker}) from ${process.cwd()}`);
    return found;
}
