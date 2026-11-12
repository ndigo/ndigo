/**
 * Config-file reader backed by the Node file system.
 */
import { readFile } from 'node:fs/promises';
import type { ConfigFileReader } from '@ndigo/context';

/**
 * The Node default for the `ConfigFileReader` seam: reads UTF-8 and maps a
 * missing file to `null` (which `StandardConfigFileLoader` treats as "probe
 * the next location/format"). Any other error (EACCES, EISDIR, …) rethrows —
 * a real filesystem problem fails boot instead of silently skipping
 * configuration.
 *
 * `createNodeApplication` wires it by default; callers assembling the loader
 * themselves pass it explicitly:
 * `new StandardConfigFileLoader({ reader: nodeConfigFileReader })`.
 *
 * @param path - The config file path to read.
 * @returns The file contents, or `null` when the file does not exist.
 */
export const nodeConfigFileReader: ConfigFileReader = async (path: string) => {
    try {
        return await readFile(path, 'utf8');
    } catch (error) {
        if ((error as { code?: string }).code === 'ENOENT') return null;
        throw error;
    }
};
