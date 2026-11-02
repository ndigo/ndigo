/**
 * Dev-port scanning for the app generator (AD-85).
 *
 * A generated app must not reuse a dev port that a sibling app already
 * claims, because the ports are the ladder's run-everything contract (see
 * `apps/README.md`). The scan reads every `.ts`/`.mts`/`.mjs`/`.json` file
 * under `apps/NN-*` (install and build output skipped) and understands the
 * five conventions in use across the ladder:
 *
 * - vite `server: { port: 3001 }`
 * - `process.env.PORT ??= '3200'` (dot and bracket forms)
 * - `getEnv('PORT', '3050')`
 * - a `DEFAULT_PORT = 3040` constant
 * - the `process.env.PORT ? … : 3450` fallback expression
 *
 * Best-effort by construction: an unrecognized convention leaves its port
 * unseen, and the explicit `--port` stays the escape hatch. Extra matches
 * (preview/e2e/auxiliary ports) only make the map more conservative.
 *
 * @module blue-generators
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Tree } from '@nx/devkit';

/** The dev-port conventions the scan understands (see the module doc). */
const devPortRules: readonly RegExp[] = [
    /process\.env(?:\[['"]PORT['"]\]|\.PORT)\s*\?\?=\s*['"](\d{4,5})['"]/gu,
    /(?:port|PORT)\s*:\s*(\d{4,5})/gu,
    /getEnv\(\s*['"]PORT['"]\s*,\s*(?:String\(\s*)?['"]?(\d{4,5})/gu,
    /DEFAULT_PORT\s*=\s*(\d{4,5})/gu,
    /process\.env\.PORT\s*\?[^:\n]*:\s*(\d{4,5})/gu,
];

/** The first candidate the allocator considers. */
const PORT_BASE = 3000;

/** The upper bound of the allocator's search. */
const PORT_LIMIT = 65_535;

/** File suffixes the scan reads (source, config, and manifest shapes). */
const SCAN_SUFFIXES = ['.ts', '.mts', '.mjs', '.json'] as const;

/** Directory names the scan skips (install and build output). */
const SCAN_SKIP_DIRS = new Set(['node_modules', 'lib', 'dist', '.git']);

/**
 * Collects the dev ports already claimed by the apps.
 *
 * @param tree - The Nx tree the generator runs against.
 * @returns A map of port → the claiming app directory (first match wins).
 */
export function collectDevPorts(tree: Tree): Map<number, string> {
    const ports = new Map<number, string>();
    if (!tree.exists('apps')) {
        return ports;
    }
    for (const entry of tree.children('apps')) {
        if (!/^\d+-/u.test(entry)) {
            continue;
        }
        const appDir = `apps/${entry}`;
        for (const file of scanFiles(tree, appDir)) {
            const content = tree.read(file, 'utf-8');
            if (content === null) {
                continue;
            }
            for (const rule of devPortRules) {
                // Global rules carry `lastIndex` state — reset per file.
                rule.lastIndex = 0;
                let match: RegExpExecArray | null;
                while ((match = rule.exec(content)) !== null) {
                    const port = Number(match[1]);
                    if (!ports.has(port)) {
                        ports.set(port, appDir);
                    }
                }
            }
        }
    }
    return ports;
}

/**
 * The first free dev-port candidate: the smallest multiple of ten at or
 * above {@link PORT_BASE} that no app claims.
 *
 * @param ports - The ports in use (see {@link collectDevPorts}).
 * @returns The free port.
 * @throws Error when no slot below the port limit is free.
 */
export function nextFreePort(ports: ReadonlyMap<number, string>): number {
    for (let port = PORT_BASE; port <= PORT_LIMIT; port += 10) {
        if (!ports.has(port)) {
            return port;
        }
    }
    throw new Error('No free dev port below the port limit — pass --port explicitly');
}

/**
 * Lists the scannable files under an app directory (recursive, skip-listed).
 *
 * @param tree - The Nx tree the generator runs against.
 * @param dir - The directory to walk (tree-relative).
 * @returns The tree-relative file paths.
 */
function scanFiles(tree: Tree, dir: string): string[] {
    const files: string[] = [];
    for (const entry of tree.children(dir)) {
        if (SCAN_SKIP_DIRS.has(entry)) {
            continue;
        }
        const path = `${dir}/${entry}`;
        if (tree.isFile(path)) {
            if (SCAN_SUFFIXES.some((suffix) => entry.endsWith(suffix))) {
                files.push(path);
            }
        } else {
            files.push(...scanFiles(tree, path));
        }
    }
    return files;
}
